import React, { useState } from 'react';
import { Microscope, Loader2, AlertCircle, Eye } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import EvolutionChart from './components/EvolutionChart';
import ABCDEDetailedAnalysis from './components/ABCDEDetailedAnalysis';
import ClinicalTriage from './components/ClinicalTriage';
import ImageQualityChecker from './components/ImageQualityChecker';
import { api } from './services/api';
import type { DiagnosisResponse, EvolutionResponse } from './types/api';

type AnalysisType = 'diagnosis' | 'evolution';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResponse | null>(null);
  const [evolutionResults, setEvolutionResults] = useState<EvolutionResponse | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('diagnosis');
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [showDetailedABCDE, setShowDetailedABCDE] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setDiagnosisResults(null);
    setEvolutionResults(null);
    setShowDetailedABCDE(false);
    // Auto-show quality check for new images
    setTimeout(() => setShowQualityCheck(true), 500);
  };

  const handleAnalyze = async (type: AnalysisType) => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisType(type);

    try {
      if (type === 'diagnosis') {
        const results = await api.analyzeLesion(selectedFile);
        setDiagnosisResults(results);
        setEvolutionResults(null);
      } else {
        const results = await api.predictEvolution(selectedFile);
        setEvolutionResults(results);
        setDiagnosisResults(null);
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Analysis failed. Please try again.'
      );
      setDiagnosisResults(null);
      setEvolutionResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDiagnosisResults(null);
    setEvolutionResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <Microscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  DermaLens
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Melanoma Detection & Evolution Prediction</p>
              </div>
            </div>
            
            {/* Model Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-yellow-800">Demo Mode</span>
              <span className="text-xs text-yellow-600">(No model loaded)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Model Instructions Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">🎯 Add Your Trained Model</h3>
              <p className="text-blue-100 text-sm mb-3">
                Currently running in demo mode with simulated predictions. To use real model predictions:
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <code className="text-sm font-mono text-blue-100">
                  Place your model at: <span className="text-white font-bold">backend/models/melanoma_classifier.pth</span>
                </code>
              </div>
              <p className="text-blue-100 text-xs mt-2">
                See <span className="font-semibold">backend/models/PLACE_MODEL_HERE.txt</span> for detailed instructions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Microscope className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Upload Image</h2>
              </div>
              <ImageUpload onImageSelect={handleImageSelect} disabled={loading} />

              {/* Action Buttons */}
              {selectedFile && (
                <div className="mt-6 space-y-3 animate-in slide-in-from-bottom duration-300">
                  <button
                    onClick={() => setShowQualityCheck(!showQualityCheck)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showQualityCheck ? 'Hide' : 'Check'} Image Quality
                  </button>

                  <button
                    onClick={() => handleAnalyze('diagnosis')}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading && analysisType === 'diagnosis' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Microscope className="w-5 h-5" />
                        Analyze Lesion
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleAnalyze('evolution')}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading && analysisType === 'evolution' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        📈
                        Predict Evolution
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                  >
                    🔄 Reset
                  </button>
                </div>
              )}

              {/* Quality Check Panel */}
              {selectedFile && showQualityCheck && (
                <div className="animate-in slide-in-from-bottom duration-300">
                  <ImageQualityChecker 
                    onClose={() => setShowQualityCheck(false)}
                  />
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                How it works
              </h3>
              <ul className="space-y-3 text-sm text-blue-900">
                <li className="flex items-start gap-3 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Upload a clear image of the skin lesion</span>
                </li>
                <li className="flex items-start gap-3 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Choose "Analyze Lesion" for classification and ABCDE features</span>
                </li>
                <li className="flex items-start gap-3 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Or choose "Predict Evolution" to see progression trajectory</span>
                </li>
                <li className="flex items-start gap-3 p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Review AI-generated recommendations and consult a dermatologist</span>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 shadow-md">
              <div className="flex gap-3">
                <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-900 mb-2">⚠️ Medical Disclaimer</p>
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    This tool is for <span className="font-semibold">educational and research purposes only</span>. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any medical concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full animate-ping"></div>
                  </div>
                  <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4 relative z-10" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mt-4">
                  {analysisType === 'diagnosis' ? '🔬 Analyzing image...' : '📊 Predicting evolution...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Processing with AI neural network</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {!loading && diagnosisResults && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <ResultsDisplay results={diagnosisResults} />
                
                {/* Toggle for detailed ABCDE */}
                <button
                  onClick={() => setShowDetailedABCDE(!showDetailedABCDE)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Microscope className="w-5 h-5" />
                  {showDetailedABCDE ? 'Hide' : 'Show'} Detailed ABCDE Analysis
                </button>

                {showDetailedABCDE && (
                  <ABCDEDetailedAnalysis features={diagnosisResults.abcde_features} />
                )}

                <ClinicalTriage 
                  riskScore={diagnosisResults.overall_risk_score}
                  isMalignant={diagnosisResults.classification.is_malignant}
                  className={diagnosisResults.classification.class_name}
                />
              </div>
            )}

            {!loading && evolutionResults && (
              <EvolutionChart evolution={evolutionResults} />
            )}

            {!loading && !diagnosisResults && !evolutionResults && !error && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
                  <Microscope className="w-16 h-16 text-gray-400 mx-auto mb-4 relative z-10" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">🎯 Ready to Analyze</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Upload an image and click <span className="font-semibold text-primary-600">"Analyze Lesion"</span> or <span className="font-semibold text-purple-600">"Predict Evolution"</span> to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 bg-primary-500 rounded-lg">
                <Microscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">DermaLens</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              © 2025 | Powered by Multi-Task Deep Learning | For Research Use Only
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                System Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

