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
    
    # On Vercel, only /tmp is writable. Detect Vercel and use /tmp for SQLite.
    _is_vercel = os.getenv("VERCEL", "") == "1"
    _default_db = "sqlite:////tmp/bookwise.db" if _is_vercel else f"sqlite:///{os.path.join(BASE_DIR, 'data', 'bookwise.db')}"
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
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
        # Vercel deployments — covers all preview and production URLs
        "https://book-recommendation-system-7iud8fm61-vs-a6df.vercel.app",
        "https://book-recommendation-system-vs-a6df.vercel.app",
    ]

    # Read extra origins from env var (comma-separated), allows adding new domains without code changes
    _extra = os.getenv("EXTRA_CORS_ORIGINS", "")
    if _extra:
        CORS_ORIGINS = CORS_ORIGINS + [o.strip() for o in _extra.split(",") if o.strip()]


settings = Settings()

