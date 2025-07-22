import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Search, Book, Code, Rocket, Users, Settings, 
  ChevronRight, ChevronDown, ExternalLink, Copy, 
  Play, Star, GitBranch, Terminal, Sparkles, Brain,
  Shield, Globe, Gauge, Award
} from 'lucide-react';

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({});
  const [copiedCode, setCopiedCode] = useState('');

  const navigation = [
    {
      title: 'Getting Started',
      icon: <Rocket className="w-5 h-5" />,
      items: [
        { title: 'Quick Start', href: '#quick-start', popular: true },
        { title: 'Installation', href: '#installation' },
        { title: 'First Project', href: '#first-project' },
        { title: 'Account Setup', href: '#account-setup' }
      ]
    },
    {
      title: 'Cosmic Features',
      icon: <Sparkles className="w-5 h-5" />,
      items: [
        { title: 'VIBE Token System', href: '#vibe-tokens', popular: true },
        { title: 'Parallel Universe Debugging', href: '#parallel-debugging' },
        { title: 'Avatar Pantheon', href: '#avatar-pantheon' },
        { title: 'Sacred Geometry UI', href: '#sacred-geometry' },
        { title: 'Quantum Vibe Shifting', href: '#quantum-shifting' }
      ]
    },
    {
      title: 'AI Integration',
      icon: <Brain className="w-5 h-5" />,
      items: [
        { title: 'AI Pair Programming', href: '#ai-pair' },
        { title: 'Code Evolution', href: '#code-evolution' },
        { title: 'Voice Commands', href: '#voice-commands' },
        { title: 'Smart Debugging', href: '#smart-debugging' }
      ]
    },
    {
      title: 'Collaboration',
      icon: <Users className="w-5 h-5" />,
      items: [
        { title: 'Real-time Editing', href: '#real-time' },
        { title: 'Team Management', href: '#team-management' },
        { title: 'Project Sharing', href: '#project-sharing' },
        { title: 'Code Reviews', href: '#code-reviews' }
      ]
    },
    {
      title: 'API Reference',
      icon: <Code className="w-5 h-5" />,
      items: [
        { title: 'REST API', href: '#rest-api' },
        { title: 'WebSocket API', href: '#websocket-api' },
        { title: 'Webhooks', href: '#webhooks' },
        { title: 'SDK Libraries', href: '#sdk-libraries' }
      ]
    },
    {
      title: 'Enterprise',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { title: 'Security & Compliance', href: '#security' },
        { title: 'SSO Integration', href: '#sso' },
        { title: 'Custom Deployment', href: '#custom-deployment' },
        { title: 'White Labeling', href: '#white-labeling' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'API Keys Setup', href: '#api-keys', icon: <Settings className="w-4 h-4" /> },
    { title: 'Troubleshooting', href: '#troubleshooting', icon: <Terminal className="w-4 h-4" /> },
    { title: 'Code Examples', href: '#examples', icon: <Code className="w-4 h-4" /> },
    { title: 'Video Tutorials', href: '#tutorials', icon: <Play className="w-4 h-4" /> }
  ];

  const codeExamples = {
    javascript: `// Initialize AETHERFLOW SDK
import { AetherFlow } from '@aetherflow/sdk';

const aether = new AetherFlow({
  apiKey: 'your-cosmic-api-key',
  universe: 'primary', // or 'parallel-1', 'parallel-2', etc.
  vibeFrequency: 432 // Hz for optimal cosmic resonance
});

// Create a new project with AI assistance
const project = await aether.projects.create({
  name: 'Cosmic Chat App',
  template: 'react-quantum',
  aiAssistance: true,
  sacredGeometry: true
});

// Activate AI pair programming
const ai = await aether.ai.activate('ada-lovelace');
const suggestion = await ai.suggest('optimize this function');

console.log('Project created in universe:', project.universe);`,
    
    python: `# AETHERFLOW Python SDK
from aetherflow import CosmicIDE
import asyncio

# Initialize the cosmic development environment
ide = CosmicIDE(
    api_key="your-cosmic-api-key",
    universe="primary",
    vibe_frequency=432
)

async def cosmic_development():
    # Create project with quantum capabilities
    project = await ide.create_project(
        name="Reality Engine API",
        language="python",
        cosmic_features=["quantum_debugging", "parallel_testing"]
    )
    
    # Mine VIBE tokens through coding
    tokens = await ide.mine_tokens(
        activity="code_optimization",
        complexity_level="cosmic"
    )
    
    print(f"Mined {tokens} VIBE tokens!")

# Run in cosmic event loop
asyncio.run(cosmic_development())`
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyCode = (code, lang) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

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

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-80 bg-slate-900/50 border-r border-slate-700 p-6 overflow-y-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/70 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-800/70 transition-colors"
                >
                  {link.icon}
                  <span>{link.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4">
            {filteredNavigation.map((section, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left font-semibold hover:bg-slate-800/70 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  {openSections[section.title] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {openSections[section.title] && (
                  <div className="mt-2 ml-7 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href={item.href}
                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <span>{item.title}</span>
                        {item.popular && (
                          <Star className="w-3 h-3 text-yellow-400" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AETHERFLOW Documentation
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Learn how to build reality-bending applications with our cosmic development platform.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn btn-primary">
                  Start Building
                </Link>
                <a href="#examples" className="btn btn-secondary">
                  View Examples
                </a>
                <a href="#api" className="btn btn-secondary">
                  API Reference
                </a>
              </div>
            </div>

            {/* Quick Start */}
            <section id="quick-start" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Rocket className="w-8 h-8 text-blue-400 mr-3" />
                Quick Start
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="quick-start-card">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create Account</h3>
                  <p className="text-gray-400 text-sm">Sign up and get 500 free VIBE tokens to start your cosmic journey.</p>
                </div>
                
                <div className="quick-start-card">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Install SDK</h3>
                  <p className="text-gray-400 text-sm">Install our SDK and connect to your first parallel universe.</p>
                </div>
                
                <div className="quick-start-card">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-green-400">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Build & Deploy</h3>
                  <p className="text-gray-400 text-sm">Create your first project with AI assistance and deploy instantly.</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-4">Installation</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">npm</span>
                      <button
                        onClick={() => copyCode('npm install @aetherflow/sdk', 'npm')}
                        className="btn btn-ghost btn-sm"
                      >
                        {copiedCode === 'npm' ? <Award className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <code className="text-green-400">npm install @aetherflow/sdk</code>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">pip</span>
                      <button
                        onClick={() => copyCode('pip install aetherflow-sdk', 'pip')}
                        className="btn btn-ghost btn-sm"
                      >
                        {copiedCode === 'pip' ? <Award className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <code className="text-green-400">pip install aetherflow-sdk</code>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="examples" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Code className="w-8 h-8 text-purple-400 mr-3" />
                Code Examples
              </h2>
              
              <div className="space-y-6">
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <div key={lang} className="bg-slate-800/50 rounded-xl border border-slate-600 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-600 bg-slate-900/50">
                      <span className="text-sm font-medium capitalize">{lang}</span>
                      <button
                        onClick={() => copyCode(code, lang)}
                        className="btn btn-ghost btn-sm"
                      >
                        {copiedCode === lang ? (
                          <>
                            <Award className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto">
                      <code className="text-green-400">{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            {/* Features Overview */}
            <section id="features" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
                Cosmic Features
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="feature-doc-card">
                  <Brain className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">AI Pair Programming</h3>
                  <p className="text-gray-300 mb-4">
                    Work alongside legendary developer avatars like Ada Lovelace and Linus Torvalds. 
                    Get intelligent code suggestions and real-time assistance.
                  </p>
                  <a href="#ai-pair" className="text-blue-400 hover:text-blue-300 inline-flex items-center text-sm">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
                
                <div className="feature-doc-card">
                  <Globe className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Parallel Universe Debugging</h3>
                  <p className="text-gray-300 mb-4">
                    Debug your code across multiple parallel universes simultaneously. 
                    Find solutions that work in all realities.
                  </p>
                  <a href="#parallel-debugging" className="text-purple-400 hover:text-purple-300 inline-flex items-center text-sm">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
                
                <div className="feature-doc-card">
                  <Star className="w-8 h-8 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">VIBE Token Economy</h3>
                  <p className="text-gray-300 mb-4">
                    Earn cosmic currency through coding activities. Use tokens to unlock 
                    advanced features and reality modifications.
                  </p>
                  <a href="#vibe-tokens" className="text-yellow-400 hover:text-yellow-300 inline-flex items-center text-sm">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
                
                <div className="feature-doc-card">
                  <Gauge className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Sacred Geometry UI</h3>
                  <p className="text-gray-300 mb-4">
                    Interface designed with golden ratio proportions and Fibonacci sequences 
                    to optimize your development flow state.
                  </p>
                  <a href="#sacred-geometry" className="text-green-400 hover:text-green-300 inline-flex items-center text-sm">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </section>

            {/* Help & Support */}
            <section className="mb-12 bg-slate-800/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="text-gray-300 mb-6">
                Our cosmic support team is here to help you navigate the multiverse of development possibilities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="btn btn-primary">
                  Contact Support
                </Link>
                <a href="#" className="btn btn-secondary">
                  Community Forum
                </a>
                <a href="#" className="btn btn-secondary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Video Tutorials
                </a>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-bold">AETHERFLOW Documentation</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Last updated: January 2025</span>
                  <a href="#" className="hover:text-white">Edit on GitHub</a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;