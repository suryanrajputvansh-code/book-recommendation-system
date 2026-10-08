import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Settings:
    PROJECT_NAME: str = "ML-Powered Book Recommendation Engine API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = os.getenv("API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("API_PORT", "5000"))
    
    DATASET_PATH: str = os.getenv("DATASET_PATH", os.path.join(BASE_DIR, "data", "books.csv"))
    MODELS_DIR: str = os.getenv("MODELS_DIR", os.path.join(BASE_DIR, "models"))
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'data', 'bookwise.db')}")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey-change-this-in-production-12345")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ]


settings = Settings()

