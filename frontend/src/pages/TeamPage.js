import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  Users, Plus, Search, Filter, Crown, Shield, 
  Settings, Mail, Phone, Calendar, Activity,
  MoreVertical, Edit, Trash2, UserPlus, Star,
  Clock, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';

const TeamPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e7?w=150',
      status: 'online',
      joinDate: '2023-01-15',
      lastActive: 'now',
      projects: 8,
      contributions: 2847,
      skills: ['React', 'Node.js', 'AI/ML']
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@company.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      status: 'online',
      joinDate: '2023-02-20',
      lastActive: '2 min ago',
      projects: 12,
      contributions: 3254,
      skills: ['Python', 'DevOps', 'Cloud']
    },
    {
      id: 3,
      name: 'Elena Vasquez',
      email: 'elena.vasquez@company.com',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      status: 'away',
      joinDate: '2023-03-10',
      lastActive: '1 hour ago',
      projects: 6,
      contributions: 1896,
      skills: ['Vue.js', 'Go', 'Analytics']
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'offline',
      joinDate: '2023-04-05',
      lastActive: '3 hours ago',
      projects: 4,
      contributions: 1234,
      skills: ['Mobile', 'React Native', 'TypeScript']
    }
  ]);

  const [teamStats] = useState({
    totalMembers: 4,
    activeProjects: 12,
    completedTasks: 1847,
    codeReviews: 89,
    avgResponseTime: '2.3h',
    teamProductivity: 94
  });

  const [recentActivity] = useState([
    {
      user: 'Sarah Chen',
      action: 'reviewed pull request',
      target: 'Mobile Banking App',
      time: '5 minutes ago',
      type: 'review'
    },
    {
      user: 'Marcus Rodriguez',
      action: 'deployed to staging',
      target: 'E-commerce Platform',
      time: '15 minutes ago',
      type: 'deployment'
    },
    {
      user: 'Elena Vasquez',
      action: 'created branch',
      target: 'Analytics Dashboard',
      time: '30 minutes ago',
      type: 'git'
    },
    {
      user: 'David Kim',
      action: 'completed task',
      target: 'Push notifications feature',
      time: '1 hour ago',
      type: 'task'
    }
  ]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'developer':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="team-page">
      <ProfessionalHeader />
      
      <div className="team-container">
        <div className="team-header">
          <div className="header-content">
            <h1 className="page-title">Team Management</h1>
            <p className="page-subtitle">
              Manage your development team and track collaboration
            </p>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-secondary">
              <Settings className="w-4 h-4" />
              Team Settings
            </button>
            <button className="btn btn-primary">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <section className="team-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.totalMembers}</div>
                <div className="stat-label">Team Members</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.activeProjects}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.completedTasks}</div>
                <div className="stat-label">Completed Tasks</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.avgResponseTime}</div>
                <div className="stat-label">Avg Response Time</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.teamProductivity}%</div>
                <div className="stat-label">Team Productivity</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{teamStats.codeReviews}</div>
                <div className="stat-label">Code Reviews</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('members')}
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4" />
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
          >
            <Shield className="w-4 h-4" />
            Permissions
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'members' && (
            <div className="members-section">
              <div className="members-controls">
                <div className="search-filter-bar">
                  <div className="search-box">
                    <Search className="w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>
              </div>
              
              <div className="members-grid">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-header">
                      <div className="member-avatar-container">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="member-avatar"
                        />
                        <div className={`status-indicator ${getStatusColor(member.status)}`}></div>
                      </div>
                      
                      <div className="member-info">
                        <h3 className="member-name">{member.name}</h3>
                        <p className="member-email">{member.email}</p>
                        <div className="member-role">
                          {getRoleIcon(member.role)}
                          <span className="role-text">{member.role}</span>
                        </div>
                      </div>
                      
                      <div className="member-actions">
                        <button className="action-btn">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="member-stats">
                      <div className="stat">
                        <div className="stat-value">{member.projects}</div>
                        <div className="stat-label">Projects</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value">{member.contributions}</div>
                        <div className="stat-label">Contributions</div>
                      </div>
                    </div>
                    
                    <div className="member-skills">
                      {member.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    
                    <div className="member-meta">
                      <div className="meta-item">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <Clock className="w-4 h-4" />
                        <span>Active {member.lastActive}</span>
                      </div>
                    </div>
                    
                    <div className="member-card-actions">
                      <button className="btn btn-ghost btn-sm">
                        <Mail className="w-4 h-4" />
                        Message
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-section">
              <div className="activity-header">
                <h3 className="section-title">Recent Team Activity</h3>
                <button className="btn btn-secondary btn-sm">
                  View All Activity
                </button>
              </div>
              
              <div className="activity-timeline">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-time">
                      <span className="time-text">{activity.time}</span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.user}</strong> {activity.action}
                      </div>
                      <div className="activity-target">{activity.target}</div>
                    </div>
                    <div className="activity-type">
                      {activity.type === 'review' && <Star className="w-4 h-4 text-yellow-500" />}
                      {activity.type === 'deployment' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {activity.type === 'git' && <Activity className="w-4 h-4 text-blue-500" />}
                      {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-purple-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="permissions-section">
              <div className="permissions-header">
                <h3 className="section-title">Role Permissions</h3>
                <button className="btn btn-secondary btn-sm">
                  <Settings className="w-4 h-4" />
                  Configure Roles
                </button>
              </div>
              
              <div className="permissions-grid">
                <div className="permission-card">
                  <div className="permission-header">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div className="permission-info">
                      <h4 className="permission-title">Owner</h4>
                      <p className="permission-description">Full access to all features</p>
                    </div>
                  </div>
                  <div className="permission-list">
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Manage team members</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Access billing settings</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Configure integrations</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Deploy to production</span>
                    </div>
                  </div>
                </div>
                
                <div className="permission-card">
                  <div className="permission-header">
                    <Shield className="w-6 h-6 text-blue-500" />
                    <div className="permission-info">
                      <h4 className="permission-title">Admin</h4>
                      <p className="permission-description">Administrative privileges</p>
                    </div>
                  </div>
                  <div className="permission-list">
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Invite team members</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Manage projects</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Deploy to staging</span>
                    </div>
                    <div className="permission-item">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span>Limited billing access</span>
                    </div>
                  </div>
                </div>
                
                <div className="permission-card">
                  <div className="permission-header">
                    <Users className="w-6 h-6 text-green-500" />
                    <div className="permission-info">
                      <h4 className="permission-title">Developer</h4>
                      <p className="permission-description">Development and collaboration</p>
                    </div>
                  </div>
                  <div className="permission-list">
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Create and edit code</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Submit pull requests</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Run tests</span>
                    </div>
                    <div className="permission-item">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>No production deployment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;