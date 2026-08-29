import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings:
    PROJECT_NAME: str = "ML-Powered Book Recommendation Engine API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = os.getenv("API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("API_PORT", "5000"))
    
    DATASET_PATH: str = os.getenv("DATASET_PATH", os.path.join(BASE_DIR, "data", "books.csv"))
    MODELS_DIR: str = os.getenv("MODELS_DIR", os.path.join(BASE_DIR, "models"))
    
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]


settings = Settings()
