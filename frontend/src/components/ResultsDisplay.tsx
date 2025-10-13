import React from 'react';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import type { DiagnosisResponse } from '../types/api';

interface ResultsDisplayProps {
  results: DiagnosisResponse;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { classification, abcde_features, overall_risk_score, recommendations } = results;

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 0.7) return 'High Risk';
    if (score >= 0.4) return 'Moderate Risk';
    return 'Low Risk';
  };

  const getFeatureColor = (value: number) => {
    if (value >= 0.7) return 'bg-red-500';
    if (value >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      {/* Classification Result */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-primary-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {classification.class_name}
            </h3>
            <p className="text-sm text-gray-600">
              Classification ID: {classification.class_id}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 ${getRiskColor(overall_risk_score)}`}>
            <div className="flex items-center gap-2">
              {overall_risk_score >= 0.7 ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">{getRiskLabel(overall_risk_score)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${classification.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {(classification.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Overall Risk Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overall_risk_score >= 0.7 ? 'bg-red-500' :
                    overall_risk_score >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${overall_risk_score * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {(overall_risk_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {classification.is_malignant && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl shadow-md animate-pulse">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-bold text-red-900">
              ⚠️ Malignant lesion detected - Immediate medical attention recommended
            </span>
          </div>
        )}
      </div>

      {/* ABCDE Features */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">ABCDE Features Analysis</h3>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Asymmetry', value: abcde_features.asymmetry, key: 'asymmetry' },
            { label: 'Border Irregularity', value: abcde_features.border_irregularity, key: 'border' },
            { label: 'Color Variation', value: abcde_features.color_variation, key: 'color' },
            { label: 'Diameter', value: abcde_features.diameter, key: 'diameter', unit: 'mm' },
            { label: 'Evolving', value: abcde_features.evolving, key: 'evolving' },
          ].map((feature) => (
            <div key={feature.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {feature.key === 'diameter' 
                    ? `${feature.value.toFixed(1)} ${feature.unit}`
                    : `${(feature.value * 100).toFixed(1)}%`
                  }
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    feature.key === 'diameter'
                      ? getFeatureColor(feature.value / 10)
                      : getFeatureColor(feature.value)
                  }`}
                  style={{
                    width: feature.key === 'diameter'
                      ? `${Math.min((feature.value / 10) * 100, 100)}%`
                      : `${feature.value * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
          <span className="text-2xl">📋</span>
          <h3 className="text-xl font-bold text-gray-900">Clinical Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm hover:bg-white/90 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-sm text-gray-700 flex-1 leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;

