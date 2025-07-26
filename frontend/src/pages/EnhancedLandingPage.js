import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Play, ArrowRight, CheckCircle, Star, Users, 
  Code2, Rocket, Shield, Infinity, Sparkles, Eye,
  ChevronDown, Quote, Github, Linkedin, Twitter,
  Globe, Database, Cpu, Layers, TrendingUp, Award
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import LiveCodeDemo from '../components/LiveCodeDemo';
import ClientLogos from '../components/ClientLogos';
import ThemeToggle from '../components/ThemeToggle';

const EnhancedLandingPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 127,
    accuracy: 99.8,
    uptime: 99.99,
    satisfaction: 4.9
  });

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        responseTime: Math.floor(Math.random() * 50) + 100,
        accuracy: (99.5 + Math.random() * 0.5).toFixed(1),
        uptime: (99.95 + Math.random() * 0.05).toFixed(2),
        satisfaction: (4.8 + Math.random() * 0.2).toFixed(1)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleActionWithLoading = async (action, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (action === 'signup') {
        navigate('/signup');
      } else if (action === 'signin') {
        navigate('/signin');
      } else if (action === 'demo') {
        navigate('/signin');
      } else if (action === 'pricing') {
        navigate('/pricing');
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Development",
      description: "Experience next-generation coding with advanced AI assistance, quantum debugging, and intelligent code generation",
      image: "https://images.unsplash.com/photo-1555209183-8facf96a4349?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxjb2RpbmclMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzUzMTkwMTMxfDA&ixlib=rb-4.1.0&q=85",
      details: [
        "Advanced AI code completion with 99.8% accuracy",
        "Quantum debugging across parallel execution paths",
        "Intelligent refactoring with learning algorithms",
        "Voice-to-code natural language programming"
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration", 
      description: "Seamless team collaboration with live editing, integrated communication, and project management tools",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHx0ZWFtJTIwd29ya3xlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      details: [
        "Real-time multi-cursor editing",
        "Integrated video chat and screen sharing",
        "Advanced conflict resolution",
        "Team analytics and productivity insights"
      ]
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Enterprise Deployment",
      description: "Scale from prototype to production with enterprise-grade infrastructure and security",
      image: "https://images.unsplash.com/photo-1633988354540-d3f4e97c67b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxkZXZlbG9wZXIlMjBzZXR1cHxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      details: [
        "One-click deployment to 15+ cloud providers",
        "Auto-scaling with intelligent load balancing",
        "SOC 2 Type II compliance",
        "Enterprise SSO and access controls"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Engineering Manager",
      company: "Microsoft",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b1e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbnxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      rating: 5,
      text: "AETHERFLOW transformed our development velocity. We shipped 3 major features in the time it used to take for 1. The AI assistance is genuinely revolutionary."
    },
    {
      name: "Marcus Rodriguez",
      role: "Principal Architect",  
      company: "Google",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBtYW58ZW58MHx8fHwxNzUzMTkwMTQyfDA&ixlib=rb-4.1.0&q=85",
      rating: 5,
      text: "The collaboration features are unmatched. Our distributed team feels more connected than when we were in the same office. Code quality improved by 40%."
    },
    {
      name: "Dr. Elena Vasquez",
      role: "VP Engineering",
      company: "Meta",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjB3b21hbnxlbnwwfHx8fDE3NTMxOTAxNDJ8MA&ixlib=rb-4.1.0&q=85",
      rating: 5,
      text: "ROI was immediate. We reduced bug reports by 60% and increased deployment frequency by 10x. AETHERFLOW pays for itself within weeks."
    }
  ];

  const comparisonFeatures = [
    { feature: "AI Code Generation", us: true, vsCode: false, webstorm: false, github: true },
    { feature: "Real-time Collaboration", us: true, vsCode: true, webstorm: false, github: true },
    { feature: "Quantum Debugging", us: true, vsCode: false, webstorm: false, github: false },
    { feature: "Natural Language Coding", us: true, vsCode: false, webstorm: false, github: true },
    { feature: "Enterprise Security", us: true, vsCode: true, webstorm: true, github: true },
    { feature: "Multi-Cloud Deployment", us: true, vsCode: false, webstorm: false, github: false },
    { feature: "Advanced Analytics", us: true, vsCode: false, webstorm: true, github: false },
    { feature: "Voice Commands", us: true, vsCode: false, webstorm: false, github: false }
  ];

  return (
    <div className="landing-page">
      <ProfessionalHeader />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Build the Future with
                <span className="title-highlight"> AI-Powered Development</span>
              </h1>
              <p className="hero-subtitle">
                Experience professional-grade coding with advanced AI assistance, 
                real-time collaboration, and enterprise deployment. Join 500K+ developers 
                building tomorrow's applications today.
              </p>
              
              <div className="hero-actions">
                <button 
                  onClick={() => handleActionWithLoading('demo', 'demo')}
                  className="btn btn-primary btn-lg"
                  disabled={loading.demo}
                >
                  {loading.demo ? (
                    <div className="loading-spinner" />
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Free Trial
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="btn btn-secondary btn-lg"
                >
                  <Eye className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="hero-stats">
                <div className="stat">
                  <Zap className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="stat">
                  <Star className="w-4 h-4" />
                  <span>500 free VIBE tokens</span>
                </div>
                <div className="stat">
                  <Users className="w-4 h-4" />
                  <span>Join 500K+ developers</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="hero-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1555209183-8facf96a4349?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxjb2RpbmclMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzUzMTkwMTMxfDA&ixlib=rb-4.1.0&q=85"
                  alt="AETHERFLOW IDE Interface"
                  className="hero-image"
                />
                <div className="image-overlay">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>AI is coding...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Performance Metrics */}
      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="metric-content">
                <div className="metric-value">{performanceMetrics.responseTime}ms</div>
                <div className="metric-label">Avg Response Time</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Award className="w-6 h-6" />
              </div>
              <div className="metric-content">
                <div className="metric-value">{performanceMetrics.accuracy}%</div>
                <div className="metric-label">AI Accuracy</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Shield className="w-6 h-6" />
              </div>
              <div className="metric-content">
                <div className="metric-value">{performanceMetrics.uptime}%</div>
                <div className="metric-label">Uptime SLA</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Star className="w-6 h-6" />
              </div>
              <div className="metric-content">
                <div className="metric-value">{performanceMetrics.satisfaction}/5</div>
                <div className="metric-label">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Code Demo */}
      <section className="demo-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">See AI Development in Action</h2>
            <p className="section-subtitle">
              Watch how AETHERFLOW transforms natural language into production-ready code
            </p>
          </div>
          <LiveCodeDemo />
        </div>
      </section>

      {/* Client Logos */}
      <ClientLogos />

      {/* Feature Comparison */}
      <section className="comparison-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose AETHERFLOW?</h2>
            <p className="section-subtitle">
              See how we compare to other professional development platforms
            </p>
          </div>
          
          <div className="comparison-table">
            <div className="table-header">
              <div className="feature-column">Features</div>
              <div className="product-column">
                <div className="product-name">AETHERFLOW</div>
              </div>
              <div className="product-column">
                <div className="product-name">VS Code</div>
              </div>
              <div className="product-column">
                <div className="product-name">WebStorm</div>
              </div>
              <div className="product-column">
                <div className="product-name">GitHub Spark</div>
              </div>
            </div>
            
            {comparisonFeatures.map((row, index) => (
              <div key={index} className="table-row">
                <div className="feature-name">{row.feature}</div>
                <div className="feature-check">
                  {row.us ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span className="text-gray-400">—</span>}
                </div>
                <div className="feature-check">
                  {row.vsCode ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span className="text-gray-400">—</span>}
                </div>
                <div className="feature-check">
                  {row.webstorm ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span className="text-gray-400">—</span>}
                </div>
                <div className="feature-check">
                  {row.github ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span className="text-gray-400">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <p className="section-subtitle">
              See what top engineering teams say about AETHERFLOW
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="stars">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="quote-icon w-8 h-8" />
                  <p className="testimonial-text">{testimonial.text}</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="author-image"
                  />
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                    <div className="author-company">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Development?</h2>
            <p className="cta-subtitle">
              Join thousands of developers already building the future with AETHERFLOW
            </p>
            <div className="cta-actions">
              <button 
                onClick={() => handleActionWithLoading('signup', 'signup')}
                className="btn btn-primary btn-xl"
                disabled={loading.signup}
              >
                {loading.signup ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <Link to="/pricing" className="btn btn-secondary btn-xl">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="video-modal" onClick={() => setIsVideoPlaying(false)}>
          <div className="video-container" onClick={e => e.stopPropagation()}>
            <button 
              className="video-close"
              onClick={() => setIsVideoPlaying(false)}
            >
              ×
            </button>
            <div className="video-placeholder">
              <div className="video-content">
                <Play className="w-16 h-16 mb-4" />
                <h3>AETHERFLOW Demo Video</h3>
                <p>See how AI-powered development transforms your workflow</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLandingPage;