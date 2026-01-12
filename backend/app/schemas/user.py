from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    strava_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    strava_profile_url: Optional[str] = None


class UserCreate(UserBase):
    access_token: str
    refresh_token: str
    expires_at: datetime


class UserUpdate(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    last_sync_timestamp: Optional[datetime] = None


class User(UserBase):
    id: int
    last_sync_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 