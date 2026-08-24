import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Zelador API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "minha_chave_super_secreta_para_desenvolvimento"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520 # 8 dias
    
    DATABASE_URL: str = "postgresql+asyncpg://zelador_user:zelador_password@localhost:5432/zelador_db"

    MEDIA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "media", "fotos_visitantes")

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
