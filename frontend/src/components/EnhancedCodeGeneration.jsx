import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Wand2, 
  Download, 
  Copy, 
  FileText, 
  TestTube,
  BookOpen,
  Sparkles,
  Settings,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const EnhancedCodeGeneration = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedFramework, setSelectedFramework] = useState('general');
  const [codeType, setCodeType] = useState('function');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [languageSupport, setLanguageSupport] = useState({});

  useEffect(() => {
    fetchLanguageSupport();
  }, []);

  const fetchLanguageSupport = async () => {
    try {
      const response = await fetch('/api/enhanced/code-generation/languages');
      const data = await response.json();
      if (data.supported_languages) {
        setLanguageSupport(data.language_details);
      }
    } catch (error) {
      console.error('Failed to fetch language support:', error);
    }
  };

  const frameworks = {
    python: ['general', 'fastapi', 'django', 'flask', 'streamlit'],
    javascript: ['general', 'react', 'vue', 'angular', 'node', 'express'],
    typescript: ['general', 'react', 'vue', 'angular', 'node', 'nestjs'],
    java: ['general', 'spring', 'springboot', 'maven'],
    go: ['general', 'gin', 'echo', 'fiber'],
    rust: ['general', 'actix', 'rocket', 'warp'],
    cpp: ['general', 'qt', 'opencv']
  };

  const codeTypes = [
    'function', 'class', 'api', 'component', 'service', 'model', 'utility', 'test'
  ];

  const handleGeneration = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/enhanced/code-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          framework: selectedFramework,
          type: codeType,
          description: description,
          requirements: requirements.filter(req => req.trim())
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedCode(result);
      }
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements.length ? newRequirements : ['']);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wand2 className="w-8 h-8 text-purple-600 mr-3" />
              Enhanced Code Generation
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered multi-language code generation with best practices
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600">
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              {Object.keys(languageSupport).length} languages supported
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
            
            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setSelectedFramework('general');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.keys(frameworks).map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Framework Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework
              </label>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {frameworks[selectedLanguage]?.map(framework => (
                  <option key={framework} value={framework}>
                    {framework.charAt(0).toUpperCase() + framework.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Type
              </label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {codeTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you want the code to do..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Enter a specific requirement..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {requirements.length > 1 && (
                    <button
                      onClick={() => removeRequirement(index)}
                      className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRequirement}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add requirement
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneration}
              disabled={!description.trim() || isGenerating}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Code
                </>
              )}
            </button>
          </div>

          {/* Language Features */}
          {languageSupport[selectedLanguage] && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Features
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Frameworks: {languageSupport[selectedLanguage].frameworks?.join(', ')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Models: {languageSupport[selectedLanguage].available_models?.join(', ')}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Best Practices</h4>
                <div className="space-y-1">
                  {languageSupport[selectedLanguage].best_practices?.map((practice, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {practice}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Code Display */}
        <div className="space-y-6">
          {generatedCode ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex space-x-1 p-1">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'code'
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Code className="w-4 h-4 mr-2 inline" />
                      Code
                    </button>
                    {generatedCode.tests && (
                      <button
                        onClick={() => setActiveTab('tests')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === 'tests'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <TestTube className="w-4 h-4 mr-2 inline" />
                        Tests
                      </button>
                    )}
                    {generatedCode.documentation && (
                      <button
                        onClick={() => setActiveTab('docs')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === 'docs'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 mr-2 inline" />
                        Documentation
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'code' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCode.code)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => downloadCode(
                              generatedCode.code, 
                              `generated_code.${languageSupport[selectedLanguage]?.file_extension || 'txt'}`
                            )}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedCode.code}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'tests' && generatedCode.tests && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Generated Tests</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCode.tests)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => downloadCode(generatedCode.tests, `test_${Date.now()}.${languageSupport[selectedLanguage]?.file_extension || 'txt'}`)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedCode.tests}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'docs' && generatedCode.documentation && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
                        <button
                          onClick={() => copyToClipboard(generatedCode.documentation)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </button>
                      </div>
                      <div className="prose max-w-none">
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {generatedCode.documentation}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Quality Information */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Quality Assessment</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quality Score</span>
                          <span className="font-semibold text-green-600">
                            {generatedCode.estimated_quality_score || 85}/100
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Complexity</span>
                          <span className="font-semibold text-blue-600">
                            {generatedCode.estimated_complexity || 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Applied Best Practices */}
                    {generatedCode.best_practices_applied && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Applied Best Practices</h5>
                        <div className="flex flex-wrap gap-2">
                          {generatedCode.best_practices_applied.map((practice, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {practice}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {generatedCode.suggestions && generatedCode.suggestions.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Improvement Suggestions</h5>
                        <div className="space-y-2">
                          {generatedCode.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start text-sm text-gray-600">
                              <AlertCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Wand2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Code</h3>
              <p className="text-gray-600">
                Configure your requirements and click "Generate Code" to create optimized code with best practices
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodeGeneration;