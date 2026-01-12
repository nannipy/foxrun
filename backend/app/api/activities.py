from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from datetime import datetime, timedelta
from typing import List, Optional
from app.db.database import get_db
from app.services.strava_service import StravaService, StravaRateLimitError
from app.models.user import User
from app.models.activity import Activity, Lap
from app.schemas.activity import Activity as ActivitySchema, ActivityWithLaps
from app.api.deps import get_current_user

router = APIRouter(prefix="/activities", tags=["activities"])
strava_service = StravaService()


@router.post("/sync")
async def sync_activities(
    after_date: Optional[datetime] = Query(None, description="Sync activities after this date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincronizza le attività di un utente da Strava"""
    try:
        # Aggiorna il token se necessario
        if not strava_service.refresh_access_token(current_user, db):
            print(f"[SYNC][ERRORE] Refresh token fallito per user_id={current_user.id}")
            raise HTTPException(status_code=401, detail="Token Strava scaduto o non valido. Ricollega il tuo account Strava dalle impostazioni.")
        
        # Sincronizza le attività
        sync_result = strava_service.sync_user_activities(db, current_user, after_date)
        
        return {
            "message": "Activities synced successfully",
            "sync_result": sync_result
        }
        
    except StravaRateLimitError as e:
        retry_after = e.retry_after or 60
        raise HTTPException(
            status_code=429, 
            detail={
                "error": "Rate limit exceeded",
                "message": str(e),
                "retry_after": retry_after,
                "retry_after_seconds": retry_after
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/sync/smart")
async def sync_activities_smart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincronizza le attività partendo dalla data dell'attività più vecchia nel database"""
    try:
        if not strava_service.refresh_access_token(current_user, db):
            raise HTTPException(status_code=401, detail="Token Strava scaduto o non valido.")
        
        oldest_activity = db.query(Activity).filter(
            Activity.user_id == current_user.id
        ).order_by(Activity.start_date.asc()).first()
        
        if oldest_activity:
            after_date = oldest_activity.start_date
            sync_result = strava_service.sync_user_activities(db, current_user, after_date)
            return {
                "message": f"Activities synced from {after_date.strftime('%Y-%m-%d')}",
                "sync_result": sync_result,
                "oldest_activity_date": after_date.isoformat()
            }
        else:
            sync_result = strava_service.sync_user_activities(db, current_user)
            return {
                "message": "No existing activities found. Syncing all activities.",
                "sync_result": sync_result
            }
        
    except StravaRateLimitError as e:
        retry_after = e.retry_after or 60
        raise HTTPException(status_code=429, detail={"retry_after": retry_after, "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart sync failed: {str(e)}")


@router.post("/sync/extend")
async def sync_activities_extend(
    months_back: int = Query(12, description="How many months back to sync"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincronizza le attività estendendo il periodo di X mesi indietro"""
    try:
        if not strava_service.refresh_access_token(current_user, db):
            raise HTTPException(status_code=401, detail="Token Strava scaduto o non valido.")
        
        oldest_activity = db.query(Activity).filter(
            Activity.user_id == current_user.id
        ).order_by(Activity.start_date.asc()).first()
        
        if oldest_activity:
            extended_date = oldest_activity.start_date - timedelta(days=months_back * 30)
            sync_result = strava_service.sync_user_activities(db, current_user, extended_date)
            return {
                "message": f"Activities synced from {extended_date.strftime('%Y-%m-%d')}",
                "sync_result": sync_result,
                "extended_from_date": extended_date.isoformat()
            }
        else:
            sync_result = strava_service.sync_user_activities(db, current_user)
            return {
                "message": "No existing activities found. Syncing all activities.",
                "sync_result": sync_result
            }
            
    except StravaRateLimitError as e:
        retry_after = e.retry_after or 60
        raise HTTPException(status_code=429, detail={"retry_after": retry_after, "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extend sync failed: {str(e)}")


@router.get("/")
async def get_user_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    start_date: Optional[datetime] = Query(None, description="Filter activities after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter activities before this date"),
    sort_by: str = Query("start_date", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottiene le attività dell'utente corrente con filtri e paginazione"""
    query = db.query(Activity).filter(Activity.user_id == current_user.id)
    
    if activity_type:
        query = query.filter(Activity.type == activity_type)
    if start_date:
        query = query.filter(Activity.start_date >= start_date)
    if end_date:
        query = query.filter(Activity.start_date <= end_date)
    
    if hasattr(Activity, sort_by):
        sort_column = getattr(Activity, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(Activity.start_date))
    
    total = query.count()
    activities = query.offset(skip).limit(limit).all()
    
    return {
        "activities": [ActivitySchema.from_orm(activity) for activity in activities],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{activity_id}")
async def get_activity_detail(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottiene i dettagli di una singola attività"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    laps = db.query(Lap).filter(Lap.activity_id == activity_id).order_by(Lap.lap_index).all()
    
    activity_data = ActivitySchema.from_orm(activity)
    response_data = activity_data.dict()
    response_data["laps"] = [{"id": lap.id, "lap_index": lap.lap_index, "distance": lap.distance, 
                             "moving_time": lap.moving_time, "average_speed": lap.average_speed, 
                             "start_date": lap.start_date} for lap in laps]
    return response_data


@router.get("/stats/summary")
async def get_user_stats(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    activity_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottiene le statistiche aggregate ottimizzate"""
    # Base query filters
    filters = [Activity.user_id == current_user.id, Activity.distance > 0]
    if activity_type:
        filters.append(Activity.type == activity_type)
    if start_date:
        filters.append(Activity.start_date >= start_date)
    if end_date:
        filters.append(Activity.start_date <= end_date)

    # Optimized aggregation query
    stats = db.query(
        func.count(Activity.id).label('count'),
        func.sum(Activity.distance).label('total_distance'),
        func.sum(Activity.moving_time).label('total_time'),
        func.sum(Activity.total_elevation_gain).label('total_elevation')
    ).filter(*filters).first()

    # Calculate run specific stats for average pace
    run_filters = [Activity.user_id == current_user.id, Activity.type.ilike('run')]
    if start_date:
        run_filters.append(Activity.start_date >= start_date)
    if end_date:
        run_filters.append(Activity.start_date <= end_date)
        
    run_stats = db.query(
        func.sum(Activity.distance).label('dist'),
        func.sum(Activity.moving_time).label('time')
    ).filter(*run_filters).first()

    average_pace = 0
    if run_stats and run_stats.dist and run_stats.dist > 0:
        average_pace = (run_stats.time / 60) / (run_stats.dist / 1000)

    # Counts by type
    total_activities_all = db.query(func.count(Activity.id)).filter(Activity.user_id == current_user.id).scalar()
    num_bike = db.query(func.count(Activity.id)).filter(Activity.user_id == current_user.id, Activity.type.ilike('ride')).scalar()
    num_tennis = db.query(func.count(Activity.id)).filter(Activity.user_id == current_user.id, Activity.type.ilike('workout')).scalar()

    return {
        "total_activities": stats.count or 0,
        "total_distance": stats.total_distance or 0,
        "total_time": stats.total_time or 0,
        "total_elevation": stats.total_elevation or 0,
        "average_pace": average_pace,
        "total_activities_all": total_activities_all or 0,
        "num_bike": num_bike or 0,
        "num_tennis": num_tennis or 0
    }


@router.get("/trends/summary")
async def get_user_trends(
    period: str = Query("month", description="Period: week, month, year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottiene le tendenze delle attività"""
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")
    
    # Questo potrebbe essere ottimizzato ulteriormente con group_by SQL, 
    # ma per ora manteniamo la logica Python per semplicità di raggruppamento date,
     # limitando però i campi selezionati.
    activities = db.query(Activity.start_date, Activity.distance, Activity.moving_time, Activity.total_elevation_gain).filter(
        Activity.user_id == current_user.id,
        Activity.start_date >= start_date
    ).order_by(Activity.start_date).all()
    
    trends = {}
    for activity in activities:
        if period == "week" or period == "month":
            key = activity.start_date.strftime("%Y-%m-%d")
        else:
            key = activity.start_date.strftime("%Y-%m")
        
        if key not in trends:
            trends[key] = {"distance": 0, "time": 0, "activities": 0, "elevation": 0}
        
        trends[key]["distance"] += activity.distance
        trends[key]["time"] += activity.moving_time
        trends[key]["activities"] += 1
        trends[key]["elevation"] += activity.total_elevation_gain or 0
    
    return {"period": period, "trends": trends} 