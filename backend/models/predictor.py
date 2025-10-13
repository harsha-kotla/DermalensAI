try:
    import torch
    import torch.nn as nn
    from torchvision import transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    nn = None

from PIL import Image
import io
import numpy as np
from typing import Dict, Any, List, Optional
import logging

if TORCH_AVAILABLE:
    from models.network import MultiTaskMelanomaNet

from schemas.responses import (
    DiagnosisResponse, 
    LesionClassification, 
    ABCDEFeatures,
    EvolutionResponse,
    EvolutionPoint
)

logger = logging.getLogger(__name__)


class MelanomaPredictor:
    """Predictor class for melanoma detection and ABCDE feature extraction"""
    
    def __init__(self, model_path: Optional[str] = None):
        if TORCH_AVAILABLE and torch:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {self.device}")
        else:
            self.device = None
            logger.warning("PyTorch not available - running in demo mode only")
        
        # =====================================================================
        # MODEL LOADING INSTRUCTIONS:
        # =====================================================================
        # Place your trained model file at: backend/models/melanoma_classifier.pth
        # 
        # The model checkpoint should contain:
        # {
        #     'model_state_dict': <trained MultiTaskMelanomaNet state dict>,
        #     'epoch': <optional>,
        #     'loss': <optional>
        # }
        #
        # If no model is found, the system runs in DEMO MODE with simulated
        # predictions for testing purposes.
        # =====================================================================
        
        # Class mappings (HAM10000 dataset)
        self.class_names = {
            0: "akiec",  # Actinic Keratoses
            1: "bcc",    # Basal Cell Carcinoma
            2: "bkl",    # Benign Keratosis
            3: "df",     # Dermatofibroma
            4: "mel",    # Melanoma
            5: "nv",     # Melanocytic Nevi
            6: "vasc"    # Vascular Lesions
        }
        
        self.full_class_names = {
            "akiec": "Actinic Keratoses",
            "bcc": "Basal Cell Carcinoma",
            "bkl": "Benign Keratosis",
            "df": "Dermatofibroma",
            "mel": "Melanoma",
            "nv": "Melanocytic Nevi",
            "vasc": "Vascular Lesions"
        }
        
        self.malignant_classes = {"bcc", "mel"}
        
        # Image preprocessing (only if torch available)
        if TORCH_AVAILABLE and transforms:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
        else:
            self.transform = None
        
        # Load model
        self.model_loaded = False
        if model_path:
            try:
                self.model = self._load_model(model_path)
                self.model_loaded = True
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                self.model = None
        else:
            logger.warning("No model path provided, using demo mode")
            self.model = None
    
    def _load_model(self, model_path: str):
        """Load trained model from checkpoint"""
        if not TORCH_AVAILABLE:
            logger.error("PyTorch not available - cannot load model")
            return None
        model = MultiTaskMelanomaNet(num_classes=7)
        checkpoint = torch.load(model_path, map_location=self.device)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(self.device)
        model.eval()
        return model
    
    def _preprocess_image(self, image_data: bytes):
        """Preprocess image for model input"""
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        if self.transform and TORCH_AVAILABLE:
            image_tensor = self.transform(image).unsqueeze(0)
            return image_tensor.to(self.device)
        return None
    
    def _generate_demo_prediction(self) -> Dict[str, Any]:
        """Generate demo prediction when model is not loaded"""
        # Simulate predictions for demonstration
        if TORCH_AVAILABLE and torch:
            return {
                'class_logits': torch.randn(1, 7),
                'abcde_features': torch.rand(1, 5) * 0.5  # Lower risk for demo
            }
        else:
            # Pure numpy fallback for demo
            return {
                'class_logits': np.random.randn(1, 7),
                'abcde_features': np.random.rand(1, 5) * 0.5  # Lower risk for demo
            }
    
    def predict(self, image_data: bytes) -> DiagnosisResponse:
        """
        Predict lesion classification and ABCDE features
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            DiagnosisResponse with classification and features
        """
        try:
            # Preprocess image
            image_tensor = self._preprocess_image(image_data)
            
            # Get predictions
            if self.model and self.model_loaded:
                with torch.no_grad():
                    outputs = self.model(image_tensor)
            else:
                # Demo mode
                outputs = self._generate_demo_prediction()
            
            # Parse classification
            class_logits = outputs['class_logits']
            if TORCH_AVAILABLE and torch and isinstance(class_logits, (torch.Tensor,)):
                class_probs = torch.softmax(class_logits, dim=1)
                predicted_class = torch.argmax(class_probs, dim=1).item()
                confidence = class_probs[0, predicted_class].item()
            else:
                # Numpy fallback
                exp_logits = np.exp(class_logits - np.max(class_logits))
                class_probs = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
                predicted_class = int(np.argmax(class_probs, axis=1)[0])
                confidence = float(class_probs[0, predicted_class])
            
            class_id = self.class_names[predicted_class]
            class_name = self.full_class_names[class_id]
            is_malignant = class_id in self.malignant_classes
            
            # Parse ABCDE features
            abcde_features_data = outputs['abcde_features'][0]
            if TORCH_AVAILABLE and torch and isinstance(abcde_features_data, (torch.Tensor,)):
                abcde_raw = abcde_features_data.cpu().numpy()
            else:
                abcde_raw = np.array(abcde_features_data) if not isinstance(abcde_features_data, np.ndarray) else abcde_features_data
            
            # Apply sigmoid to get 0-1 range for most features
            abcde_normalized = 1 / (1 + np.exp(-abcde_raw))
            
            abcde_features = ABCDEFeatures(
                asymmetry=float(abcde_normalized[0]),
                border_irregularity=float(abcde_normalized[1]),
                color_variation=float(abcde_normalized[2]),
                diameter=float(max(1.0, abcde_normalized[3] * 20)),  # Scale to reasonable mm range
                evolving=float(abcde_normalized[4])
            )
            
            # Calculate overall risk score
            risk_score = self._calculate_risk_score(abcde_features, is_malignant, confidence)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                class_name, is_malignant, risk_score, abcde_features
            )
            
            return DiagnosisResponse(
                classification=LesionClassification(
                    class_name=class_name,
                    class_id=class_id,
                    confidence=confidence,
                    is_malignant=is_malignant
                ),
                abcde_features=abcde_features,
                overall_risk_score=risk_score,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
    
    def predict_evolution(self, image_data: bytes) -> EvolutionResponse:
        """
        Predict lesion evolution trajectory in latent space
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            EvolutionResponse with trajectory data
        """
        try:
            # First get current state
            diagnosis = self.predict(image_data)
            current_features = diagnosis.abcde_features
            
            # Simulate evolution trajectory (10 time points)
            trajectory = []
            
            # Base progression rates (higher for concerning features)
            base_rate = 0.05 if diagnosis.classification.is_malignant else 0.02
            
            for t in range(11):  # 0 to 10
                # Calculate feature values at time t
                asymmetry = min(1.0, current_features.asymmetry + t * base_rate * 1.2)
                border = min(1.0, current_features.border_irregularity + t * base_rate * 1.1)
                color = min(1.0, current_features.color_variation + t * base_rate * 0.9)
                diameter = current_features.diameter + t * base_rate * 5  # mm growth
                
                # Risk increases with feature progression
                risk = min(1.0, (asymmetry + border + color) / 3.0 + 
                          (0.1 if diameter > 6 else 0))
                
                trajectory.append(EvolutionPoint(
                    timepoint=t,
                    asymmetry=asymmetry,
                    border_irregularity=border,
                    color_variation=color,
                    diameter=diameter,
                    risk_score=risk
                ))
            
            # Determine progression pattern
            progression_pattern = self._describe_progression(
                current_features, trajectory, diagnosis.classification.is_malignant
            )
            
            # Estimate time to concern
            time_to_concern = None
            for point in trajectory:
                if point.risk_score > 0.7:
                    time_to_concern = point.timepoint
                    break
            
            return EvolutionResponse(
                current_state=current_features,
                trajectory=trajectory,
                progression_pattern=progression_pattern,
                time_to_concern=time_to_concern
            )
            
        except Exception as e:
            logger.error(f"Evolution prediction failed: {e}")
            raise
    
    def _calculate_risk_score(
        self, 
        features: ABCDEFeatures, 
        is_malignant: bool, 
        confidence: float
    ) -> float:
        """Calculate overall risk score from features and classification"""
        # Weighted ABCDE score
        abcde_score = (
            features.asymmetry * 0.2 +
            features.border_irregularity * 0.2 +
            features.color_variation * 0.2 +
            (min(features.diameter, 10) / 10) * 0.2 +  # Normalize diameter
            features.evolving * 0.2
        )
        
        # Combine with classification
        if is_malignant:
            risk = 0.5 + (abcde_score * 0.3) + (confidence * 0.2)
        else:
            risk = abcde_score * 0.5
        
        return min(1.0, max(0.0, risk))
    
    def _generate_recommendations(
        self,
        class_name: str,
        is_malignant: bool,
        risk_score: float,
        features: ABCDEFeatures
    ) -> List[str]:
        """Generate clinical recommendations based on analysis"""
        recommendations = []
        
        if is_malignant or risk_score > 0.7:
            recommendations.append("⚠️ Immediate dermatologist consultation recommended")
            recommendations.append("Consider biopsy for definitive diagnosis")
        elif risk_score > 0.5:
            recommendations.append("Schedule dermatologist appointment within 2-4 weeks")
            recommendations.append("Monitor for changes in size, color, or shape")
        else:
            recommendations.append("Routine monitoring recommended")
            recommendations.append("Follow up if lesion changes")
        
        # Feature-specific recommendations
        if features.asymmetry > 0.6:
            recommendations.append("High asymmetry detected - document with photographs")
        
        if features.border_irregularity > 0.6:
            recommendations.append("Irregular borders noted - track border changes over time")
        
        if features.color_variation > 0.6:
            recommendations.append("Multiple colors present - monitor for new color development")
        
        if features.diameter > 6:
            recommendations.append(f"Diameter ({features.diameter:.1f}mm) exceeds 6mm threshold")
        
        if features.evolving > 0.6:
            recommendations.append("High evolution score - compare with previous images if available")
        
        recommendations.append("Document with clinical photography for future comparison")
        
        return recommendations
    
    def _describe_progression(
        self,
        current: ABCDEFeatures,
        trajectory: List[EvolutionPoint],
        is_malignant: bool
    ) -> str:
        """Describe the progression pattern in natural language"""
        final = trajectory[-1]
        
        # Calculate feature changes
        asym_change = final.asymmetry - current.asymmetry
        border_change = final.border_irregularity - current.border_irregularity
        color_change = final.color_variation - current.color_variation
        
        if is_malignant:
            if max(asym_change, border_change, color_change) > 0.3:
                return "Rapid progression pattern with significant feature deterioration. All ABCD characteristics show concerning increases over the simulated timeline, suggesting aggressive evolution."
            else:
                return "Moderate progression with gradual increase in malignant features. Border irregularity and asymmetry show steady advancement."
        else:
            if max(asym_change, border_change, color_change) < 0.15:
                return "Stable benign pattern with minimal feature changes. Lesion characteristics remain relatively constant over time with low progression risk."
            else:
                return "Benign lesion with mild progression. Some feature increases noted but remaining within benign range. Continued monitoring advised."


