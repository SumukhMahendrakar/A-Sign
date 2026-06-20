import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load from parent directory .env
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

class Settings(BaseSettings):
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SECRET_KEY: str = "kerala-legal-secret-key-2024-very-long-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = "sqlite:///./legal_docs.db"
    PDF_DIR: str = str(Path(__file__).parent / "generated_pdfs")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
