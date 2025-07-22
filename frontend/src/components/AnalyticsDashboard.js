import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Users, GitBranch,
  Clock, Code, Bug, Zap, Target, Award, Calendar,
  FileText, Database, ChevronDown, Download, Filter,
  ArrowUp, ArrowDown, Minus, Eye, Star
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AnalyticsDashboard = ({ onClose, professionalMode = true }) => {
  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [codeQualityData, setCodeQualityData] = useState(null);
  const [languageStats, setLanguageStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch overview data
      const overviewResponse = await fetch(`${BACKEND_URL}/api/analytics/overview`);
      const overviewData = await overviewResponse.json();
      setOverview(overviewData);
      
      // Fetch projects analytics
      const projectsResponse = await fetch(`${BACKEND_URL}/api/analytics/projects?limit=10`);
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);
      
      // Fetch additional data based on active tab
      if (activeTab === 'team') {
        const teamResponse = await fetch(`${BACKEND_URL}/api/analytics/team`);
        const teamDataResult = await teamResponse.json();
        setTeamData(teamDataResult);
      }
      
      if (activeTab === 'productivity') {
        const productivityResponse = await fetch(`${BACKEND_URL}/api/analytics/productivity/timeline?period=${selectedPeriod}`);
        const productivityDataResult = await productivityResponse.json();
        setProductivityData(productivityDataResult);
      }
      
      if (activeTab === 'quality') {
        const qualityResponse = await fetch(`${BACKEND_URL}/api/analytics/code-quality`);
        const qualityDataResult = await qualityResponse.json();
        setCodeQualityData(qualityDataResult);
      }
      
      if (activeTab === 'languages') {
        const languageResponse = await fetch(`${BACKEND_URL}/api/analytics/languages`);
        const languageDataResult = await languageResponse.json();
        setLanguageStats(languageDataResult);
      }
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'completed': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'on_hold': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      'archived': 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status] || colors.active;
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              change.startsWith('+') ? 'text-green-600' : 
              change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> :
               change.startsWith('-') ? <ArrowDown className="w-3 h-3 mr-1" /> :
               <Minus className="w-3 h-3 mr-1" />}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {project.project_name}
        </h3>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Lines of Code</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatNumber(project.code_metrics.lines_of_code)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Commits</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {project.productivity_metrics.commits_count}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Quality Score</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {project.code_metrics.maintainability_index.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-1">
          {project.languages.slice(0, 3).map(lang => (
            <span
              key={lang}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {lang}
            </span>
          ))}
          {project.languages.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{project.languages.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={overview?.total_projects}
          change="+15%"
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Active Projects"
          value={overview?.active_projects}
          change="+8%"
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Total Commits"
          value={overview?.total_commits}
          change="+23%"
          icon={GitBranch}
          color="purple"
        />
        <MetricCard
          title="Lines of Code"
          value={overview?.total_lines_of_code}
          change="+18%"
          icon={Code}
          color="orange"
        />
      </div>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Productivity Score"
          value={overview?.avg_productivity_score}
          change="+12%"
          icon={TrendingUp}
          color="indigo"
        />
        <MetricCard
          title="Team Velocity"
          value={`${overview?.team_velocity} f/d`}
          change="+5%"
          icon={Zap}
          color="yellow"
        />
        <MetricCard
          title="Code Quality"
          value={`${overview?.code_quality_score}%`}
          change="+7%"
          icon={Award}
          color="green"
        />
      </div>
      
      {/* Recent Achievements */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {overview?.recent_achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Projects */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Active Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map(project => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );

  const ProductivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Productivity Timeline</h3>
        {productivityData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(productivityData.summary.total_commits)}
                </div>
                <div className="text-sm text-gray-500">Total Commits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(productivityData.summary.total_lines)}
                </div>
                <div className="text-sm text-gray-500">Lines of Code</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(productivityData.summary.total_hours)}h
                </div>
                <div className="text-sm text-gray-500">Active Hours</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading productivity data...</div>
        )}
      </div>
    </div>
  );

  const QualityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Code Quality Overview</h3>
        {codeQualityData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {codeQualityData.aggregate_metrics?.average_test_coverage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Average Test Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {codeQualityData.aggregate_metrics?.average_maintainability.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Maintainability Index</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {codeQualityData.aggregate_metrics?.average_complexity.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Complexity Score</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading code quality data...</div>
        )}
      </div>
    </div>
  );

  const LanguagesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Language Usage Statistics</h3>
        {languageStats ? (
          <div className="space-y-4">
            {languageStats.languages.map((lang, index) => (
              <div key={lang.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {formatNumber(lang.lines_of_code)} lines
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lang.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">Loading language statistics...</div>
        )}
      </div>
    </div>
  );

  const TeamTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
        {teamData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{teamData.team_size}</div>
                <div className="text-sm text-gray-500">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(teamData.total_commits)}</div>
                <div className="text-sm text-gray-500">Total Commits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{teamData.avg_commits_per_member}</div>
                <div className="text-sm text-gray-500">Avg Commits/Member</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{teamData.collaboration_score}%</div>
                <div className="text-sm text-gray-500">Collaboration Score</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Team Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamData.members.map(member => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.commits_count} commits
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(member.lines_contributed)} lines
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading team data...</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-40 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="day">Last 7 Days</option>
                <option value="week">Last 4 Weeks</option>
                <option value="month">Last 12 Months</option>
                <option value="quarter">Last 4 Quarters</option>
              </select>
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
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'productivity', label: 'Productivity', icon: TrendingUp },
              { id: 'quality', label: 'Code Quality', icon: Award },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'languages', label: 'Languages', icon: Code }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'productivity' && <ProductivityTab />}
              {activeTab === 'quality' && <QualityTab />}
              {activeTab === 'team' && <TeamTab />}
              {activeTab === 'languages' && <LanguagesTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;