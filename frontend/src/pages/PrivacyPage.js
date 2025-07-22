import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Shield, Eye, Database, Lock, UserX, 
  Globe, Mail, Calendar, Settings, AlertTriangle,
  CheckCircle, FileText, Download
} from 'lucide-react';

const PrivacyPage = () => {
  const dataTypes = [
    {
      icon: <UserX className="w-5 h-5" />,
      title: "Personal Information",
      description: "Name, email, profile data you provide",
      retention: "Account lifetime + 90 days"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Project Data",
      description: "Your code, files, and development projects",
      retention: "Account lifetime + 90 days"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Usage Analytics",
      description: "How you interact with AETHERFLOW features",
      retention: "2 years maximum"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Technical Data",
      description: "IP address, browser, device information",
      retention: "1 year maximum"
    }
  ];

  const rights = [
    {
      icon: <Eye className="w-5 h-5 text-blue-400" />,
      title: "Access Your Data",
      description: "Request a complete copy of your personal data"
    },
    {
      icon: <Settings className="w-5 h-5 text-purple-400" />,
      title: "Correct Information",
      description: "Update or correct inaccurate personal information"
    },
    {
      icon: <UserX className="w-5 h-5 text-red-400" />,
      title: "Delete Your Account",
      description: "Request complete deletion of your account and data"
    },
    {
      icon: <Download className="w-5 h-5 text-green-400" />,
      title: "Data Portability",
      description: "Export your data in a machine-readable format"
    },
    {
      icon: <Lock className="w-5 h-5 text-yellow-400" />,
      title: "Restrict Processing",
      description: "Limit how we process your personal information"
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      title: "Object to Processing",
      description: "Object to certain types of data processing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AETHERFLOW
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/signin" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">Last updated: January 1, 2025</p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none">
          <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Commitment to Privacy</h2>
            <p className="text-gray-300">
              At AETHERFLOW, we believe your privacy is fundamental to your cosmic development journey. 
              This Privacy Policy explains how we collect, use, and protect your personal information 
              across all realities and dimensions where our service operates.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {dataTypes.map((dataType, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        {dataType.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{dataType.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{dataType.description}</p>
                        <p className="text-xs text-gray-400">Retained: {dataType.retention}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400">Primary Uses</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                      <li>Provide AETHERFLOW services and features</li>
                      <li>Enable AI-powered coding assistance</li>
                      <li>Facilitate real-time collaboration</li>
                      <li>Process VIBE token transactions</li>
                      <li>Sync data across parallel universes</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">Secondary Uses</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                      <li>Improve service performance and features</li>
                      <li>Provide customer support</li>
                      <li>Send important service notifications</li>
                      <li>Analyze usage patterns (anonymized)</li>
                      <li>Prevent fraud and abuse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    We NEVER sell your personal data
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Your personal information is never sold to third parties, advertisers, or data brokers.
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-3">Limited Sharing Scenarios</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Service Providers</h4>
                    <p className="text-gray-300 text-sm">
                      We share minimal data with trusted service providers (hosting, analytics, support tools) 
                      under strict contractual obligations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Legal Requirements</h4>
                    <p className="text-gray-300 text-sm">
                      We may disclose information when required by law, court order, or to protect our rights 
                      and user safety across all realities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Business Transfers</h4>
                    <p className="text-gray-300 text-sm">
                      In the event of a merger or acquisition, user data may be transferred under equivalent 
                      privacy protections.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Lock className="w-5 h-5 text-blue-400 mr-2" />
                      Technical Safeguards
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                      <li>End-to-end encryption for all data</li>
                      <li>Quantum-resistant encryption protocols</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>SOC 2 Type II compliance</li>
                      <li>Multi-dimensional access controls</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Shield className="w-5 h-5 text-green-400 mr-2" />
                      Operational Security
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                      <li>Employee background checks and training</li>
                      <li>Principle of least privilege access</li>
                      <li>Incident response and breach protocols</li>
                      <li>Regular data backups across universes</li>
                      <li>24/7 security monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {rights.map((right, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl border border-slate-600 p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        {right.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{right.title}</h3>
                        <p className="text-gray-300 text-sm">{right.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Exercise Your Rights:</strong> Contact us at privacy@aetherflow.dev or use your 
                  account settings to manage your privacy preferences. We'll respond within 30 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Cookie Usage</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">Essential Cookies</h4>
                    <p className="text-gray-300 text-sm">
                      Required for basic functionality like authentication, session management, 
                      and security across all parallel universes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-blue-400">Analytics Cookies</h4>
                    <p className="text-gray-300 text-sm">
                      Help us understand how you use AETHERFLOW to improve performance and features. 
                      You can opt-out in your account settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-purple-400">Preference Cookies</h4>
                    <p className="text-gray-300 text-sm">
                      Remember your settings like theme, language, and cosmic interface preferences.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">International Transfers</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  AETHERFLOW operates globally across multiple realities and dimensions. Your data may be 
                  processed in countries other than your own, including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Primary Locations</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>United States (primary servers)</li>
                      <li>European Union (GDPR compliance)</li>
                      <li>Parallel Universe Alpha-7 (backup servers)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Protection Measures</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>Standard Contractual Clauses</li>
                      <li>Adequacy decisions recognition</li>
                      <li>Cross-dimensional privacy shields</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  All international transfers maintain the same level of protection as outlined in this policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  AETHERFLOW is not directed at children under 13 years of age across any reality or dimension. 
                  We do not knowingly collect personal information from children under 13.
                </p>
                <p className="text-gray-300 text-sm">
                  If we discover that a child under 13 has provided us with personal information, 
                  we will immediately delete such information from our systems. Parents or guardians 
                  who believe their child has provided us with personal information should contact us 
                  at privacy@aetherflow.dev.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Account Data</h4>
                    <p className="text-gray-300 text-sm">
                      Personal information and project data are retained for the lifetime of your account 
                      plus 90 days to allow for account recovery.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Analytics Data</h4>
                    <p className="text-gray-300 text-sm">
                      Usage analytics are retained for up to 2 years in anonymized form to improve 
                      our services across all realities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Legal Holds</h4>
                    <p className="text-gray-300 text-sm">
                      Data may be retained longer when required by law, regulation, or ongoing legal proceedings.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, or legal requirements. Material changes will be communicated through:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm mb-6">
                  <li>Email notification to all registered users</li>
                  <li>Prominent notice in the AETHERFLOW interface</li>
                  <li>Updates across all parallel universe instances</li>
                  <li>30-day advance notice for significant changes</li>
                </ul>
                <p className="text-gray-300 text-sm">
                  Continued use of AETHERFLOW after policy updates constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Mail className="w-6 h-6 text-green-400 mr-2" />
                Contact Our Privacy Team
              </h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">General Privacy Questions</h4>
                    <div className="space-y-2 text-gray-300 text-sm">
                      <p><strong>Email:</strong> privacy@aetherflow.dev</p>
                      <p><strong>Response Time:</strong> Within 48 hours</p>
                      <p><strong>Available:</strong> 24/7 across all realities</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Data Protection Officer</h4>
                    <div className="space-y-2 text-gray-300 text-sm">
                      <p><strong>Email:</strong> dpo@aetherflow.dev</p>
                      <p><strong>Address:</strong> AETHERFLOW Privacy Team<br />Silicon Valley, CA</p>
                      <p><strong>EU Representative:</strong> Available upon request</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
            <h3 className="text-xl font-semibold mb-3">Privacy Resources</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn btn-secondary btn-sm">
                Contact Privacy Team
              </Link>
              <button className="btn btn-secondary btn-sm">
                <Download className="w-4 h-4 mr-2" />
                Download Your Data
              </button>
              <button className="btn btn-secondary btn-sm">
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;