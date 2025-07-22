import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Play, ArrowRight, CheckCircle, Star, Users, 
  Code2, Rocket, Shield, Infinity, Sparkles, Eye,
  ChevronDown, Quote, Github, Linkedin, Twitter,
  Globe, Database, Cpu, Layers
} from 'lucide-react';
import MicroInteractions from '../components/MicroInteractions';
import EnhancedLoadingComponents from '../components/EnhancedLoadingComponents';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleActionWithLoading = async (action, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (action === 'signup') {
        navigate('/signup');
      } else if (action === 'signin') {
        navigate('/signin');
      } else if (action === 'demo') {
        navigate('/signin'); // Will use demo credentials
      } else if (action === 'pricing') {
        navigate('/pricing');
      }
      await new Promise(resolve => setTimeout(resolve, 300)); // Micro-interaction delay
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Cosmic-Level Differentiators",
      description: "Experience the future of development with AI assistance, quantum debugging, and reality-shifting capabilities",
      image: "https://images.unsplash.com/photo-1555209183-8facf96a4349?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxjb2RpbmclMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzUzMTkwMTMxfDA&ixlib=rb-4.1.0&q=85",
      details: [
        "Neuro-Sync Engine with Brain-Computer Interface",
        "Quantum Vibe Shifting across parallel universes", 
        "Self-Aware Code Ecosystems with genetic algorithms",
        "Voice-driven Techno-Shaman mode"
      ]
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Advanced IDE Features",
      description: "Professional coding environment with AI pair programming and collaborative tools",
      image: "https://images.unsplash.com/photo-1693773852578-65cf594b62dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBzZXR1cHxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      details: [
        "Intelligent code completion with cosmic insights",
        "Real-time collaboration with quantum entanglement",
        "Integrated terminal with dimensional commands",
        "Sacred geometry-based UI layouts"
      ]
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Deployment & Scaling",
      description: "Deploy to multiple realities simultaneously with cosmic infrastructure",
      image: "https://images.unsplash.com/photo-1633988354540-d3f4e97c67b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxkZXZlbG9wZXIlMjBzZXR1cHxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      details: [
        "One-click deployment to parallel universes",
        "Auto-scaling based on cosmic energy levels", 
        "Reality-aware load balancing",
        "Quantum-encrypted data transmission"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Full-Stack Developer",
      company: "Cosmic Innovations Inc.",
      image: "/api/placeholder/64/64",
      rating: 5,
      text: "AETHERFLOW has revolutionized my development workflow. The quantum debugging feature saved me 40+ hours last week alone. It's like having a time machine for code!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Tech Lead",  
      company: "Reality Systems Ltd.",
      image: "/api/placeholder/64/64",
      rating: 5,
      text: "The AI pair programming is incredible. It's like collaborating with developers from parallel universes who know exactly what you're thinking."
    },
    {
      name: "Dr. Elena Vasquez",
      role: "CTO",
      company: "Dimensional Apps",
      image: "/api/placeholder/64/64", 
      rating: 5,
      text: "We've increased our team productivity by 300% since adopting AETHERFLOW. The sacred geometry layouts actually improve our code quality!"
    }
  ];

  const comparisonFeatures = [
    {
      feature: "Code Editor",
      aetherflow: "Quantum-Enhanced Monaco",
      vscode: "Standard Monaco",
      webstorm: "IntelliJ-based",
      others: "Basic Editor"
    },
    {
      feature: "AI Assistance", 
      aetherflow: "Cosmic Intelligence + Avatar Pantheon",
      vscode: "GitHub Copilot",
      webstorm: "AI Assistant",
      others: "Limited/None"
    },
    {
      feature: "Collaboration",
      aetherflow: "Quantum Entangled Real-time",
      vscode: "Live Share",
      webstorm: "Code With Me",
      others: "Basic/None"
    },
    {
      feature: "Debugging",
      aetherflow: "Time Travel + Multi-dimensional",
      vscode: "Standard Debugger",
      webstorm: "Advanced Debugger", 
      others: "Basic Debugger"
    },
    {
      feature: "Extensions",
      aetherflow: "Reality-Aware Marketplace",
      vscode: "VS Code Marketplace",
      webstorm: "JetBrains Plugins",
      others: "Limited Ecosystem"
    },
    {
      feature: "Deployment",
      aetherflow: "Multi-Universe Deployment", 
      vscode: "Extensions Required",
      webstorm: "Built-in Tools",
      others: "Manual/Limited"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/docs" className="text-gray-300 hover:text-white transition-colors">Docs</Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              <Link to="/signin" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <button
                onClick={() => handleActionWithLoading('signup', 'cta')}
                disabled={loading.cta}
                className="btn btn-primary"
              >
                {loading.cta ? <EnhancedLoadingComponents.Spinner size="sm" /> : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Code Across
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Multiple Realities
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Experience the future of development with AETHERFLOW's cosmic-level IDE. 
              Build applications with AI assistance, quantum debugging, and reality-shifting capabilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => handleActionWithLoading('signup', 'hero-signup')}
                disabled={loading['hero-signup']}
                className="btn btn-primary text-lg px-8 py-4 group"
              >
                {loading['hero-signup'] ? (
                  <EnhancedLoadingComponents.Spinner />
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="btn btn-secondary text-lg px-8 py-4 group"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-400 space-x-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>No credit card required • 500 free VIBE tokens • Access to 1 parallel universe</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1623281185000-6940e5347d2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxkZXZlbG9wZXIlMjBzZXR1cHxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85"
              alt="AETHERFLOW IDE Interface"
              className="w-full rounded-2xl shadow-2xl border border-slate-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cosmic Development Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transcend traditional coding with our revolutionary features designed for the next generation of developers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-xl border transition-all duration-500 cursor-pointer ${
                    activeFeature === index 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50' 
                      : 'glass-surface border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      activeFeature === index ? 'bg-purple-500/20' : 'bg-slate-800'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <img 
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                className="w-full rounded-2xl shadow-2xl transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How AETHERFLOW Compares
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See why developers are choosing AETHERFLOW over traditional IDEs and coding platforms.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full glass-surface rounded-2xl overflow-hidden border border-slate-600">
              <thead className="bg-gradient-to-r from-purple-600/30 to-blue-600/30">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-bold">Feature</th>
                  <th className="px-6 py-4 text-center text-white font-bold">
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <span>AETHERFLOW</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-gray-400">VS Code</th>
                  <th className="px-6 py-4 text-center text-gray-400">WebStorm</th>
                  <th className="px-6 py-4 text-center text-gray-400">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="border-t border-slate-600 hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-medium text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-purple-400 font-bold">{row.aetherflow}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.vscode}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.webstorm}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Developer Success Stories
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of developers who have transcended traditional coding with AETHERFLOW.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-surface p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-purple-400 mb-4" />
                
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 bg-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-purple-400">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transcend Traditional Coding?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the cosmic revolution and experience development like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleActionWithLoading('signup', 'bottom-cta')}
              disabled={loading['bottom-cta']}
              className="btn btn-primary text-lg px-8 py-4 group"
            >
              {loading['bottom-cta'] ? (
                <EnhancedLoadingComponents.Spinner />
              ) : (
                <>
                  Start Your Cosmic Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <button
              onClick={() => handleActionWithLoading('demo', 'demo-cta')}
              disabled={loading['demo-cta']}
              className="btn btn-secondary text-lg px-8 py-4"
            >
              {loading['demo-cta'] ? (
                <EnhancedLoadingComponents.Spinner />
              ) : (
                <>
                  <Eye className="mr-2 w-5 h-5" />
                  Try Demo
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-600 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold text-white">AETHERFLOW</span>
              </div>
              <p className="text-gray-400">
                Transcending traditional development with cosmic-level intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/api-status" className="hover:text-white transition-colors">API Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-600 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AETHERFLOW. All rights reserved. Made with cosmic energy.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">AETHERFLOW Demo</h3>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-purple-400 mb-4 mx-auto" />
                <p className="text-gray-400">Demo video will be available soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;