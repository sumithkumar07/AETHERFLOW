import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Upload,
  FileText,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

const CodeReviewDashboard = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  const languages = [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'php', 'go', 'rust'
  ];

  const handleCodeAnalysis = async () => {
    if (!codeInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/enhanced/code-review/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeInput,
          language: selectedLanguage,
          file_path: selectedFile?.name || 'untitled'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setAnalysisResults(result.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const content = await file.text();
    setCodeInput(content);
    
    // Auto-detect language from file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const langMap = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'cpp',
      'php': 'php',
      'go': 'go',
      'rs': 'rust'
    };
    
    if (langMap[extension]) {
      setSelectedLanguage(langMap[extension]);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              AI Code Review & Security Scanner
            </h1>
            <p className="text-gray-600 mt-1">
              Automated code quality and vulnerability detection
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'review'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4 mr-2 inline" />
              Code Review
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4 mr-2 inline" />
              Security Scan
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Reports
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Input Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Analysis</h2>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File or Paste Code
              </label>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".py,.js,.ts,.java,.cpp,.c,.php,.go,.rs"
                    onChange={handleFileUpload}
                  />
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedFile && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4 mr-1" />
                  {selectedFile.name}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="mb-4">
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste your code here or upload a file..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Analysis Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">Security Scan</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">Quality Check</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">Performance Analysis</span>
                </label>
              </div>
              
              <button
                onClick={handleCodeAnalysis}
                disabled={!codeInput.trim() || isAnalyzing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Analyze Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="space-y-6">
          {analysisResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
              
              {/* Overall Score */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getScoreColor(analysisResults.score)}`}>
                  {analysisResults.score}/100
                </div>
                <div className="text-sm text-gray-600">Overall Quality Score</div>
              </div>

              {/* Issue Counts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Security Issues</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {analysisResults.security_issues?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Quality Issues</span>
                  </div>
                  <span className="font-semibold text-yellow-600">
                    {analysisResults.quality_issues?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Suggestions</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {analysisResults.suggestions?.length || 0}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              {analysisResults.metrics && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Code Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lines of Code</span>
                      <span className="font-medium">{analysisResults.metrics.lines_of_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Functions</span>
                      <span className="font-medium">{analysisResults.metrics.functions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes</span>
                      <span className="font-medium">{analysisResults.metrics.classes}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center">
                <Download className="w-4 h-4 mr-3" />
                Export Report
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center">
                <Shield className="w-4 h-4 mr-3" />
                Security Rules
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center">
                <BarChart3 className="w-4 h-4 mr-3" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {analysisResults && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Analysis Results</h3>
            
            {/* Security Issues */}
            {analysisResults.security_issues && analysisResults.security_issues.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2" />
                  Security Issues ({analysisResults.security_issues.length})
                </h4>
                <div className="space-y-3">
                  {analysisResults.security_issues.map((issue, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="ml-3 font-medium text-gray-900">{issue.rule}</span>
                        </div>
                        <span className="text-sm text-gray-500">Line {issue.line}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                      {issue.recommendation && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          💡 {issue.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Issues */}
            {analysisResults.quality_issues && analysisResults.quality_issues.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Code className="w-5 h-5 text-yellow-500 mr-2" />
                  Quality Issues ({analysisResults.quality_issues.length})
                </h4>
                <div className="space-y-3">
                  {analysisResults.quality_issues.map((issue, index) => (
                    <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="ml-3 font-medium text-gray-900">{issue.type}</span>
                        </div>
                        {issue.line && <span className="text-sm text-gray-500">Line {issue.line}</span>}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                      {issue.recommendation && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          💡 {issue.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysisResults.suggestions && analysisResults.suggestions.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  AI Suggestions ({analysisResults.suggestions.length})
                </h4>
                <div className="space-y-3">
                  {analysisResults.suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority} priority
                        </span>
                        <span className="ml-3 font-medium text-gray-900">{suggestion.title}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                      <p className="text-sm text-green-700 font-medium">
                        📋 {suggestion.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default CodeReviewDashboard;