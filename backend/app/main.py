from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api import auth_router, activities_router, mock_router
from app.db.database import engine
from app.models import Base
import os

# Crea le tabelle del database
Base.metadata.create_all(bind=engine)

# Crea l'applicazione FastAPI
app = FastAPI(
    title=settings.app_name,
    description="API per l'analisi delle attività di corsa da Strava",
    version="1.0.0",
    debug=settings.debug
)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crea la directory per i file statici se non esiste
os.makedirs("uploads/profile_images", exist_ok=True)

# Monta i file statici
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Includi i router
app.include_router(auth_router)
app.include_router(activities_router)
if settings.debug:
    app.include_router(mock_router)  # Solo per sviluppo


@app.get("/")
async def root():
    """Endpoint di root"""
    return {
        "message": "Strava Run Analyzer API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"} 