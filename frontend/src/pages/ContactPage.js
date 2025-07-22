import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Mail, MessageSquare, Phone, MapPin, Send, 
  Clock, CheckCircle, AlertCircle, Users, Rocket, 
  Brain, Github, Twitter, Linkedin, Globe
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: 'general',
        message: ''
      });
    }, 2000);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Get help from our cosmic support team',
      contact: 'support@aetherflow.dev',
      action: 'mailto:support@aetherflow.dev',
      color: 'blue'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Live Chat',
      description: '24/7 instant assistance across all realities',
      contact: 'Available 24/7',
      action: '#',
      color: 'green'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Direct line to our reality engineers',
      contact: '+1 (555) COSMIC-1',
      action: 'tel:+15552676421',
      color: 'purple'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Cosmic HQ',
      description: 'Visit us in our interdimensional office',
      contact: 'Silicon Valley, CA',
      action: '#',
      color: 'orange'
    }
  ];

  const subjects = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'partnerships', label: 'Partnerships' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'feedback', label: 'Feature Feedback' },
    { value: 'bugs', label: 'Bug Reports' },
    { value: 'careers', label: 'Careers' }
  ];

  const team = [
    {
      name: 'Luna Sterling',
      role: 'Head of Support',
      avatar: 'LS',
      specialties: ['Technical Support', 'User Experience']
    },
    {
      name: 'Phoenix Chen', 
      role: 'Sales Director',
      avatar: 'PC',
      specialties: ['Enterprise Sales', 'Custom Solutions']
    },
    {
      name: 'Nova Reyes',
      role: 'Partnership Manager',
      avatar: 'NR',
      specialties: ['Strategic Partnerships', 'Integrations']
    }
  ];

  const getMethodColor = (color) => {
    const colors = {
      blue: 'from-blue-400 to-cyan-400',
      green: 'from-green-400 to-emerald-400',
      purple: 'from-purple-400 to-pink-400',
      orange: 'from-orange-400 to-red-400'
    };
    return colors[color] || colors.blue;
  };

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
              <Link to="/docs" className="nav-link">Docs</Link>
              <Link to="/signin" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Ready to transcend traditional development? Our cosmic support team is here to help you navigate the multiverse of possibilities.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="contact-method-card group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getMethodColor(method.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{method.description}</p>
                <div className="text-sm font-medium text-blue-400">{method.contact}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <p className="text-gray-300 mb-8">
                Whether you have questions about our cosmic features, need technical support, 
                or want to discuss enterprise solutions, we're here to help.
              </p>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Message sent successfully! We'll get back to you within 24 hours.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Your cosmic name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your organization"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us about your cosmic development needs..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose AETHERFLOW?</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">24/7 Cosmic Support</h4>
                    <p className="text-gray-400 text-sm">
                      Our support team operates across multiple time zones and realities to assist you instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">AI-Powered Solutions</h4>
                    <p className="text-gray-400 text-sm">
                      Get intelligent answers and solutions powered by our cosmic AI system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Expert Team</h4>
                    <p className="text-gray-400 text-sm">
                      Work with experienced developers who understand cosmic-level challenges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lightning Fast</h4>
                    <p className="text-gray-400 text-sm">
                      Average response time under 2 hours for all support requests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Meet Our Support Team</h3>
                <div className="space-y-4">
                  {team.map((member, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-sm font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-purple-400 mb-1">{member.role}</p>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty, specIndex) => (
                            <span key={specIndex} className="text-xs bg-slate-700 px-2 py-1 rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Follow Our Cosmic Journey</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Looking for Quick Answers?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Check out our documentation and help center for instant solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/docs" className="btn btn-secondary btn-lg">
              Documentation
            </Link>
            <Link to="/help" className="btn btn-secondary btn-lg">
              Help Center
            </Link>
            <Link to="/status" className="btn btn-secondary btn-lg">
              System Status
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">AETHERFLOW</span>
              </div>
              <p className="text-gray-400">
                The cosmic-level IDE for reality-bending development.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white text-blue-400">Contact</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AETHERFLOW. All rights reserved. Transcending realities since the cosmic dawn.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;