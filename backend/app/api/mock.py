import json
import os
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/mock", tags=["mock"])

def load_mock_data() -> Dict[str, Any]:
    """Carica i dati mock dal file JSON"""
    mock_file = os.path.join(os.path.dirname(__file__), "..", "utils", "mock_data.json")
    try:
        with open(mock_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "user": None,
            "activities": [],
            "stats": {
                "total_activities": 0,
                "total_distance": 0,
                "total_time": 0,
                "total_elevation": 0,
                "average_pace": 0
            },
            "trends": {
                "period": "month",
                "trends": {}
            }
        }

def load_my_data() -> Dict[str, Any]:
    """Carica i dati personali dal file JSON"""
    my_data_file = os.path.join(os.path.dirname(__file__), "..", "..", "my_data.json")
    try:
        with open(my_data_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "user": {
                "id": 1,
                "strava_id": None,
                "first_name": "Il tuo nome",
                "last_name": "Il tuo cognome",
                "profile_picture_url": null,
                "last_sync_timestamp": null,
                "created_at": "2025-01-20T10:00:00.000000",
                "updated_at": "2025-01-20T10:00:00.000000"
            },
            "activities": []
        }

def save_my_data(data: Dict[str, Any]):
    """Salva i dati personali nel file JSON"""
    my_data_file = os.path.join(os.path.dirname(__file__), "..", "..", "my_data.json")
    with open(my_data_file, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@router.get("/user")
async def get_mock_user():
    """Restituisce i dati mock dell'utente"""
    data = load_mock_data()
    return data.get("user")

@router.get("/activities")
async def get_mock_activities():
    """Restituisce le attività mock"""
    data = load_mock_data()
    return {
        "activities": data.get("activities", []),
        "total": len(data.get("activities", [])),
        "skip": 0,
        "limit": 50
    }

@router.get("/stats")
async def get_mock_stats():
    """Restituisce le statistiche mock"""
    data = load_mock_data()
    return data.get("stats")

@router.get("/trends")
async def get_mock_trends():
    """Restituisce le tendenze mock"""
    data = load_mock_data()
    return data.get("trends")

@router.get("/activity/{activity_id}")
async def get_mock_activity_detail(activity_id: int):
    """Restituisce i dettagli di un'attività mock"""
    data = load_mock_data()
    activities = data.get("activities", [])
    
    for activity in activities:
        if activity["id"] == activity_id:
            return activity
    
    return {"error": "Activity not found"}

# Endpoint per i dati personali
@router.get("/my/user")
async def get_my_user():
    """Restituisce i dati personali dell'utente"""
    data = load_my_data()
    return data.get("user")

@router.get("/my/activities")
async def get_my_activities():
    """Restituisce le attività personali"""
    data = load_my_data()
    return {
        "activities": data.get("activities", []),
        "total": len(data.get("activities", [])),
        "skip": 0,
        "limit": 50
    }

@router.post("/my/activities")
async def add_my_activity(activity: Dict[str, Any]):
    """Aggiunge una nuova attività personale"""
    data = load_my_data()
    activities = data.get("activities", [])
    
    # Genera un nuovo ID
    new_id = max([act.get("id", 0) for act in activities], default=0) + 1
    
    # Aggiungi l'attività
    activity["id"] = new_id
    activity["user_id"] = 1
    activities.append(activity)
    
    data["activities"] = activities
    save_my_data(data)
    
    return activity

@router.put("/my/user")
async def update_my_user(user_data: Dict[str, Any]):
    """Aggiorna i dati personali dell'utente"""
    data = load_my_data()
    data["user"].update(user_data)
    data["user"]["updated_at"] = "2025-01-20T10:00:00.000000"
    save_my_data(data)
    
    return data["user"]

@router.delete("/my/activities")
async def clear_my_activities():
    """Cancella tutte le attività personali"""
    data = load_my_data()
    data["activities"] = []
    save_my_data(data)
    
    return {"message": "Tutte le attività sono state cancellate"} 