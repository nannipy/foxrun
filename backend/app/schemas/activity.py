from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ActivityBase(BaseModel):
    strava_activity_id: int
    name: str
    distance: float
    moving_time: int
    elapsed_time: int
    total_elevation_gain: Optional[float] = None
    type: str
    start_date: datetime
    average_speed: Optional[float] = None
    max_speed: Optional[float] = None
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[float] = None
    average_cadence: Optional[float] = None
    average_watts: Optional[float] = None
    map_polyline: Optional[str] = None
    summary_polyline: Optional[str] = None
    detailed_data: Optional[str] = None


class ActivityCreate(ActivityBase):
    user_id: int


class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    distance: Optional[float] = None
    moving_time: Optional[int] = None
    elapsed_time: Optional[int] = None
    total_elevation_gain: Optional[float] = None
    average_speed: Optional[float] = None
    max_speed: Optional[float] = None
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[float] = None
    average_cadence: Optional[float] = None
    average_watts: Optional[float] = None
    map_polyline: Optional[str] = None
    summary_polyline: Optional[str] = None
    detailed_data: Optional[str] = None


class Activity(ActivityBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True


class LapBase(BaseModel):
    lap_index: int
    distance: float
    moving_time: int
    average_speed: Optional[float] = None
    start_date: datetime


class LapCreate(LapBase):
    activity_id: int


class Lap(LapBase):
    id: int
    activity_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True


class ActivityWithLaps(Activity):
    laps: List[Lap] = [] 