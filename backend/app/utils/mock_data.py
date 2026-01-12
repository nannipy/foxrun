import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


def generate_mock_activities(count: int = 50) -> List[Dict[str, Any]]:
    """Genera attività mock realistiche"""
    activities = []
    
    # Date di inizio (ultimi 6 mesi)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    # Tipi di attività
    activity_types = ["Run", "Ride", "Walk"]
    
    # Nomi di attività
    activity_names = [
        "Morning Run", "Evening Run", "Long Run", "Tempo Run", "Easy Run",
        "Recovery Run", "Hill Training", "Speed Work", "Long Distance",
        "Trail Run", "City Run", "Park Run", "Beach Run", "Mountain Run"
    ]
    
    for i in range(count):
        # Genera una data casuale
        activity_date = start_date + timedelta(
            days=random.randint(0, (end_date - start_date).days)
        )
        
        # Genera distanza (5-42 km per corse)
        distance = random.uniform(5.0, 42.0) * 1000  # in metri
        
        # Genera tempo basato sulla distanza e velocità
        pace_min_per_km = random.uniform(4.5, 7.0)  # minuti per km
        moving_time = int((distance / 1000) * pace_min_per_km * 60)  # in secondi
        
        # Aggiungi tempo extra per pause
        elapsed_time = moving_time + random.randint(0, 300)
        
        # Genera dislivello (0-500m)
        elevation_gain = random.uniform(0, 500)
        
        # Genera velocità
        average_speed = distance / moving_time  # m/s
        max_speed = average_speed * random.uniform(1.2, 1.5)
        
        # Genera frequenza cardiaca
        avg_hr = random.randint(140, 180)
        max_hr = avg_hr + random.randint(10, 30)
        
        # Genera cadenza
        cadence = random.randint(160, 190)
        
        # Genera polyline semplificata (solo per esempio)
        polyline = generate_simple_polyline()
        
        activity = {
            "id": i + 1,
            "strava_activity_id": random.randint(1000000, 9999999),
            "user_id": 1,
            "name": random.choice(activity_names),
            "distance": distance,
            "moving_time": moving_time,
            "elapsed_time": elapsed_time,
            "total_elevation_gain": elevation_gain,
            "type": random.choice(activity_types),
            "start_date": activity_date.isoformat(),
            "average_speed": average_speed,
            "max_speed": max_speed,
            "average_heartrate": avg_hr,
            "max_heartrate": max_hr,
            "average_cadence": cadence,
            "average_watts": random.randint(200, 400) if random.random() > 0.5 else None,
            "map_polyline": polyline,
            "summary_polyline": polyline,
            "detailed_data": generate_mock_streams(distance, moving_time),
            "created_at": activity_date.isoformat(),
            "updated_at": activity_date.isoformat()
        }
        
        activities.append(activity)
    
    # Ordina per data
    activities.sort(key=lambda x: x["start_date"], reverse=True)
    
    return activities


def generate_simple_polyline() -> str:
    """Genera una polyline semplificata per la mappa"""
    # Coordinate di esempio (Milano)
    start_lat, start_lng = 45.4642, 9.1900
    
    points = []
    for i in range(10):
        lat = start_lat + random.uniform(-0.01, 0.01)
        lng = start_lng + random.uniform(-0.01, 0.01)
        points.append([lat, lng])
    
    # Codifica base64 semplificata (in realtà dovrebbe essere Google Polyline)
    return json.dumps(points)


def generate_mock_streams(distance: float, duration: int) -> str:
    """Genera stream di dati mock"""
    num_points = min(1000, int(duration / 10))  # Un punto ogni 10 secondi
    
    streams = {
        "time": list(range(0, duration, duration // num_points)),
        "distance": [distance * i / num_points for i in range(num_points)],
        "latlng": generate_coordinates(num_points),
        "altitude": [random.uniform(100, 200) for _ in range(num_points)],
        "velocity_smooth": [random.uniform(2.5, 4.0) for _ in range(num_points)],
        "heartrate": [random.randint(140, 180) for _ in range(num_points)],
        "cadence": [random.randint(160, 190) for _ in range(num_points)]
    }
    
    return json.dumps(streams)


def generate_coordinates(num_points: int) -> List[List[float]]:
    """Genera coordinate GPS realistiche"""
    start_lat, start_lng = 45.4642, 9.1900  # Milano
    coordinates = []
    
    for i in range(num_points):
        # Simula un percorso che si muove gradualmente
        lat = start_lat + (i * 0.0001) + random.uniform(-0.0001, 0.0001)
        lng = start_lng + (i * 0.0001) + random.uniform(-0.0001, 0.0001)
        coordinates.append([lat, lng])
    
    return coordinates


def generate_mock_user() -> Dict[str, Any]:
    """Genera un utente mock"""
    return {
        "id": 1,
        "strava_id": 12345678,
        "first_name": "Mario",
        "last_name": "Rossi",
        "profile_picture_url": "https://example.com/profile.jpg",
        "last_sync_timestamp": datetime.now().isoformat(),
        "created_at": (datetime.now() - timedelta(days=30)).isoformat(),
        "updated_at": datetime.now().isoformat()
    }


def generate_mock_stats() -> Dict[str, Any]:
    """Genera statistiche mock"""
    return {
        "total_activities": 45,
        "total_distance": 1250000,  # 1250 km in metri
        "total_time": 4320000,  # 1200 ore in secondi
        "total_elevation": 8500,  # 8.5 km di dislivello
        "average_pace": 5.76  # minuti per km
    }


def generate_mock_trends() -> Dict[str, Any]:
    """Genera tendenze mock"""
    trends = {}
    end_date = datetime.now()
    
    for i in range(30):  # Ultimi 30 giorni
        date = end_date - timedelta(days=i)
        key = date.strftime("%Y-%m-%d")
        
        # Simula variazioni giornaliere
        if random.random() > 0.3:  # 70% di probabilità di avere un'attività
            trends[key] = {
                "distance": random.uniform(5000, 15000),  # 5-15 km
                "time": random.randint(1800, 5400),  # 30-90 minuti
                "activities": random.randint(1, 2),
                "elevation": random.uniform(50, 300)
            }
        else:
            trends[key] = {
                "distance": 0,
                "time": 0,
                "activities": 0,
                "elevation": 0
            }
    
    return {
        "period": "month",
        "trends": trends
    }


if __name__ == "__main__":
    # Genera e salva i dati mock
    mock_data = {
        "user": generate_mock_user(),
        "activities": generate_mock_activities(50),
        "stats": generate_mock_stats(),
        "trends": generate_mock_trends()
    }
    
    with open("mock_data.json", "w") as f:
        json.dump(mock_data, f, indent=2)
    
    print("Dati mock generati e salvati in mock_data.json") 