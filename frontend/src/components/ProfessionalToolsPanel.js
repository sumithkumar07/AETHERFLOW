import React, { useState, useCallback } from 'react';
import { 
  Settings, X, Bot, Zap, Target, Gauge, Award, Star, 
  Code2, TestTube, Sparkles, Brain, Activity, Layers,
  Play, Pause, RotateCcw, Download, Upload, Share2,
  Cpu, Database, Globe, Shield, Lock, Unlock
} from 'lucide-react';

const ProfessionalToolsPanel = ({ 
  onAction, 
  isVisible, 
  onClose, 
  credits = 0, 
  userLevel = 'Developer',
  currentAssistant = null 
}) => {
  const [activeSection, setActiveSection] = useState('assistants');
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  // Professional AI Assistants (transformed from Avatar Pantheon)
  const assistants = [
    {
      id: 'senior-dev',
      name: 'Senior Developer',
      specialty: 'Code Review & Architecture',
      avatar: '👨‍💻',
      description: 'Expert in code architecture, best practices, and performance optimization.',
      cost: 50,
      available: true
    },
    {
      id: 'ai-specialist',
      name: 'AI Specialist',
      specialty: 'Machine Learning & AI',
      avatar: '🤖',
      description: 'Specialized in AI/ML implementations, neural networks, and data science.',
      cost: 75,
      available: credits >= 75
    },
    {
      id: 'security-expert',
      name: 'Security Expert',
      specialty: 'Security & Compliance',
      avatar: '🔒',
      description: 'Focused on security best practices, vulnerability assessment, and compliance.',
      cost: 60,
      available: credits >= 60
    },
    {
      id: 'performance-guru',
      name: 'Performance Guru',
      specialty: 'Performance Optimization',
      avatar: '⚡',
      description: 'Specialist in performance tuning, optimization, and scalability.',
      cost: 55,
      available: credits >= 55
    },
    {
      id: 'ui-designer',
      name: 'UI/UX Designer',
      specialty: 'Design & User Experience',
      avatar: '🎨',
      description: 'Expert in user interface design, user experience, and design systems.',
      cost: 45,
      available: credits >= 45
    }
  ];

  // Professional Stress Tests (transformed from Chaos Forge)
  const stressTests = [
    {
      id: 'high-load',
      name: 'High Load Simulation',
      description: 'Simulate 10,000+ concurrent users',
      cost: 75,
      duration: 30000,
      available: credits >= 75
    },
    {
      id: 'memory-stress',
      name: 'Memory Pressure Test',
      description: 'Test application under memory constraints',
      cost: 60,
      duration: 25000,
      available: credits >= 60
    },
    {
      id: 'network-latency',
      name: 'Network Latency Simulation',
      description: 'Simulate slow network conditions',
      cost: 50,
      duration: 20000,
      available: credits >= 50
    },
    {
      id: 'error-injection',
      name: 'Error Injection Testing',
      description: 'Introduce random errors to test resilience',
      cost: 80,
      duration: 35000,
      available: credits >= 80
    }
  ];

  // Development Tools (transformed from other cosmic features)
  const developmentTools = [
    {
      id: 'code-analysis',
      name: 'Code Quality Analysis',
      description: 'Analyze code quality, complexity, and maintainability',
      icon: Gauge,
      cost: 25,
      available: credits >= 25
    },
    {
      id: 'dependency-audit',
      name: 'Dependency Audit',
      description: 'Check for security vulnerabilities in dependencies',
      icon: Shield,
      cost: 30,
      available: credits >= 30
    },
    {
      id: 'performance-profile',
      name: 'Performance Profiling',
      description: 'Profile application performance and identify bottlenecks',
      icon: Activity,
      cost: 40,
      available: credits >= 40
    },
    {
      id: 'code-generation',
      name: 'Smart Code Generation',
      description: 'Generate boilerplate code and documentation',
      icon: Code2,
      cost: 35,
      available: credits >= 35
    }
  ];

  const handleAssistantActivation = useCallback((assistant) => {
    if (!assistant.available || credits < assistant.cost) {
      return;
    }

    onAction({
      type: 'assistant_activated',
      assistant,
      cost: assistant.cost
    });
  }, [credits, onAction]);

  const handleStressTest = useCallback((test) => {
    if (!test.available || credits < test.cost) {
      return;
    }

    setIsStressTesting(true);
    onAction({
      type: 'stress_test_activated',
      test,
      cost: test.cost
    });

    setTimeout(() => {
      setIsStressTesting(false);
    }, test.duration);
  }, [credits, onAction]);

  const handleToolExecution = useCallback(async (tool) => {
    if (!tool.available || credits < tool.cost) {
      return;
    }

    setAnalysisRunning(true);

    // Simulate tool execution
    setTimeout(() => {
      onAction({
        type: 'tool_executed',
        tool,
        cost: tool.cost,
        result: {
          success: true,
          summary: `${tool.name} completed successfully`
        }
      });
      setAnalysisRunning(false);
    }, 3000);
  }, [credits, onAction]);

  const handleFocusMode = useCallback(() => {
    onAction({
      type: 'focus_mode_activated',
      bonuses: {
        duration: 30000
      },
      cost: 20
    });
  }, [onAction]);

  if (!isVisible) return null;

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col professional-tools-panel fade-in">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center space-x-2">
          <Settings size={16} className="text-blue-400" />
          <span>Professional Tools</span>
        </div>
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-sm"
        >
          <X size={16} />
        </button>
      </div>

      {/* Credits Display */}
      <div className="p-4 border-b border-slate-700">
        <div className="credits-display">
          <Star size={16} className="text-yellow-400" />
          <span className="font-semibold">{credits}</span>
          <span className="text-sm text-gray-400">Credits</span>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-400">
          <Award size={12} className="text-purple-400 mr-1" />
          <span>{userLevel}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: 'assistants', label: 'AI Assistants', icon: Bot },
          { id: 'testing', label: 'Testing', icon: TestTube },
          { id: 'tools', label: 'Tools', icon: Zap }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
              activeSection === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <Icon size={14} />
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'assistants' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">AI Assistants</h3>
            {assistants.map((assistant) => (
              <div
                key={assistant.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentAssistant?.id === assistant.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : assistant.available
                    ? 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    : 'border-slate-700 bg-slate-800/50 opacity-50'
                }`}
                onClick={() => handleAssistantActivation(assistant)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{assistant.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-white truncate">
                        {assistant.name}
                      </h4>
                      <div className="flex items-center text-xs text-yellow-400">
                        <Star size={10} className="mr-1" />
                        {assistant.cost}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{assistant.specialty}</p>
                    <p className="text-xs text-gray-500">{assistant.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'testing' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Stress Testing</h3>
              {isStressTesting && (
                <div className="flex items-center text-xs text-orange-400">
                  <Activity size={12} className="mr-1 animate-pulse" />
                  Running
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <button
                onClick={handleFocusMode}
                className="w-full btn btn-primary btn-sm"
                disabled={credits < 20}
              >
                <Target size={14} />
                <span>Activate Focus Mode (20 credits)</span>
              </button>
            </div>

            {stressTests.map((test) => (
              <div
                key={test.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  test.available
                    ? 'border-slate-600 bg-slate-700/50 hover:border-orange-500'
                    : 'border-slate-700 bg-slate-800/50 opacity-50'
                }`}
                onClick={() => handleStressTest(test)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-white">{test.name}</h4>
                  <div className="flex items-center text-xs text-yellow-400">
                    <Star size={10} className="mr-1" />
                    {test.cost}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{test.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Duration: {test.duration / 1000}s
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'tools' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Development Tools</h3>
              {analysisRunning && (
                <div className="flex items-center text-xs text-blue-400">
                  <Cpu size={12} className="mr-1 spin" />
                  Analyzing
                </div>
              )}
            </div>

            {developmentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    tool.available
                      ? 'border-slate-600 bg-slate-700/50 hover:border-blue-500'
                      : 'border-slate-700 bg-slate-800/50 opacity-50'
                  }`}
                  onClick={() => handleToolExecution(tool)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-md">
                      <Icon size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-white truncate">
                          {tool.name}
                        </h4>
                        <div className="flex items-center text-xs text-yellow-400">
                          <Star size={10} className="mr-1" />
                          {tool.cost}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{tool.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-secondary btn-sm">
                  <Download size={12} />
                  Export
                </button>
                <button className="btn btn-secondary btn-sm">
                  <Upload size={12} />
                  Import
                </button>
                <button className="btn btn-secondary btn-sm">
                  <Share2 size={12} />
                  Share
                </button>
                <button className="btn btn-secondary btn-sm">
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with current assistant info */}
      {currentAssistant && (
        <div className="border-t border-slate-700 p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="text-lg">{currentAssistant.avatar}</div>
            <div>
              <div className="text-white font-medium">{currentAssistant.name}</div>
              <div className="text-gray-400 text-xs">Currently Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalToolsPanel;