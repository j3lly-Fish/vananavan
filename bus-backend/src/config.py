import os

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        "postgresql://bus_user:bus_password@localhost:5432/bus_service"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    
    # CORS configuration
    CORS_ORIGINS = ["*"]  # Allow all origins for development
    
    # Flask configuration
    DEBUG = os.environ.get("FLASK_ENV") == "development"


