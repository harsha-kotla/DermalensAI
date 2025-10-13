from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any

from config import settings
from models.predictor import MelanomaPredictor
from schemas.responses import (
    DiagnosisResponse, 
    EvolutionResponse, 
    HealthCheckResponse
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DermaLens API",
    description="AI-powered melanoma detection and skin lesion analysis with evolution prediction",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor (will work in demo mode if model not found)
try:
    predictor = MelanomaPredictor(model_path=settings.model_path)
    logger.info("Predictor initialized successfully")
except Exception as e:
    logger.warning(f"Predictor initialization failed: {e}. Using demo mode.")
    predictor = MelanomaPredictor(model_path=None)


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to DermaLens API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="healthy",
        message="DermaLens API is running",
        model_loaded=predictor.model_loaded
    )


@app.post("/api/analyze", response_model=DiagnosisResponse)
async def analyze_lesion(file: UploadFile = File(...)):
    """
    Analyze uploaded skin lesion image
    
    Args:
        file: Uploaded image file (JPG, JPEG, or PNG)
        
    Returns:
        DiagnosisResponse with classification, ABCDE features, and recommendations
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload an image (JPG, JPEG, or PNG)"
            )
        
        # Validate file extension
        file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
        if file_ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension. Allowed: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read and validate file size
        image_data = await file.read()
        if len(image_data) > settings.max_upload_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.max_upload_size / (1024*1024)}MB"
            )
        
        if len(image_data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded"
            )
        
        logger.info(f"Processing image: {file.filename}, size: {len(image_data)} bytes")
        
        # Perform prediction
        result = predictor.predict(image_data)
        
        logger.info(
            f"Prediction complete: {result.classification.class_name} "
            f"(confidence: {result.classification.confidence:.2f}, "
            f"risk: {result.overall_risk_score:.2f})"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/predict-evolution", response_model=EvolutionResponse)
async def predict_evolution(file: UploadFile = File(...)):
    """
    Predict evolution trajectory of uploaded lesion
    
    Args:
        file: Uploaded image file (JPG, JPEG, or PNG)
        
    Returns:
        EvolutionResponse with current state and predicted trajectory
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload an image (JPG, JPEG, or PNG)"
            )
        
        # Validate file extension
        file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
        if file_ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension. Allowed: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read and validate file size
        image_data = await file.read()
        if len(image_data) > settings.max_upload_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.max_upload_size / (1024*1024)}MB"
            )
        
        logger.info(f"Predicting evolution for: {file.filename}")
        
        # Perform evolution prediction
        result = predictor.predict_evolution(image_data)
        
        logger.info(
            f"Evolution prediction complete. Time to concern: {result.time_to_concern}"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Evolution prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evolution prediction failed: {str(e)}"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "error": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

