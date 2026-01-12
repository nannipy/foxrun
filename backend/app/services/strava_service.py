import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from stravalib.client import Client
from stravalib.exc import RateLimitExceeded, ActivityUploadFailed
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.activity import Activity, Lap
from app.schemas.user import UserCreate, UserUpdate
from app.core.config import settings


class StravaRateLimitError(Exception):
    """Eccezione personalizzata per errori di rate limit"""
    def __init__(self, message: str, retry_after: Optional[int] = None):
        super().__init__(message)
        self.retry_after = retry_after


class StravaService:
    def __init__(self):
        self.client = Client()
    
    def get_authorization_url(self) -> str:
        """Genera l'URL di autorizzazione per Strava OAuth2"""
        return self.client.authorization_url(
            client_id=settings.strava_client_id,
            redirect_uri=settings.strava_redirect_uri,
            scope=['read', 'activity:read_all']
        )
    
    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Scambia il codice di autorizzazione con i token di accesso"""
        token_response = self.client.exchange_code_for_token(
            client_id=settings.strava_client_id,
            client_secret=settings.strava_client_secret,
            code=code
        )
        return token_response
    
    def get_athlete_info(self, access_token: str) -> Dict[str, Any]:
        """Ottiene le informazioni dell'atleta da Strava"""
        self.client.access_token = access_token
        athlete = self.client.get_athlete()
        return {
            'id': athlete.id,
            'firstname': athlete.firstname,
            'lastname': athlete.lastname,
            'profile': athlete.profile
        }
    
    def sync_user_activities(self, db: Session, user: User, after_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Sincronizza le attività dell'utente da Strava"""
        print(f"[SYNC] Inizio sync per user_id={user.id}, after_date={after_date}")
        self.client.access_token = user.access_token
        
        try:
            # Ottieni le attività
            activities = list(self.client.get_activities(after=after_date))
            print(f"[SYNC] Recuperate {len(activities)} attività da Strava")
            
            synced_count = 0
            updated_count = 0
            
            for strava_activity in activities:
                # Controlla se l'attività esiste già
                existing_activity = db.query(Activity).filter(
                    Activity.strava_activity_id == strava_activity.id
                ).first()
                
                if existing_activity:
                    # Aggiorna l'attività esistente
                    self._update_activity_from_strava(existing_activity, strava_activity)
                    updated_count += 1
                    print(f"[SYNC] Aggiornata attività esistente: {strava_activity.id}")
                else:
                    # Crea una nuova attività
                    new_activity = self._create_activity_from_strava(strava_activity, user.id)
                    db.add(new_activity)
                    synced_count += 1
                    print(f"[SYNC] Aggiunta nuova attività: {strava_activity.id}")
                
                # Sincronizza i laps se disponibili
                if hasattr(strava_activity, 'laps') and strava_activity.laps:
                    self._sync_activity_laps(db, strava_activity, existing_activity or new_activity)
            
            # Aggiorna il timestamp di sincronizzazione
            user.last_sync_timestamp = datetime.utcnow()
            db.commit()
            print(f"[SYNC] Commit completato. Nuove: {synced_count}, Aggiornate: {updated_count}")
            
            return {
                'synced_count': synced_count,
                'updated_count': updated_count,
                'total_activities': len(activities)
            }
            
        except RateLimitExceeded as e:
            db.rollback()
            print(f"[SYNC][ERRORE] Rate limit exceeded per Strava API: {str(e)}")
            # Estrai il timeout dall'eccezione se disponibile
            retry_after = getattr(e, 'timeout', None)
            raise StravaRateLimitError(
                f"Rate limit exceeded for Strava API. Retry after {retry_after} seconds." if retry_after else "Rate limit exceeded for Strava API.",
                retry_after
            )
        except Exception as e:
            db.rollback()
            print(f"[SYNC][ERRORE] Errore durante la sync: {str(e)}")
            raise Exception(f"Error syncing activities: {str(e)}")
    
    def _get_value(self, value) -> float:
        """Estrae il valore numerico da un oggetto quantità di Strava o restituisce il valore se è già un numero"""
        if value is None:
            return 0.0
        if hasattr(value, 'magnitude'):
            return float(value.magnitude)
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    def _get_seconds(self, value) -> int:
        """Estrae i secondi da un oggetto tempo di Strava"""
        if value is None:
            return 0
        if hasattr(value, 'total_seconds'):
            if callable(value.total_seconds):
                return int(value.total_seconds())
            # Se total_seconds è una proprietà
            return int(value.total_seconds)
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0

    def _get_type_value(self, value) -> str:
        """Estrae il valore stringa dal tipo attività"""
        if value is None:
            return "Unknown"
        # Gestione RelaxedActivityType (Pydantic model in stravalib 2.0)
        if hasattr(value, 'root'):
            return str(value.root)
        return str(value)

    def _create_activity_from_strava(self, strava_activity, user_id: int) -> Activity:
        """Crea un'attività dal modello Strava"""
        return Activity(
            strava_activity_id=strava_activity.id,
            user_id=user_id,
            name=strava_activity.name,
            distance=self._get_value(strava_activity.distance),
            moving_time=self._get_seconds(strava_activity.moving_time),
            elapsed_time=self._get_seconds(strava_activity.elapsed_time),
            total_elevation_gain=self._get_value(strava_activity.total_elevation_gain),
            type=self._get_type_value(strava_activity.type),
            start_date=strava_activity.start_date,
            average_speed=self._get_value(strava_activity.average_speed),
            max_speed=self._get_value(strava_activity.max_speed),
            average_heartrate=strava_activity.average_heartrate,
            max_heartrate=strava_activity.max_heartrate,
            average_cadence=strava_activity.average_cadence,
            average_watts=strava_activity.average_watts,
            map_polyline=strava_activity.map.polyline if strava_activity.map else None,
            summary_polyline=strava_activity.map.summary_polyline if strava_activity.map else None,
            detailed_data=self._get_activity_streams(strava_activity.id)
        )
    
    def _update_activity_from_strava(self, activity: Activity, strava_activity) -> None:
        """Aggiorna un'attività esistente con i dati di Strava"""
        activity.name = strava_activity.name
        activity.distance = self._get_value(strava_activity.distance)
        activity.moving_time = self._get_seconds(strava_activity.moving_time)
        activity.elapsed_time = self._get_seconds(strava_activity.elapsed_time)
        activity.total_elevation_gain = self._get_value(strava_activity.total_elevation_gain)
        activity.average_speed = self._get_value(strava_activity.average_speed)
        activity.max_speed = self._get_value(strava_activity.max_speed)
        activity.average_heartrate = strava_activity.average_heartrate
        activity.max_heartrate = strava_activity.max_heartrate
        activity.average_cadence = strava_activity.average_cadence
        activity.average_watts = strava_activity.average_watts
        activity.map_polyline = strava_activity.map.polyline if strava_activity.map else None
        activity.summary_polyline = strava_activity.map.summary_polyline if strava_activity.map else None
    
    def _sync_activity_laps(self, db: Session, strava_activity, activity: Activity) -> None:
        """Sincronizza i laps di un'attività"""
        if not hasattr(strava_activity, 'laps') or not strava_activity.laps:
            return
        
        # Rimuovi i laps esistenti
        db.query(Lap).filter(Lap.activity_id == activity.id).delete()
        
        # Aggiungi i nuovi laps
        for lap in strava_activity.laps:
            new_lap = Lap(
                activity_id=activity.id,
                lap_index=lap.lap_index,
                distance=self._get_value(lap.distance),
                moving_time=self._get_seconds(lap.moving_time),
                average_speed=self._get_value(lap.average_speed),
                start_date=lap.start_date
            )
            db.add(new_lap)
    
    def _get_activity_streams(self, activity_id: int) -> Optional[str]:
        """Ottiene gli stream di dati dettagliati per un'attività"""
        try:
            streams = self.client.get_activity_streams(
                activity_id,
                types=['time', 'distance', 'latlng', 'altitude', 'velocity_smooth', 'heartrate', 'cadence', 'watts'],
                resolution='high'
            )
            return json.dumps(streams)
        except Exception:
            return None
    
    def refresh_access_token(self, user: User, db: Session = None) -> bool:
        """Aggiorna il token di accesso se scaduto e salva sempre i nuovi valori nel DB"""
        if user.expires_at > datetime.utcnow():
            return True
        try:
            refresh_response = self.client.refresh_access_token(
                client_id=settings.strava_client_id,
                client_secret=settings.strava_client_secret,
                refresh_token=user.refresh_token
            )
            user.access_token = refresh_response['access_token']
            user.refresh_token = refresh_response['refresh_token']
            # expires_at di Strava è un timestamp UNIX, lo convertiamo in datetime
            user.expires_at = datetime.utcfromtimestamp(refresh_response['expires_at'])
            if db is not None:
                db.commit()
            print(f"[TOKEN] Access token aggiornato per user_id={user.id}")
            return True
        except Exception as e:
            print(f"[TOKEN][ERRORE] Errore durante il refresh del token: {str(e)}")
            return False 