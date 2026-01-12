from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.strava_service import StravaService
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.api.deps import get_current_user
from typing import Dict, Any
from datetime import datetime



router = APIRouter(prefix="/auth", tags=["authentication"])
strava_service = StravaService()


@router.get("/strava/authorize")
async def authorize_strava():
    """Genera l'URL di autorizzazione per Strava"""
    try:
        auth_url = strava_service.get_authorization_url()
        return {"authorization_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating authorization URL: {str(e)}")


@router.get("/strava/callback")
async def strava_callback(
    code: str = Query(..., description="Authorization code from Strava"),
    db: Session = Depends(get_db)
):
    """Gestisce il callback di autorizzazione di Strava"""
    try:
        print(f"CODE RICEVUTO DAL FRONTEND: {code}")
        
        # Scambia il codice con i token
        token_response = strava_service.exchange_code_for_token(code)
        
        # Ottieni le informazioni dell'atleta
        athlete_info = strava_service.get_athlete_info(token_response['access_token'])
        
        # Controlla se l'utente esiste già
        existing_user = db.query(User).filter(User.strava_id == athlete_info['id']).first()
        
        if existing_user:
            # Aggiorna i token dell'utente esistente
            existing_user.access_token = token_response['access_token']
            existing_user.refresh_token = token_response['refresh_token']
            existing_user.expires_at = datetime.fromtimestamp(token_response['expires_at'])
            db.commit()
            user = existing_user
        else:
            # Crea un nuovo utente
            user_data = UserCreate(
                strava_id=athlete_info['id'],
                first_name=athlete_info['firstname'],
                last_name=athlete_info['lastname'],
                profile_picture_url=athlete_info['profile'],
                access_token=token_response['access_token'],
                refresh_token=token_response['refresh_token'],
                expires_at=token_response['expires_at']
            )
            
            user = User(**user_data.dict())
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Genera JWT token
        from app.core import security
        access_token = security.create_access_token(user.id)
        
        return {
            "message": "Authentication successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "strava_id": user.strava_id,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
        
    except HTTPException as http_exc:
        print("HTTPException:", http_exc.detail)
        raise http_exc
    except Exception as e:
        print("ERRORE CALLBACK STRAVA:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/user/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Ottiene le informazioni dell'utente corrente"""
    return {
        "id": current_user.id,
        "strava_id": current_user.strava_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture_url": current_user.profile_picture_url,
        "last_sync_timestamp": current_user.last_sync_timestamp
    }


@router.get("/user/{user_id}")
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Ottiene le informazioni di un utente specifico per ID.
    Richiesto dal frontend per il caricamento iniziale se l'ID è salvato nel localStorage.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "strava_id": user.strava_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "strava_profile_url": user.strava_profile_url,
        "profile_picture_url": user.profile_picture_url,
        "last_sync_timestamp": user.last_sync_timestamp
    }


@router.post("/user/{user_id}/profile-image")
async def upload_profile_image(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a custom profile image"""
    from fastapi import File, UploadFile, Request
    from app.core.config import settings
    import uuid
    from pathlib import Path
    
    # Verify user is updating their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    # This endpoint now expects the file to be sent via fetch with FormData
    # The actual implementation is handled by the request body
    raise HTTPException(status_code=400, detail="Please use multipart/form-data to upload file")


from fastapi import File, UploadFile

@router.post("/user/{user_id}/upload-image")
async def upload_user_profile_image(
    user_id: int,
    profile_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a custom profile image - proper multipart upload"""
    from app.core.config import settings
    import uuid
    from pathlib import Path
    
    # Verify user is updating their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    # Validate file type
    if profile_image.content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(settings.allowed_image_types)}"
        )
    
    # Validate file size
    contents = await profile_image.read()
    if len(contents) > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_upload_size / 1024 / 1024}MB"
        )
    
    # Generate unique filename
    file_extension = profile_image.filename.split('.')[-1] if '.' in profile_image.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = Path(settings.upload_dir) / "profile_images" / filename
    
    # Save the file
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("wb") as buffer:
        buffer.write(contents)
    
    # Delete old profile image if exists
    if current_user.profile_picture_url:
        old_file_path = Path(current_user.profile_picture_url.lstrip('/'))
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Update user record
    profile_url = f"/uploads/profile_images/{filename}"
    current_user.profile_picture_url = profile_url
    db.commit()
    
    return {
        "message": "Profile image uploaded successfully",
        "profile_picture_url": profile_url
    }


