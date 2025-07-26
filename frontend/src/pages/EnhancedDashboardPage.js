import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  Plus, Code, Users, Star, Zap, TrendingUp, Calendar,
  FolderOpen, GitBranch, Clock, Activity, Settings,
  Search, Filter, Grid, List, Download, Share,
  AlertTriangle, CheckCircle, Info, Bell
} from 'lucide-react';

const EnhancedDashboardPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [realtimeData, setRealtimeData] = useState({
    activeCollaborators: 5,
    codeLines: 12847,
    deploymentsToday: 8,
    testsRunning: 3
  });

  // Mock project data with professional structure
  const [projects] = useState([
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Modern React/Node.js e-commerce solution',
      type: 'Full-Stack',
      status: 'active',
      lastModified: '2 hours ago',
      collaborators: 4,
      progress: 85,
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      deployments: 12,
      uptime: 99.9
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      description: 'Secure React Native banking application',
      type: 'Mobile',
      status: 'testing',
      lastModified: '1 day ago',
      collaborators: 6,
      progress: 92,
      techStack: ['React Native', 'Firebase', 'TypeScript'],
      deployments: 8,
      uptime: 99.8
    },
    {
      id: 3,
      name: 'AI Analytics Dashboard',
      description: 'Real-time data visualization platform',
      type: 'Analytics',
      status: 'deployed',
      lastModified: '3 hours ago',
      collaborators: 3,
      progress: 100,
      techStack: ['Vue.js', 'Python', 'MongoDB'],
      deployments: 24,
      uptime: 99.95
    },
    {
      id: 4,
      name: 'Microservices API',
      description: 'Scalable microservices architecture',
      type: 'Backend',
      status: 'active',
      lastModified: '30 minutes ago',
      collaborators: 8,
      progress: 78,
      techStack: ['Go', 'Docker', 'Kubernetes'],
      deployments: 35,
      uptime: 99.7
    }
  ]);

  const [teamActivity] = useState([
    {
      user: 'Sarah Chen',
      action: 'pushed 3 commits',
      project: 'E-commerce Platform',
      time: '5 minutes ago',
      type: 'commit'
    },
    {
      user: 'Marcus Rodriguez',
      action: 'deployed to production',
      project: 'Mobile Banking App',
      time: '12 minutes ago',
      type: 'deployment'
    },
    {
      user: 'Elena Vasquez',
      action: 'created pull request',
      project: 'AI Analytics Dashboard',
      time: '25 minutes ago',
      type: 'pr'
    },
    {
      user: 'David Kim',
      action: 'completed code review',
      project: 'Microservices API',
      time: '1 hour ago',
      type: 'review'
    }
  ]);

  const [usageAnalytics] = useState({
    thisMonth: {
      codeGenerated: 45678,
      aiAssistance: 1234,
      collaborations: 89,
      deployments: 156
    },
    growth: {
      codeGenerated: 23,
      aiAssistance: 45,
      collaborations: 12,
      deployments: 34
    }
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeCollaborators: Math.floor(Math.random() * 3) + 4,
        codeLines: prev.codeLines + Math.floor(Math.random() * 10),
        deploymentsToday: prev.deploymentsToday + (Math.random() > 0.8 ? 1 : 0),
        testsRunning: Math.floor(Math.random() * 5) + 1
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'testing': return 'text-yellow-500';
      case 'deployed': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'testing': return <AlertTriangle className="w-4 h-4" />;
      case 'deployed': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-page">
      <ProfessionalHeader />
      
      <div className="dashboard-container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                Welcome back, {user?.name} ✨
              </h1>
              <p className="welcome-subtitle">
                Ready to continue your reality-bending development journey?
              </p>
            </div>
            
            <div className="welcome-actions">
              <button 
                onClick={() => navigate('/ide')}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button 
                onClick={() => navigate('/integrations')}
                className="btn btn-secondary"
              >
                <Code className="w-4 h-4" />
                Browse Integrations
              </button>
            </div>
          </div>
        </section>

        {/* Real-time Stats */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <Users className="w-5 h-5 text-green-500" />
                <span className="stat-title">Collaborators</span>
              </div>
              <div className="stat-value">{realtimeData.activeCollaborators}</div>
              <div className="stat-subtitle">Online now</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="stat-title">VIBE Tokens</span>
              </div>
              <div className="stat-value">1,000</div>
              <div className="stat-subtitle">
                Professional
                <span className="level-badge">Level</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <Code className="w-5 h-5 text-blue-500" />
                <span className="stat-title">Code Lines</span>
              </div>
              <div className="stat-value">{realtimeData.codeLines.toLocaleString()}</div>
              <div className="stat-subtitle">Generated this month</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="stat-title">Deployments</span>
              </div>
              <div className="stat-value">{realtimeData.deploymentsToday}</div>
              <div className="stat-subtitle">Today</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              onClick={() => navigate('/ide')}
              className="action-card"
            >
              <div className="action-icon">
                <Plus className="w-6 h-6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">New Project</h3>
                <p className="action-description">Start a new cosmic development project</p>
              </div>
            </button>
            
            <button className="action-card">
              <div className="action-icon">
                <GitBranch className="w-6 h-6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">Import Repository</h3>
                <p className="action-description">Import from GitHub or other sources</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/team')}
              className="action-card"
            >
              <div className="action-icon">
                <Users className="w-6 h-6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">Join Team</h3>
                <p className="action-description">Collaborate on existing projects</p>
              </div>
            </button>
            
            <button className="action-card">
              <div className="action-icon">
                <Zap className="w-6 h-6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">AI Code Gen</h3>
                <p className="action-description">Generate project with AI assistance</p>
              </div>
            </button>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section">
          <div className="projects-header">
            <h2 className="section-title">Your Projects</h2>
            <div className="projects-controls">
              <div className="search-box">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="full-stack">Full-Stack</option>
                <option value="mobile">Mobile</option>
                <option value="analytics">Analytics</option>
                <option value="backend">Backend</option>
              </select>
              
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className={`projects-grid ${viewMode}`}>
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-info">
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                  </div>
                  <div className={`project-status ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="status-text">{project.status}</span>
                  </div>
                </div>
                
                <div className="project-stats">
                  <div className="stat">
                    <Users className="w-4 h-4" />
                    <span>{project.collaborators} collaborators</span>
                  </div>
                  <div className="stat">
                    <Clock className="w-4 h-4" />
                    <span>{project.lastModified}</span>
                  </div>
                </div>
                
                <div className="project-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="project-tech">
                  {project.techStack.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
                
                <div className="project-actions">
                  <button 
                    onClick={() => navigate('/ide')}
                    className="btn btn-primary btn-sm"
                  >
                    Open IDE
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Share className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-sidebar">
          {/* Team Activity */}
          <section className="activity-section">
            <h3 className="sidebar-title">Team Activity</h3>
            <div className="activity-list">
              {teamActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-avatar">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.user}</strong> {activity.action}
                    </div>
                    <div className="activity-meta">
                      <span className="activity-project">{activity.project}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Usage Analytics */}
          <section className="analytics-section">
            <h3 className="sidebar-title">Usage Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-item">
                <div className="analytics-label">Code Generated</div>
                <div className="analytics-value">
                  {usageAnalytics.thisMonth.codeGenerated.toLocaleString()}
                  <span className="analytics-growth">
                    +{usageAnalytics.growth.codeGenerated}%
                  </span>
                </div>
              </div>
              
              <div className="analytics-item">
                <div className="analytics-label">AI Assistance</div>
                <div className="analytics-value">
                  {usageAnalytics.thisMonth.aiAssistance}
                  <span className="analytics-growth">
                    +{usageAnalytics.growth.aiAssistance}%
                  </span>
                </div>
              </div>
              
              <div className="analytics-item">
                <div className="analytics-label">Collaborations</div>
                <div className="analytics-value">
                  {usageAnalytics.thisMonth.collaborations}
                  <span className="analytics-growth">
                    +{usageAnalytics.growth.collaborations}%
                  </span>
                </div>
              </div>
              
              <div className="analytics-item">
                <div className="analytics-label">Deployments</div>
                <div className="analytics-value">
                  {usageAnalytics.thisMonth.deployments}
                  <span className="analytics-growth">
                    +{usageAnalytics.growth.deployments}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="notifications-section">
            <h3 className="sidebar-title">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="notification-list">
              <div className="notification-item">
                <div className="notification-icon success">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="notification-content">
                  <div className="notification-text">Deployment successful</div>
                  <div className="notification-time">2 minutes ago</div>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon warning">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="notification-content">
                  <div className="notification-text">High memory usage detected</div>
                  <div className="notification-time">15 minutes ago</div>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon info">
                  <Info className="w-4 h-4" />
                </div>
                <div className="notification-content">
                  <div className="notification-text">New team member joined</div>
                  <div className="notification-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;