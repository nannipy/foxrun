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
        "profile_picture_url": user.profile_picture_url,
        "last_sync_timestamp": user.last_sync_timestamp
    }