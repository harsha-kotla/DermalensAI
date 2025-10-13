from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class ABCDEFeatures(BaseModel):
    """ABCDE feature scores"""
    asymmetry: float = Field(..., ge=0, le=1, description="Asymmetry score (0-1)")
    border_irregularity: float = Field(..., ge=0, le=1, description="Border irregularity score (0-1)")
    color_variation: float = Field(..., ge=0, le=1, description="Color variation score (0-1)")
    diameter: float = Field(..., ge=0, description="Estimated diameter in mm")
    evolving: float = Field(..., ge=0, le=1, description="Evolution risk score (0-1)")


class LesionClassification(BaseModel):
    """Lesion classification result"""
    class_name: str = Field(..., description="Predicted lesion class")
    class_id: str = Field(..., description="Class identifier")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    is_malignant: bool = Field(..., description="Whether the lesion is malignant")


class DiagnosisResponse(BaseModel):
    """Complete diagnosis response"""
    classification: LesionClassification
    abcde_features: ABCDEFeatures
    overall_risk_score: float = Field(..., ge=0, le=1, description="Overall malignancy risk (0-1)")
    recommendations: List[str] = Field(..., description="Clinical recommendations")


class EvolutionPoint(BaseModel):
    """Single point in evolution trajectory"""
    timepoint: int = Field(..., description="Time point (0-10)")
    asymmetry: float
    border_irregularity: float
    color_variation: float
    diameter: float
    risk_score: float = Field(..., description="Overall risk at this timepoint")


class EvolutionResponse(BaseModel):
    """Evolution prediction response"""
    current_state: ABCDEFeatures
    trajectory: List[EvolutionPoint] = Field(..., description="Predicted evolution over time")
    progression_pattern: str = Field(..., description="Description of progression pattern")
    time_to_concern: Optional[int] = Field(None, description="Estimated timepoints until clinical concern")


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    model_loaded: bool


