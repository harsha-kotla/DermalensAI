export interface ABCDEFeatures {
  asymmetry: number;
  border_irregularity: number;
  color_variation: number;
  diameter: number;
  evolving: number;
}

export interface LesionClassification {
  class_name: string;
  class_id: string;
  confidence: number;
  is_malignant: boolean;
}

export interface DiagnosisResponse {
  classification: LesionClassification;
  abcde_features: ABCDEFeatures;
  overall_risk_score: number;
  recommendations: string[];
}

export interface EvolutionPoint {
  timepoint: number;
  asymmetry: number;
  border_irregularity: number;
  color_variation: number;
  diameter: number;
  risk_score: number;
}

export interface EvolutionResponse {
  current_state: ABCDEFeatures;
  trajectory: EvolutionPoint[];
  progression_pattern: string;
  time_to_concern: number | null;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  model_loaded: boolean;
}

