import React, { useState } from 'react';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  Shield, Users, Settings, Lock, Award, 
  TrendingUp, Globe, Zap, Clock, CheckCircle,
  Building, Phone, Mail, Calendar, ArrowRight
} from 'lucide-react';

const EnterprisePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const enterpriseFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliance, SSO integration, and advanced security controls',
      features: [
        'Single Sign-On (SSO) with SAML/OIDC',
        'Advanced audit logs and compliance reporting',
        'Data encryption at rest and in transit',
        'IP allowlisting and access controls',
        'GDPR and SOC 2 Type II compliance'
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Management',
      description: 'Advanced user management, role-based permissions, and organizational controls',
      features: [
        'Unlimited team members',
        'Custom role definitions',
        'Department-based access control',
        'Bulk user provisioning',
        'Advanced analytics and reporting'
      ]
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Custom Integrations',
      description: 'Enterprise API access, custom workflows, and dedicated support',
      features: [
        'Custom API endpoints and webhooks',
        'Priority integration development',
        'Dedicated infrastructure resources',
        'Custom SLA agreements',
        '24/7 enterprise support'
      ]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Deployment',
      description: 'Multi-region deployment, data residency, and high availability',
      features: [
        'Multi-region data centers',
        'Data residency compliance',
        '99.99% uptime SLA',
        'Disaster recovery planning',
        'Global CDN integration'
      ]
    }
  ];

  const complianceStandards = [
    { name: 'SOC 2 Type II', status: 'certified', icon: <Award className="w-6 h-6" /> },
    { name: 'GDPR', status: 'compliant', icon: <Shield className="w-6 h-6" /> },
    { name: 'HIPAA', status: 'ready', icon: <Lock className="w-6 h-6" /> },
    { name: 'ISO 27001', status: 'certified', icon: <Award className="w-6 h-6" /> },
    { name: 'PCI DSS', status: 'compliant', icon: <Shield className="w-6 h-6" /> }
  ];

  const enterpriseStats = [
    { label: 'Enterprise Customers', value: '500+', icon: <Building className="w-6 h-6" /> },
    { label: 'Fortune 500 Companies', value: '50+', icon: <TrendingUp className="w-6 h-6" /> },
    { label: 'Uptime SLA', value: '99.99%', icon: <Clock className="w-6 h-6" /> },
    { label: 'Global Regions', value: '15+', icon: <Globe className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      company: 'TechCorp International',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
      quote: 'AETHERFLOW Enterprise transformed our development workflow. We achieved 40% faster deployment cycles with their advanced AI assistance.',
      author: 'Sarah Johnson',
      role: 'CTO'
    },
    {
      company: 'Global Systems Ltd',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
      quote: 'The security features and compliance support made our migration seamless. Their enterprise support is exceptional.',
      author: 'Michael Chen',
      role: 'VP Engineering'
    },
    {
      company: 'Innovation Dynamics',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
      quote: 'ROI was immediate. Our development costs reduced by 30% while quality improved significantly.',
      author: 'Elena Rodriguez',
      role: 'Head of Product'
    }
  ];

  return (
    <div className="enterprise-page">
      <ProfessionalHeader />
      
      <div className="enterprise-container">
        {/* Hero Section */}
        <section className="enterprise-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Enterprise-Grade
                <span className="title-highlight"> Development Platform</span>
              </h1>
              <p className="hero-subtitle">
                Scale your development operations with advanced security, compliance, 
                and dedicated support designed for enterprise organizations.
              </p>
              
              <div className="hero-stats">
                {enterpriseStats.map((stat, index) => (
                  <div key={index} className="hero-stat">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg">
                  <Calendar className="w-5 h-5" />
                  Schedule Demo
                </button>
                <button className="btn btn-secondary btn-lg">
                  <Phone className="w-5 h-5" />
                  Contact Sales
                </button>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="enterprise-dashboard">
                <div className="dashboard-header">
                  <div className="dashboard-title">Enterprise Dashboard</div>
                  <div className="dashboard-status">
                    <div className="status-indicator online"></div>
                    <span>All Systems Operational</span>
                  </div>
                </div>
                <div className="dashboard-metrics">
                  <div className="metric">
                    <div className="metric-value">99.99%</div>
                    <div className="metric-label">Uptime</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">2.4s</div>
                    <div className="metric-label">Response Time</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">10,847</div>
                    <div className="metric-label">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="enterprise-features">
          <div className="section-header">
            <h2 className="section-title">Enterprise Features</h2>
            <p className="section-subtitle">
              Comprehensive solutions designed for large-scale development operations
            </p>
          </div>
          
          <div className="features-showcase">
            <div className="features-nav">
              {enterpriseFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`feature-nav-btn ${index === activeFeature ? 'active' : ''}`}
                >
                  <div className="nav-icon">{feature.icon}</div>
                  <div className="nav-content">
                    <h3 className="nav-title">{feature.title}</h3>
                    <p className="nav-description">{feature.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="features-content">
              <div className="feature-details">
                <div className="feature-header">
                  <div className="feature-icon">
                    {enterpriseFeatures[activeFeature].icon}
                  </div>
                  <div className="feature-info">
                    <h3 className="feature-title">
                      {enterpriseFeatures[activeFeature].title}
                    </h3>
                    <p className="feature-description">
                      {enterpriseFeatures[activeFeature].description}
                    </p>
                  </div>
                </div>
                
                <div className="feature-list">
                  {enterpriseFeatures[activeFeature].features.map((item, index) => (
                    <div key={index} className="feature-item">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="compliance-section">
          <div className="section-header">
            <h2 className="section-title">Security & Compliance</h2>
            <p className="section-subtitle">
              Industry-leading security standards and compliance certifications
            </p>
          </div>
          
          <div className="compliance-grid">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="compliance-card">
                <div className="compliance-icon">{standard.icon}</div>
                <div className="compliance-content">
                  <h3 className="compliance-name">{standard.name}</h3>
                  <div className={`compliance-status ${standard.status}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>{standard.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="security-details">
            <div className="security-feature">
              <Shield className="w-6 h-6 text-blue-500" />
              <div className="security-content">
                <h4 className="security-title">Data Protection</h4>
                <p className="security-description">
                  End-to-end encryption, secure data centers, and comprehensive backup systems
                </p>
              </div>
            </div>
            
            <div className="security-feature">
              <Lock className="w-6 h-6 text-green-500" />
              <div className="security-content">
                <h4 className="security-title">Access Control</h4>
                <p className="security-description">
                  Multi-factor authentication, role-based permissions, and audit logging
                </p>
              </div>
            </div>
            
            <div className="security-feature">
              <Award className="w-6 h-6 text-purple-500" />
              <div className="security-content">
                <h4 className="security-title">Compliance</h4>
                <p className="security-description">
                  Regular security audits, compliance monitoring, and certification maintenance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <p className="section-subtitle">
              See what enterprise customers say about AETHERFLOW
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img 
                    src={testimonial.logo} 
                    alt={`${testimonial.company} logo`}
                    className="company-logo"
                  />
                  <div className="company-info">
                    <h4 className="company-name">{testimonial.company}</h4>
                  </div>
                </div>
                
                <div className="testimonial-content">
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="enterprise-pricing">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Enterprise</h3>
              <p className="pricing-description">
                Custom solutions for large organizations
              </p>
            </div>
            
            <div className="pricing-content">
              <div className="pricing-value">
                <span className="pricing-label">Starting at</span>
                <span className="pricing-amount">Custom</span>
                <span className="pricing-period">Contact for pricing</span>
              </div>
              
              <div className="pricing-features">
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Unlimited users and projects</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Dedicated infrastructure</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 enterprise support</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Custom integrations</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Advanced security controls</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Compliance certifications</span>
                </div>
              </div>
            </div>
            
            <div className="pricing-actions">
              <button className="btn btn-primary btn-lg pricing-cta">
                <Calendar className="w-5 h-5" />
                Schedule Demo
              </button>
              <button className="btn btn-secondary btn-lg">
                <Mail className="w-5 h-5" />
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="contact-content">
            <h2 className="contact-title">Ready to Get Started?</h2>
            <p className="contact-subtitle">
              Let's discuss how AETHERFLOW Enterprise can transform your development operations
            </p>
            
            <div className="contact-options">
              <div className="contact-option">
                <div className="contact-icon">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="contact-details">
                  <h4 className="contact-method">Schedule a Demo</h4>
                  <p className="contact-description">
                    See AETHERFLOW Enterprise in action with a personalized demo
                  </p>
                </div>
                <button className="btn btn-primary">
                  Book Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="contact-option">
                <div className="contact-icon">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="contact-details">
                  <h4 className="contact-method">Talk to Sales</h4>
                  <p className="contact-description">
                    Speak with our enterprise sales team about your requirements
                  </p>
                </div>
                <button className="btn btn-secondary">
                  Call Sales
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="contact-option">
                <div className="contact-icon">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="contact-details">
                  <h4 className="contact-method">Email Us</h4>
                  <p className="contact-description">
                    Send us your questions and we'll get back to you within 24 hours
                  </p>
                </div>
                <button className="btn btn-secondary">
                  Send Email
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnterprisePage;