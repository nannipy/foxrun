import os
from typing import Optional
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()


class Settings:
    # FastAPI settings
    app_name: str = "Strava Run Analyzer API"
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/strava_analyzer.db")
    
    # Strava API settings
    strava_client_id: Optional[str] = os.getenv("STRAVA_CLIENT_ID")
    strava_client_secret: Optional[str] = os.getenv("STRAVA_CLIENT_SECRET")
    strava_redirect_uri: str = os.getenv("STRAVA_REDIRECT_URI", "http://localhost:3000/auth/callback")
    
    # Security settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS settings
    allowed_origins: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")


settings = Settings() 