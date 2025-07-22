import React, { useState, useEffect } from 'react';
import { 
  Rocket, Globe, Server, Cloud, Settings, Play, 
  Pause, RotateCcw, ExternalLink, Calendar, Clock,
  CheckCircle, AlertCircle, XCircle, Loader, Copy,
  Archive, GitBranch, Activity, TrendingUp, Zap,
  ChevronDown, ChevronRight, Database, Shield
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DeploymentDashboard = ({ onClose, currentProject, professionalMode = true }) => {
  const [platforms, setPlatforms] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [activeTab, setActiveTab] = useState('deployments');
  const [deploymentStats, setDeploymentStats] = useState(null);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState([]);

  useEffect(() => {
    fetchPlatforms();
    fetchEnvironments();
    fetchDeployments();
    fetchDeploymentStats();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deployment/platforms`);
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const fetchEnvironments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deployment/environments`);
      const data = await response.json();
      setEnvironments(data);
    } catch (error) {
      console.error('Error fetching environments:', error);
    }
  };

  const fetchDeployments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/deployment/deployments?limit=20`);
      const data = await response.json();
      setDeployments(data);
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeploymentStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deployment/stats`);
      const data = await response.json();
      setDeploymentStats(data);
    } catch (error) {
      console.error('Error fetching deployment stats:', error);
    }
  };

  const fetchDeploymentLogs = async (deploymentId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deployment/deployments/${deploymentId}/logs`);
      const data = await response.json();
      setDeploymentLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
    }
  };

  const handleDeploy = async (platform, environmentId, branch = 'main') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deployment/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject?.id || 'demo_project',
          environment_id: environmentId,
          platform: platform.id,
          branch
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setShowDeployModal(false);
        await fetchDeployments();
        // Show success notification
      }
    } catch (error) {
      console.error('Error deploying:', error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="w-4 h-4 text-yellow-500" />,
      'building': <Loader className="w-4 h-4 text-blue-500 animate-spin" />,
      'deploying': <Rocket className="w-4 h-4 text-blue-500" />,
      'success': <CheckCircle className="w-4 h-4 text-green-500" />,
      'failed': <XCircle className="w-4 h-4 text-red-500" />,
      'cancelled': <AlertCircle className="w-4 h-4 text-gray-500" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      'building': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'deploying': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'success': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'failed': 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status] || colors.pending;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const PlatformCard = ({ platform, onSelect }) => (
    <div 
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onSelect(platform)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {platform.setup_difficulty}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {platform.description}
      </p>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {platform.supported_frameworks.slice(0, 3).map(framework => (
            <span
              key={framework}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
            >
              {framework}
            </span>
          ))}
          {platform.supported_frameworks.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{platform.supported_frameworks.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>{platform.pricing}</p>
      </div>
    </div>
  );

  const DeploymentCard = ({ deployment }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon(deployment.status)}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {deployment.platform}
              </h3>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(deployment.status)}`}>
                {deployment.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {deployment.branch} • {deployment.commit_hash}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => {
              setSelectedDeployment(deployment);
              setShowLogsModal(true);
              fetchDeploymentLogs(deployment.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {deployment.commit_message}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatTimeAgo(deployment.created_at)}</span>
        {deployment.build_time && (
          <span>Build: {deployment.build_time}s</span>
        )}
      </div>
    </div>
  );

  const EnvironmentCard = ({ environment }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            environment.type === 'production' ? 'bg-red-500' :
            environment.type === 'staging' ? 'bg-yellow-500' :
            environment.type === 'development' ? 'bg-blue-500' : 'bg-gray-500'
          }`} />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {environment.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {environment.branch} branch
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {environment.url && (
            <a
              href={environment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {environment.auto_deploy && (
            <div className="flex items-center space-x-1 text-green-600">
              <Zap className="w-3 h-3" />
              <span className="text-xs">Auto-deploy</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Last deployed: {formatTimeAgo(environment.last_deployed)}
      </div>
    </div>
  );

  const DeployModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Deploy Project
            </h2>
            <button
              onClick={() => setShowDeployModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map(platform => (
              <PlatformCard 
                key={platform.id} 
                platform={platform} 
                onSelect={(platform) => {
                  // For demo, deploy to first environment
                  if (environments.length > 0) {
                    handleDeploy(platform, environments[0].id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const LogsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Deployment Logs
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedDeployment?.platform} • {selectedDeployment?.id}
              </p>
            </div>
            <button
              onClick={() => setShowLogsModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
            {deploymentLogs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{log.timestamp}]</span> 
                <span className={`ml-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'success' ? 'text-green-400' :
                  log.level === 'info' ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      {deploymentStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Deployments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {deploymentStats.total_deployments}
                  </p>
                </div>
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deploymentStats.success_rate}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Build Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {deploymentStats.average_build_time}s
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Failed Deployments</p>
                  <p className="text-2xl font-bold text-red-600">
                    {deploymentStats.failed_deployments}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Statistics</h3>
            <div className="space-y-3">
              {deploymentStats.platform_statistics.map(stat => (
                <div key={stat.platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stat.platform}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.deployments} deployments
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {stat.success_rate}% success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-40 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Rocket className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Deployment Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeployModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Deploy</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('deployments')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'deployments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Deployments</span>
            </button>
            <button
              onClick={() => setActiveTab('environments')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'environments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Environments</span>
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'platforms'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Platforms</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Statistics</span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'deployments' && (
                <div className="space-y-4">
                  {deployments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deployments.map(deployment => (
                        <DeploymentCard key={deployment.id} deployment={deployment} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Deployments Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Deploy your project to get started with continuous delivery.
                      </p>
                      <button
                        onClick={() => setShowDeployModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Deploy Now
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'environments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {environments.map(environment => (
                    <EnvironmentCard key={environment.id} environment={environment} />
                  ))}
                </div>
              )}
              
              {activeTab === 'platforms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platforms.map(platform => (
                    <PlatformCard 
                      key={platform.id} 
                      platform={platform} 
                      onSelect={setSelectedPlatform}
                    />
                  ))}
                </div>
              )}
              
              {activeTab === 'stats' && <StatsTab />}
            </>
          )}
        </div>
      </div>
      
      {showDeployModal && <DeployModal />}
      {showLogsModal && <LogsModal />}
    </div>
  );
};

export default DeploymentDashboard;