@router.delete("/user/{user_id}/profile-image")
async def delete_profile_image(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete custom profile image"""
    from pathlib import Path
    
    # Verify user is updating their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    if not current_user.profile_picture_url:
        raise HTTPException(status_code=404, detail="No profile image to delete")
    
    # Delete the file
    file_path = Path(current_user.profile_picture_url.lstrip('/'))
    if file_path.exists():
        file_path.unlink()
    
    # Update user record
    current_user.profile_picture_url = None
    db.commit()
    
    return {"message": "Profile image deleted successfully"}


@router.post("/user/{user_id}/refresh-strava-avatar")
async def refresh_strava_avatar(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh Strava profile picture from Strava API"""
    # Verify user is updating their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    try:
        # Get fresh athlete info from Strava
        athlete_info = strava_service.get_athlete_info(current_user.access_token)
        
        # Update strava profile URL
        current_user.strava_profile_url = athlete_info.get('profile')
        db.commit()
        
        return {
            "message": "Strava avatar refreshed successfully",
            "strava_profile_url": current_user.strava_profile_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh Strava avatar: {str(e)}")


@router.get("/user/{user_id}/settings")
async def get_user_settings(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings"""
    from app.schemas.user import UserSettings
    
    # Verify user is accessing their own settings
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these settings")
    
    # Return settings or defaults
    if current_user.settings:
        return current_user.settings
    else:
        # Return default settings
        default_settings = UserSettings()
        return default_settings.dict()


@router.put("/user/{user_id}/settings")
async def update_user_settings(
    user_id: int,
    settings: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings"""
    from app.schemas.user import UserSettings
    
    # Verify user is updating their own settings
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update these settings")
    
    # Validate settings
    try:
        validated_settings = UserSettings(**settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid settings format: {str(e)}")
    
    # Update user settings
    current_user.settings = validated_settings.dict()
    db.commit()
    
    return {
        "message": "Settings updated successfully",
        "settings": current_user.settings
    }


@router.get("/user/{user_id}/export")
async def export_user_data(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all user data as JSON"""
    from app.models.activity import Activity
    from fastapi.responses import JSONResponse
    
    # Verify user is exporting their own data
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to export this data")
    
    # Get all user activities
    activities = db.query(Activity).filter(Activity.user_id == user_id).all()
    
    # Build export data
    export_data = {
        "export_date": datetime.utcnow().isoformat(),
        "user": {
            "id": current_user.id,
            "strava_id": current_user.strava_id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "settings": current_user.settings or {},
        "activities": [
            {
                "id": activity.id,
                "strava_activity_id": activity.strava_activity_id,
                "name": activity.name,
                "distance": activity.distance,
                "moving_time": activity.moving_time,
                "elapsed_time": activity.elapsed_time,
                "total_elevation_gain": activity.total_elevation_gain,
                "type": activity.type,
                "start_date": activity.start_date.isoformat() if activity.start_date else None,
                "average_speed": activity.average_speed,
                "max_speed": activity.max_speed,
                "average_heartrate": activity.average_heartrate,
                "max_heartrate": activity.max_heartrate,
                "average_cadence": activity.average_cadence,
                "average_watts": activity.average_watts,
            }
            for activity in activities
        ],
        "stats": {
            "total_activities": len(activities),
            "total_distance": sum(a.distance for a in activities),
            "total_time": sum(a.moving_time for a in activities),
        }
    }
    
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=foxrun-export-{datetime.utcnow().strftime('%Y-%m-%d')}.json"
        }
    )


@router.delete("/user/{user_id}")
async def delete_user_account(
    user_id: int,
    confirmation: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated data (PERMANENT)"""
    from app.models.activity import Activity, Lap
    from pathlib import Path
    
    # Verify user is deleting their own account
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this account")
    
    # Require confirmation
    if confirmation != "DELETE":
        raise HTTPException(status_code=400, detail="Invalid confirmation. Please provide 'DELETE' as confirmation.")
    
    try:
        # Delete profile image if exists
        if current_user.profile_picture_url:
            file_path = Path(current_user.profile_picture_url.lstrip('/'))
            if file_path.exists():
                file_path.unlink()
        
        # Delete all laps associated with user activities
        user_activities = db.query(Activity).filter(Activity.user_id == user_id).all()
        for activity in user_activities:
            db.query(Lap).filter(Lap.activity_id == activity.id).delete()
        
        # Delete all activities
        db.query(Activity).filter(Activity.user_id == user_id).delete()
        
        # Delete user
        db.delete(current_user)
        db.commit()
        
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")