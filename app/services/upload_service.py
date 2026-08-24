import os
import shutil
from fastapi import UploadFile
from app.core.config import settings

async def save_visitor_photo(visitor_id: str, file: UploadFile) -> str:
    # Ensure directory exists
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    
    # Extract extension
    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in ['.jpg', '.jpeg', '.png']:
        raise ValueError("Invalid image format. Only JPG and PNG are allowed.")
    
    file_name = f"{visitor_id}{extension}"
    file_path = os.path.join(settings.MEDIA_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"/media/fotos_visitantes/{file_name}"
