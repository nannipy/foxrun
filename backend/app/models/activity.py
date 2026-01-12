from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class Activity(Base, TimestampMixin):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    strava_activity_id = Column(Integer, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    distance = Column(Float, nullable=False)  # in meters
    moving_time = Column(Integer, nullable=False)  # in seconds
    elapsed_time = Column(Integer, nullable=False)  # in seconds
    total_elevation_gain = Column(Float)  # in meters
    type = Column(String(50), nullable=False)  # 'Run', 'Ride', etc.
    start_date = Column(DateTime, nullable=False)
    average_speed = Column(Float)  # m/s
    max_speed = Column(Float)  # m/s
    average_heartrate = Column(Float)
    max_heartrate = Column(Float)
    average_cadence = Column(Float)
    average_watts = Column(Float)
    map_polyline = Column(Text)
    summary_polyline = Column(Text)
    detailed_data = Column(Text)  # JSON string for raw data streams
    
    # Relationship
    user = relationship("User", back_populates="activities")
    laps = relationship("Lap", back_populates="activity")


class Lap(Base, TimestampMixin):
    __tablename__ = "laps"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    lap_index = Column(Integer, nullable=False)
    distance = Column(Float, nullable=False)  # in meters
    moving_time = Column(Integer, nullable=False)  # in seconds
    average_speed = Column(Float)  # m/s
    start_date = Column(DateTime, nullable=False)
    
    # Relationship
    activity = relationship("Activity", back_populates="laps") 