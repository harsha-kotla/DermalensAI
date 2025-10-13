import React from 'react';
import { CheckCircle, AlertCircle, Camera, Lightbulb } from 'lucide-react';

interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  fix: string;
}

interface ImageQualityCheckerProps {
  imageData?: string;
  onClose: () => void;
}

export const ImageQualityChecker: React.FC<ImageQualityCheckerProps> = ({ imageData, onClose }) => {
  // Simulated quality checks (in real app, backend would analyze)
  const qualityChecks = {
    passed: [
      "Image format is supported (JPG/PNG)",
      "Image resolution is adequate (>800px)",
      "File size is within limits (<10MB)"
    ],
    warnings: [
      "Slight blur detected - try stabilizing camera",
      "Lighting could be improved - avoid harsh shadows"
    ],
    captureGuidance: [
      "Hold camera 15-20cm from lesion",
      "Ensure even, diffuse lighting (avoid flash if possible)",
      "Include a reference object (ruler/coin) for size calibration",
      "Capture from directly above (perpendicular to skin)",
      "Take multiple angles if lesion is on curved surface"
    ]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Camera className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Image Quality Check</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Passed Checks */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Quality Checks Passed
        </h4>
        <ul className="space-y-1">
          {qualityChecks.passed.map((check, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Warnings */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Suggestions for Better Results
        </h4>
        <ul className="space-y-1">
          {qualityChecks.warnings.map((warning, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-600 flex-shrink-0">!</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Capture Guidance */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
        <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Clinical Photography Best Practices
        </h4>
        <ul className="space-y-2">
          {qualityChecks.captureGuidance.map((tip, idx) => (
            <li key={idx} className="text-xs text-blue-800 flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="flex-1 pt-0.5">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-900">
          <span className="font-semibold">💡 Pro Tip:</span> For accurate diameter measurement, place a ruler or coin next to the lesion. Our AI will automatically detect the reference object and calculate true size in millimeters.
        </p>
      </div>
    </div>
  );
};

export default ImageQualityChecker;

