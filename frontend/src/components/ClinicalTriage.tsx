import React from 'react';
import { AlertTriangle, Clock, Calendar, Phone, FileText } from 'lucide-react';

interface TriageProps {
  riskScore: number;
  isMalignant: boolean;
  className: string;
}

export const ClinicalTriage: React.FC<TriageProps> = ({ riskScore, isMalignant, className }) => {
  const getTriageLevel = () => {
    if (isMalignant || riskScore >= 0.7) {
      return {
        level: 'RED - Urgent',
        color: 'bg-gradient-to-r from-red-600 to-red-700',
        borderColor: 'border-red-500',
        textColor: 'text-red-900',
        bgColor: 'bg-red-50',
        icon: '🚨',
        timeframe: 'Within 1-2 weeks',
        actions: [
          'Schedule in-person dermatology appointment immediately',
          'Request expedited appointment if possible',
          'Document lesion with photos from multiple angles',
          'Note any recent changes in size, color, or symptoms',
          'Prepare list of personal/family skin cancer history'
        ]
      };
    } else if (riskScore >= 0.4) {
      return {
        level: 'YELLOW - Monitor',
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-900',
        bgColor: 'bg-yellow-50',
        icon: '⚠️',
        timeframe: 'Within 4-6 weeks',
        actions: [
          'Schedule routine dermatology check-up',
          'Take photos monthly to monitor for changes',
          'Watch for: size increase, color changes, new symptoms',
          'Set reminder to re-capture in 6-8 weeks',
          'Keep sun-protected (SPF 50+, protective clothing)'
        ]
      };
    } else {
      return {
        level: 'GREEN - Routine',
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        borderColor: 'border-green-400',
        textColor: 'text-green-900',
        bgColor: 'bg-green-50',
        icon: '✅',
        timeframe: 'Routine monitoring',
        actions: [
          'Continue routine self-examinations monthly',
          'Annual full-body skin check recommended',
          'Re-photograph if lesion changes in any way',
          'Maintain sun protection habits',
          'Keep record of all moles/lesions for comparison'
        ]
      };
    }
  };

  const triage = getTriageLevel();

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border-2 ${triage.borderColor}`}>
      {/* Header */}
      <div className={`${triage.color} rounded-xl p-4 mb-6 shadow-lg`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{triage.icon}</span>
            <div>
              <h3 className="text-2xl font-bold">Triage Level: {triage.level}</h3>
              <p className="text-sm opacity-90">Clinical decision support</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{(riskScore * 100).toFixed(0)}%</div>
            <div className="text-xs opacity-90">Risk Score</div>
          </div>
        </div>
      </div>

      {/* Timeframe */}
      <div className={`${triage.bgColor} rounded-lg p-4 mb-4 border-2 ${triage.borderColor}`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-6 h-6 ${triage.textColor}`} />
          <div>
            <p className="text-sm font-semibold text-gray-700">Recommended Timeframe</p>
            <p className={`text-lg font-bold ${triage.textColor}`}>{triage.timeframe}</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Next Steps & Action Items
        </h4>
        <ul className="space-y-2">
          {triage.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1 pt-0.5">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">Find Dermatologist</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-semibold">Telederm Consult</span>
        </button>
      </div>

      {/* Evidence Summary */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h4 className="text-sm font-bold text-blue-900 mb-2">📊 Evidence Summary</h4>
        <p className="text-xs text-blue-800 leading-relaxed">
          This triage level is based on <span className="font-semibold">multi-task AI analysis</span> of:
          lesion asymmetry, border irregularity, color variation, size measurement, and evolution indicators.
          This is a <span className="font-semibold">screening tool</span> - not a diagnosis. Always consult a dermatologist for definitive assessment.
        </p>
      </div>

      {/* Disclaimer */}
      {(isMalignant || riskScore >= 0.7) && (
        <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-900 mb-1">⚠️ Immediate Attention Recommended</p>
            <p className="text-xs text-red-800">
              High-risk features detected. Do not delay seeking professional dermatological evaluation.
              This tool cannot replace clinical examination and biopsy when indicated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalTriage;

