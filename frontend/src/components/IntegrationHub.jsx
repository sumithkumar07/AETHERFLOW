import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Search,
  Filter,
  Zap,
  Shield,
  Cloud,
  MessageSquare,
  Database,
  BarChart3,
  GitBranch,
  Monitor,
  Smartphone,
  Star,
  Download,
  Users,
  DollarSign
} from 'lucide-react';

const IntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [integrations, setIntegrations] = useState([]);
  const [activeIntegrations, setActiveIntegrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Filter },
    { id: 'version_control', name: 'Version Control', icon: GitBranch },
    { id: 'ci_cd', name: 'CI/CD', icon: Zap },
    { id: 'cloud_platform', name: 'Cloud', icon: Cloud },
    { id: 'monitoring', name: 'Monitoring', icon: Monitor },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    fetchIntegrations();
    fetchActiveIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/enhanced/marketplace');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.marketplace);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    }
  };

  const fetchActiveIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/enhanced/status');
      const data = await response.json();
      if (data.success) {
        setActiveIntegrations(Object.entries(data.integrations || {}));
      }
    } catch (error) {
      console.error('Failed to fetch active integrations:', error);
    }
  };

  const getProviderIcon = (providerId) => {
    const icons = {
      github: GitBranch,
      aws: Cloud,
      datadog: Monitor,
      slack: MessageSquare,
      mongodb_atlas: Database,
      mixpanel: BarChart3,
      jenkins: Zap,
      snyk: Shield
    };
    return icons[providerId] || ExternalLink;
  };

  const getPricingBadge = (pricing) => {
    const badges = {
      freemium: { color: 'bg-green-100 text-green-800', text: 'Freemium' },
      subscription: { color: 'bg-blue-100 text-blue-800', text: 'Subscription' },
      pay_as_you_go: { color: 'bg-purple-100 text-purple-800', text: 'Pay as you go' },
      free: { color: 'bg-gray-100 text-gray-800', text: 'Free' }
    };
    return badges[pricing] || { color: 'bg-gray-100 text-gray-800', text: 'Contact for pricing' };
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const InstallIntegration = ({ integration }) => {
    const [isInstalling, setIsInstalling] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);

    const handleInstall = async () => {
      setIsInstalling(true);
      // Simulate installation
      setTimeout(() => {
        setIsInstalling(false);
        setShowSetupModal(true);
      }, 2000);
    };

    return (
      <>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          {isInstalling ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Installing...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Install
            </>
          )}
        </button>

        {showSetupModal && (
          <SetupModal 
            integration={integration} 
            onClose={() => setShowSetupModal(false)}
            onComplete={() => {
              setShowSetupModal(false);
              fetchActiveIntegrations();
            }}
          />
        )}
      </>
    );
  };

  const SetupModal = ({ integration, onClose, onComplete }) => {
    const [setupStep, setSetupStep] = useState(1);
    const [config, setConfig] = useState({});

    const handleSetupComplete = async () => {
      try {
        const response = await fetch('/api/integrations/enhanced/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: integration.provider_id,
            config: config
          })
        });
        
        if (response.ok) {
          onComplete();
        }
      } catch (error) {
        console.error('Setup failed:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Setup {integration.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {setupStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Active {integration.name} account
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    API access permissions
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Administrator privileges
                  </div>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Token
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setConfig({...config, api_token: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization/Team
                    </label>
                    <input
                      type="text"
                      placeholder="Enter organization name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setConfig({...config, organization: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Testing Connection</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verifying connection...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setupStep > 1 ? setSetupStep(setupStep - 1) : onClose()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {setupStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={() => {
                  if (setupStep < 3) {
                    setSetupStep(setupStep + 1);
                  } else {
                    handleSetupComplete();
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {setupStep === 3 ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              Integration Hub
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with your favorite tools and services
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'installed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Installed ({activeIntegrations.length})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Recommended
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'marketplace' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => {
              const Icon = getProviderIcon(integration.provider_id);
              const pricingBadge = getPricingBadge(integration.pricing);
              
              return (
                <motion.div
                  key={integration.provider_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center mr-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(integration.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              {integration.rating}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${pricingBadge.color}`}>
                            {pricingBadge.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {integration.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {integration.installs?.toLocaleString()} installs
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {integration.category}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <InstallIntegration integration={integration} />
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'installed' && (
        <div className="space-y-6">
          {activeIntegrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations installed</h3>
              <p className="text-gray-600 mb-6">
                Connect your favorite tools to get started with integrations
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeIntegrations.map(([providerId, integration]) => {
                const Icon = getProviderIcon(providerId);
                
                return (
                  <div
                    key={providerId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {providerId.replace('_', ' ')}
                          </h3>
                          <div className="flex items-center mt-1">
                            {integration.health?.status === 'healthy' ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className="text-xs text-gray-500">
                              {integration.health?.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          integration.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Sync:</span>
                        <span>{integration.last_sync ? new Date(integration.last_sync).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                        Configure
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm">
                        Sync Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recommended for You</h2>
          
          <div className="space-y-4">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">GitHub Integration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Essential for version control and collaboration
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">High Priority</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Install
                </button>
              </div>
            </div>

            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <Monitor className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Monitoring Solution</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep track of your application performance
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium Priority</span>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;