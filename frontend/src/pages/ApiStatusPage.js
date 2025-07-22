import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, CheckCircle, AlertTriangle, XCircle, Clock, 
  ArrowRight, RefreshCcw, Globe, Database, Server,
  Activity, TrendingUp, AlertCircle, Info, Wifi,
  GitBranch, Cloud, Shield, Cpu, HardDrive
} from 'lucide-react';
import MicroInteractions from '../components/MicroInteractions';
import EnhancedLoadingComponents from '../components/EnhancedLoadingComponents';

const ApiStatusPage = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const overallStatus = 'operational'; // 'operational', 'degraded', 'maintenance', 'major_outage'

  const services = [
    {
      id: 'api-core',
      name: 'Core API',
      description: 'Main AETHERFLOW API endpoints',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '45ms',
      icon: <Server className="w-5 h-5" />,
      region: 'Global',
      lastIncident: null,
      metrics: {
        requests: '12.3M',
        errors: '0.1%',
        availability: '99.9%'
      }
    },
    {
      id: 'cosmic-engine',
      name: 'Cosmic Reality Engine',
      description: 'Quantum-level processing and reality shifting capabilities',
      status: 'operational',
      uptime: '99.8%',
      responseTime: '72ms',
      icon: <Zap className="w-5 h-5" />,
      region: 'Multi-dimensional',
      lastIncident: '3 days ago',
      metrics: {
        requests: '2.1M',
        errors: '0.2%',
        availability: '99.8%'
      }
    },
    {
      id: 'ai-services',
      name: 'AI & ML Services',
      description: 'Code generation, analysis, and AI pair programming',
      status: 'operational',
      uptime: '99.7%',
      responseTime: '156ms',
      icon: <Cpu className="w-5 h-5" />,
      region: 'US-East, EU-West',
      lastIncident: null,
      metrics: {
        requests: '5.8M',
        errors: '0.3%',
        availability: '99.7%'
      }
    },
    {
      id: 'collaboration',
      name: 'Collaboration Services',
      description: 'Real-time collaboration and quantum entanglement',
      status: 'degraded',
      uptime: '98.2%',
      responseTime: '203ms',
      icon: <Globe className="w-5 h-5" />,
      region: 'Global',
      lastIncident: '2 hours ago',
      metrics: {
        requests: '1.9M',
        errors: '1.8%',
        availability: '98.2%'
      }
    },
    {
      id: 'database',
      name: 'Database Cluster',
      description: 'Primary data storage and cosmic memory banks',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '23ms',
      icon: <Database className="w-5 h-5" />,
      region: 'Multi-region',
      lastIncident: '1 week ago',
      metrics: {
        requests: '45.2M',
        errors: '0.1%',
        availability: '99.9%'
      }
    },
    {
      id: 'file-storage',
      name: 'File Storage',
      description: 'Project files and dimensional artifacts storage',
      status: 'operational',
      uptime: '99.8%',
      responseTime: '89ms',
      icon: <HardDrive className="w-5 h-5" />,
      region: 'Global CDN',
      lastIncident: null,
      metrics: {
        requests: '3.4M',
        errors: '0.2%',
        availability: '99.8%'
      }
    },
    {
      id: 'auth-services',
      name: 'Authentication',
      description: 'User authentication and cosmic identity management',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '31ms',
      icon: <Shield className="w-5 h-5" />,
      region: 'Global',
      lastIncident: null,
      metrics: {
        requests: '8.7M',
        errors: '0.1%',
        availability: '99.9%'
      }
    },
    {
      id: 'webhooks',
      name: 'Webhooks & Events',
      description: 'Real-time event delivery and cosmic notifications',
      status: 'maintenance',
      uptime: '99.5%',
      responseTime: '12ms',
      icon: <Wifi className="w-5 h-5" />,
      region: 'Global',
      lastIncident: 'Scheduled maintenance',
      metrics: {
        requests: '15.6M',
        errors: '0.5%',
        availability: '99.5%'
      }
    }
  ];

  const incidents = [
    {
      id: '1',
      title: 'Collaboration Services Performance Degradation',
      status: 'investigating',
      severity: 'minor',
      startTime: '2 hours ago',
      description: 'We are investigating reports of slower response times in our collaboration services. Most functionality remains operational.',
      updates: [
        {
          time: '2 hours ago',
          message: 'We are investigating reports of performance issues with collaboration services.',
          status: 'investigating'
        },
        {
          time: '1.5 hours ago', 
          message: 'Issue has been identified as increased traffic in the quantum entanglement layer. Working on scaling solutions.',
          status: 'identified'
        }
      ]
    },
    {
      id: '2',
      title: 'Scheduled Maintenance - Webhooks System',
      status: 'scheduled',
      severity: 'maintenance',
      startTime: '30 minutes ago',
      description: 'Scheduled maintenance to upgrade webhook delivery infrastructure for improved reliability.',
      updates: [
        {
          time: '30 minutes ago',
          message: 'Maintenance started. Webhook delivery may experience delays during this period.',
          status: 'in_progress'
        }
      ]
    }
  ];

  const metrics = {
    '24h': {
      uptime: '99.2%',
      requests: '127.3M',
      avgResponse: '67ms',
      incidents: 2
    },
    '7d': {
      uptime: '99.6%',
      requests: '891.2M',
      avgResponse: '71ms',
      incidents: 3
    },
    '30d': {
      uptime: '99.8%',
      requests: '3.2B',
      avgResponse: '68ms',
      incidents: 5
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'maintenance':
        return 'text-blue-400';
      case 'major_outage':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'major_outage':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getOverallStatusMessage = () => {
    switch (overallStatus) {
      case 'operational':
        return 'All systems operational';
      case 'degraded':
        return 'Some services experiencing issues';
      case 'maintenance':
        return 'Scheduled maintenance in progress';
      case 'major_outage':
        return 'Major service disruption';
      default:
        return 'Status unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MicroInteractions />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-surface border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AETHERFLOW
                </span>
              </Link>
              <div className="ml-8 text-gray-400">
                <span>/</span>
                <span className="ml-2 text-white">API Status</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? (
                  <EnhancedLoadingComponents.Spinner size="sm" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                <span className="ml-2">Refresh</span>
              </button>
              
              <Link to="/dashboard" className="btn btn-primary">
                <ArrowRight className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              API Status Dashboard
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Real-time status of AETHERFLOW services and cosmic infrastructure
            </p>
            
            {/* Overall Status */}
            <div className="inline-flex items-center space-x-3 glass-surface px-6 py-3 rounded-full border border-slate-600">
              {getStatusIcon(overallStatus)}
              <span className={`font-semibold ${getStatusColor(overallStatus)}`}>
                {getOverallStatusMessage()}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="glass-surface p-6 rounded-2xl border border-slate-600 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {metrics[selectedTimeframe].uptime}
              </div>
              <div className="text-sm text-gray-400">Overall Uptime</div>
            </div>
            
            <div className="glass-surface p-6 rounded-2xl border border-slate-600 text-center">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {metrics[selectedTimeframe].requests}
              </div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
            
            <div className="glass-surface p-6 rounded-2xl border border-slate-600 text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {metrics[selectedTimeframe].avgResponse}
              </div>
              <div className="text-sm text-gray-400">Avg Response Time</div>
            </div>
            
            <div className="glass-surface p-6 rounded-2xl border border-slate-600 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {metrics[selectedTimeframe].incidents}
              </div>
              <div className="text-sm text-gray-400">Active Incidents</div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-center mb-8">
            <div className="flex border border-slate-600 rounded-lg overflow-hidden">
              {['24h', '7d', '30d'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 ${
                    selectedTimeframe === timeframe
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {timeframe === '24h' ? 'Last 24 Hours' : 
                   timeframe === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Current Incidents */}
          {incidents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-400" />
                Current Incidents
              </h2>
              
              <div className="space-y-4">
                {incidents.map(incident => (
                  <div key={incident.id} className="glass-surface p-6 rounded-2xl border border-slate-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{incident.title}</h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`capitalize ${
                            incident.status === 'investigating' ? 'text-yellow-400' :
                            incident.status === 'resolved' ? 'text-green-400' :
                            incident.status === 'scheduled' ? 'text-blue-400' : 'text-red-400'
                          }`}>
                            {incident.status}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">{incident.startTime}</span>
                          <span className="text-gray-400">•</span>
                          <span className={`capitalize ${
                            incident.severity === 'minor' ? 'text-yellow-400' :
                            incident.severity === 'major' ? 'text-red-400' :
                            incident.severity === 'maintenance' ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{incident.description}</p>
                    
                    <div className="space-y-3">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <div className="text-sm text-gray-400">{update.time}</div>
                            <div className="text-gray-300">{update.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Status */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Server className="w-6 h-6 mr-2 text-blue-400" />
              Service Status
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {services.map(service => (
                <div key={service.id} className="glass-surface p-6 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        service.status === 'operational' ? 'bg-green-500/20' :
                        service.status === 'degraded' ? 'bg-yellow-500/20' :
                        service.status === 'maintenance' ? 'bg-blue-500/20' : 'bg-red-500/20'
                      }`}>
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(service.status)}
                        <span className={`text-sm capitalize ${getStatusColor(service.status)}`}>
                          {service.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{service.region}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm font-bold text-white">{service.uptime}</div>
                      <div className="text-xs text-gray-400">Uptime</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{service.responseTime}</div>
                      <div className="text-xs text-gray-400">Response</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{service.metrics.requests}</div>
                      <div className="text-xs text-gray-400">Requests</div>
                    </div>
                  </div>
                  
                  {service.lastIncident && (
                    <div className="mt-4 text-xs text-gray-400">
                      Last incident: {service.lastIncident}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-400">
            <p className="mb-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
            <p className="text-sm">
              Status updates are refreshed every 30 seconds. 
              For critical issues, contact{' '}
              <Link to="/contact" className="text-purple-400 hover:text-purple-300">
                support@aetherflow.dev
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusPage;