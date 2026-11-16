"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Gemini
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-4-hydrogen"

    # Supabase
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # App
    environment: str = "development"
    app_name: str = "PrepPilot AI"
    app_version: str = "1.0.0"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def gemini_available(self) -> bool:
        return bool(self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here")

    @property
    def supabase_available(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
