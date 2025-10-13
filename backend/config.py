from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Model Configuration
    model_path: str = "./models/melanoma_classifier.pth"
    confidence_threshold: float = 0.5
    
    # CORS Settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Image Processing
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: List[str] = ["jpg", "jpeg", "png"]
    image_size: tuple = (224, 224)
    
    class Config:
        env_file = ".env"


settings = Settings()


