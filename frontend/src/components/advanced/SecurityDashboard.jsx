import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const SecurityDashboard = () => {
  const [securityData, setSecurityData] = useState({
    threatLevel: 'low',
    activeThreats: 0,
    blockedAttempts: 156,
    successfulAuthentications: 2341,
    complianceScore: 98.5,
    auditLogs: [],
    securityEvents: [],
    zeroTrustStatus: {}
  })
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadSecurityData()
    // Set up real-time monitoring
    const interval = setInterval(loadSecurityData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadSecurityData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSecurityData({
        threatLevel: 'low',
        activeThreats: 0,
        blockedAttempts: 156,
        successfulAuthentications: 2341,
        complianceScore: 98.5,
        auditLogs: [
          { id: 1, user: 'john.doe@company.com', action: 'Login successful', ip: '192.168.1.100', timestamp: '2025-01-24 14:32:15', severity: 'info' },
          { id: 2, user: 'jane.smith@company.com', action: 'API key generated', ip: '10.0.0.50', timestamp: '2025-01-24 14:28:43', severity: 'info' },
          { id: 3, user: 'unknown', action: 'Failed login attempt', ip: '203.45.67.89', timestamp: '2025-01-24 14:15:22', severity: 'warning' },
          { id: 4, user: 'admin@company.com', action: 'Security settings updated', ip: '192.168.1.10', timestamp: '2025-01-24 13:45:18', severity: 'info' },
          { id: 5, user: 'bot.scanner@malicious.com', action: 'Blocked brute force attack', ip: '45.123.89.45', timestamp: '2025-01-24 13:22:07', severity: 'high' }
        ],
        securityEvents: [
          { type: 'authentication', count: 2341, trend: 'up', change: 12.5 },
          { type: 'blocked_attempts', count: 156, trend: 'down', change: -8.3 },
          { type: 'api_calls', count: 15678, trend: 'up', change: 23.1 },
          { type: 'failed_requests', count: 23, trend: 'down', change: -15.7 }
        ],
        zeroTrustStatus: {
          identityVerification: { status: 'active', score: 98 },
          deviceTrust: { status: 'active', score: 95 },
          networkSecurity: { status: 'active', score: 97 },
          dataProtection: { status: 'active', score: 99 },
          riskAssessment: { status: 'active', score: 96 }
        }
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to load security data:', error)
      setLoading(false)
    }
  }

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-red-800 bg-red-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Threat Level</p>
              <p className={`text-lg font-bold px-3 py-1 rounded-full ${getThreatLevelColor(securityData.threatLevel)}`}>
                {securityData.threatLevel.toUpperCase()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked Attempts</p>
              <p className="text-3xl font-bold text-red-600">{securityData.blockedAttempts}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">-8.3% from yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful Auth</p>
              <p className="text-3xl font-bold text-green-600">{securityData.successfulAuthentications}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+12.5% from yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Score</p>
              <p className="text-3xl font-bold text-blue-600">{securityData.complianceScore}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <LockClosedIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600">GDPR & SOC2 Compliant</span>
          </div>
        </motion.div>
      </div>

      {/* Zero Trust Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zero Trust Security Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(securityData.zeroTrustStatus).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                value.score >= 95 ? 'bg-green-100' : value.score >= 90 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-xl font-bold ${
                  value.score >= 95 ? 'text-green-600' : value.score >= 90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {value.score}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                value.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {value.status}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Security Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Events Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {securityData.securityEvents.map((event, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {event.type.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {event.trend === 'up' ? '↑' : '↓'} {Math.abs(event.change)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{event.count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderAuditLogs = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live monitoring</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {securityData.auditLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-600">{log.timestamp}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.user}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.action}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(log.severity)}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.severity === 'high' ? 'bg-red-100 text-red-800' :
                        log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Framework Status</h3>
        <div className="space-y-4">
          {[
            { framework: 'GDPR', status: 'compliant', score: 98, requirements: 42, met: 41 },
            { framework: 'SOC 2 Type II', status: 'compliant', score: 96, requirements: 64, met: 61 },
            { framework: 'HIPAA', status: 'in_progress', score: 87, requirements: 38, met: 33 },
            { framework: 'PCI DSS', status: 'compliant', score: 94, requirements: 52, met: 49 }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  item.status === 'compliant' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {item.status === 'compliant' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.framework}</div>
                  <div className="text-sm text-gray-600">
                    {item.met}/{item.requirements} requirements met
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.score}%</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status === 'compliant' ? 'Compliant' : 'In Progress'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Classification & Protection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2.3TB</div>
            <div className="text-sm text-gray-600">Data Under Management</div>
            <div className="text-xs text-blue-600 mt-1">100% Classified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">256-bit</div>
            <div className="text-sm text-gray-600">Encryption Standard</div>
            <div className="text-xs text-purple-600 mt-1">AES Encryption</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Data Breaches</div>
            <div className="text-xs text-green-600 mt-1">All Time</div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
    { id: 'audit', name: 'Audit Logs', icon: EyeIcon },
    { id: 'compliance', name: 'Compliance', icon: LockClosedIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Zero-trust security monitoring and compliance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">All systems secure</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'audit' && renderAuditLogs()}
          {selectedTab === 'compliance' && renderCompliance()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SecurityDashboard