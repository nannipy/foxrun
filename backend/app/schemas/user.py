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
    profile_picture_url: Optional[str] = None
    last_sync_timestamp: Optional[datetime] = None
    settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Settings schemas
class NotificationSettings(BaseModel):
    email: bool = True
    push: bool = False
    weeklyReport: bool = True
    achievements: bool = True


class PrivacySettings(BaseModel):
    profilePublic: bool = False
    showStats: bool = True
    showActivities: bool = True


class DisplaySettings(BaseModel):
    theme: str = "system"  # light, dark, system
    units: str = "metric"  # metric, imperial
    language: str = "it"  # it, en


class SyncSettings(BaseModel):
    autoSync: bool = True
    syncInterval: str = "daily"  # hourly, daily, weekly


class UserSettings(BaseModel):
    notifications: NotificationSettings = NotificationSettings()
    privacy: PrivacySettings = PrivacySettings()
    display: DisplaySettings = DisplaySettings()
    sync: SyncSettings = SyncSettings()


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
 