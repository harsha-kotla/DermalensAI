import torch
import torch.nn as nn
import torchvision.models as models
from typing import Dict


class MultiTaskMelanomaNet(nn.Module):
    """
    Multi-task neural network for melanoma detection and ABCDE feature extraction.
    
    Based on ResNet50 backbone with two heads:
    1. Classification head: 7 skin lesion classes
    2. ABCDE feature head: 5 continuous features (Asymmetry, Border, Color, Diameter, Evolving)
    """
    
    def __init__(self, num_classes: int = 7, pretrained: bool = True):
        super(MultiTaskMelanomaNet, self).__init__()
        
        # Load pretrained ResNet50 as backbone
        self.backbone = models.resnet50(pretrained=pretrained)
        
        # Get the number of features from the backbone
        num_features = self.backbone.fc.in_features
        
        # Remove the original fully connected layer
        self.backbone.fc = nn.Identity()
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
        
        # ABCDE feature extraction head
        self.abcde_head = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 5)  # 5 ABCDE features
        )
    
    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Forward pass
        
        Args:
            x: Input tensor of shape (batch_size, 3, 224, 224)
            
        Returns:
            Dictionary containing:
                - class_logits: Classification logits (batch_size, num_classes)
                - abcde_features: ABCDE feature values (batch_size, 5)
        """
        # Extract features from backbone
        features = self.backbone(x)
        
        # Classification output
        class_logits = self.classifier(features)
        
        # ABCDE feature output
        abcde_features = self.abcde_head(features)
        
        return {
            'class_logits': class_logits,
            'abcde_features': abcde_features
        }


class MultiTaskLoss(nn.Module):
    """
    Combined loss for multi-task learning
    
    Combines classification loss (CrossEntropy) with ABCDE feature regression loss (MSE)
    with learnable task weighting.
    """
    
    def __init__(self, alpha: float = 0.5):
        super(MultiTaskLoss, self).__init__()
        self.alpha = alpha  # Weight for classification vs regression
        self.classification_loss = nn.CrossEntropyLoss()
        self.regression_loss = nn.MSELoss()
    
    def forward(
        self, 
        class_logits: torch.Tensor, 
        class_targets: torch.Tensor,
        abcde_predictions: torch.Tensor,
        abcde_targets: torch.Tensor
    ) -> torch.Tensor:
        """
        Calculate combined loss
        
        Args:
            class_logits: Classification predictions
            class_targets: True class labels
            abcde_predictions: Predicted ABCDE features
            abcde_targets: True ABCDE features
            
        Returns:
            Combined loss value
        """
        cls_loss = self.classification_loss(class_logits, class_targets)
        reg_loss = self.regression_loss(abcde_predictions, abcde_targets)
        
        # Weighted combination
        total_loss = self.alpha * cls_loss + (1 - self.alpha) * reg_loss
        
        return total_loss


