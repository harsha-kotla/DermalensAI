import axios from 'axios';
import type { DiagnosisResponse, EvolutionResponse, HealthCheckResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const api = {
  /**
   * Check API health status
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  },

  /**
   * Analyze skin lesion image
   */
  async analyzeLesion(file: File): Promise<DiagnosisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<DiagnosisResponse>('/api/analyze', formData);
    return response.data;
  },

  /**
   * Predict lesion evolution trajectory
   */
  async predictEvolution(file: File): Promise<EvolutionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<EvolutionResponse>('/api/predict-evolution', formData);
    return response.data;
  },
};

export default api;

