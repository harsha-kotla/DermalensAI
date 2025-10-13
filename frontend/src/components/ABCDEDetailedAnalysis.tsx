import React from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ABCDEFeatures } from '../types/api';

interface ABCDEDetailedAnalysisProps {
  features: ABCDEFeatures;
}

export const ABCDEDetailedAnalysis: React.FC<ABCDEDetailedAnalysisProps> = ({ features }) => {
  const getScoreColor = (value: number) => {
    if (value >= 0.7) return 'text-red-600 bg-red-50 border-red-300';
    if (value >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const getBarColor = (value: number) => {
    if (value >= 0.7) return 'bg-red-500';
    if (value >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getInterpretation = (feature: string, value: number) => {
    const interpretations: Record<string, Record<string, string>> = {
      asymmetry: {
        low: "Lesion appears symmetric in both axes",
        medium: "Mild asymmetry detected - worth monitoring",
        high: "⚠️ Significant asymmetry - major melanoma indicator"
      },
      border: {
        low: "Well-defined, regular borders",
        medium: "Some border irregularity present",
        high: "⚠️ Highly irregular borders with notching/scalloping"
      },
      color: {
        low: "Uniform coloration",
        medium: "2-3 distinct colors present",
        high: "⚠️ Multiple colors including blue-white veil or dark brown/black"
      },
      diameter: {
        low: "Size <6mm (within normal range)",
        medium: "Size 6-10mm (monitor for changes)",
        high: "⚠️ Size >10mm (increased concern)"
      },
      evolving: {
        low: "No recent changes reported",
        medium: "Some changes in size/color",
        high: "⚠️ Rapid evolution - immediate attention needed"
      }
    };

    const level = value >= 0.7 || (feature === 'diameter' && value > 10) ? 'high' 
                : value >= 0.4 || (feature === 'diameter' && value > 6) ? 'medium' 
                : 'low';
    
    return interpretations[feature]?.[level] || "Analysis in progress";
  };

  return (
    <div className="space-y-4">
      {/* Asymmetry */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">A - Asymmetry</h4>
              <p className="text-xs text-gray-600">Shape reflection analysis</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${getScoreColor(features.asymmetry)}`}>
            {(features.asymmetry * 100).toFixed(0)}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getBarColor(features.asymmetry)}`}
            style={{ width: `${features.asymmetry * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
          <span>{getInterpretation('asymmetry', features.asymmetry)}</span>
        </p>
      </div>

      {/* Border */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">⭕</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">B - Border Irregularity</h4>
              <p className="text-xs text-gray-600">Edge contour analysis</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${getScoreColor(features.border_irregularity)}`}>
            {(features.border_irregularity * 100).toFixed(0)}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getBarColor(features.border_irregularity)}`}
            style={{ width: `${features.border_irregularity * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>{getInterpretation('border', features.border_irregularity)}</span>
        </p>
      </div>

      {/* Color */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-pink-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">C - Color Variation</h4>
              <p className="text-xs text-gray-600">Multi-hue entropy analysis</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${getScoreColor(features.color_variation)}`}>
            {(features.color_variation * 100).toFixed(0)}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getBarColor(features.color_variation)}`}
            style={{ width: `${features.color_variation * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-600" />
          <span>{getInterpretation('color', features.color_variation)}</span>
        </p>
      </div>

      {/* Diameter */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">📏</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">D - Diameter</h4>
              <p className="text-xs text-gray-600">Size measurement (mm)</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${getScoreColor(features.diameter / 15)}`}>
            {features.diameter.toFixed(1)} mm
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getBarColor(features.diameter / 15)}`}
            style={{ width: `${Math.min((features.diameter / 15) * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
          <span>{getInterpretation('diameter', features.diameter)}</span>
        </p>
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          <span className="font-semibold">Reference:</span> 6mm = pencil eraser. Lesions &gt;6mm warrant closer attention.
        </div>
      </div>

      {/* Evolving */}
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-red-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">E - Evolving</h4>
              <p className="text-xs text-gray-600">Change detection score</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${getScoreColor(features.evolving)}`}>
            {(features.evolving * 100).toFixed(0)}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 ${getBarColor(features.evolving)}`}
            style={{ width: `${features.evolving * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
          <span>{getInterpretation('evolving', features.evolving)}</span>
        </p>
        {features.evolving > 0.6 && (
          <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs text-red-800 font-medium">
              High evolution score - document with photos and track changes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ABCDEDetailedAnalysis;

