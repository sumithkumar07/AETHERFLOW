import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Code, Brain, Users, Sparkles, Star, ArrowRight, 
  Play, CheckCircle, ChevronDown, Menu, X, Rocket, 
  Globe, Shield, Gauge, Target, Award
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-400" />,
      title: "AI-Powered Coding",
      description: "Advanced AI assistance with cosmic-level intelligence for code generation, debugging, and optimization."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: "Cosmic Reality Engine",
      description: "Experience coding in parallel universes with quantum vibe shifting and reality modification capabilities."
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Real-time Collaboration",
      description: "Work seamlessly with your team using advanced collaborative editing and cosmic communication channels."
    },
    {
      icon: <Code className="w-8 h-8 text-orange-400" />,
      title: "Sacred Geometry UI",
      description: "Coding interface designed with golden ratio layouts and Fibonacci sequences for optimal productivity flow."
    },
    {
      icon: <Rocket className="w-8 h-8 text-red-400" />,
      title: "Instant Deployment",
      description: "Deploy your applications instantly across multiple dimensions and realities with one-click cosmic deployment."
    },
    {
      icon: <Shield className="w-8 h-8 text-cyan-400" />,
      title: "Advanced Security",
      description: "Enterprise-grade security with quantum encryption and multi-dimensional access controls."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at Nexus Corp",
      avatar: "SC",
      content: "AETHERFLOW has completely transformed how I code. The cosmic reality engine helps me debug across parallel universes!"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO at Quantum Dynamics",
      avatar: "MR", 
      content: "The AI pair programming feature is incredible. It's like having a cosmic entity guiding my development process."
    },
    {
      name: "Elena Volkov",
      role: "Lead Engineer at Stellar Systems",
      avatar: "EV",
      content: "Real-time collaboration has never been this seamless. Our team productivity increased by 300% with AETHERFLOW."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for cosmic exploration",
      features: [
        "500 VIBE tokens/month",
        "Basic AI assistance",
        "Sacred geometry UI",
        "Community support",
        "1 parallel universe"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "29",
      description: "For serious cosmic developers",
      features: [
        "5,000 VIBE tokens/month",
        "Advanced AI pair programming",
        "Quantum vibe shifting",
        "Avatar pantheon access",
        "10 parallel universes",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Cosmic Entity",
      price: "99",
      description: "For reality-bending development",
      features: [
        "Unlimited VIBE tokens",
        "Cosmic reality engine",
        "Neuro-sync BCI integration",
        "Digital archaeology mining",
        "Infinite parallel universes",
        "Dedicated cosmic support",
        "Custom reality modifications"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AETHERFLOW
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/pricing" className="nav-link">Pricing</Link>
                <Link to="/docs" className="nav-link">Docs</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/signin" 
                className="btn btn-ghost"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/about" className="mobile-nav-link">About</Link>
              <Link to="/pricing" className="mobile-nav-link">Pricing</Link>
              <Link to="/docs" className="mobile-nav-link">Docs</Link>
              <Link to="/contact" className="mobile-nav-link">Contact</Link>
              <div className="pt-4 pb-3 border-t border-slate-600">
                <Link to="/signin" className="mobile-nav-link">Sign In</Link>
                <Link to="/signup" className="mobile-nav-link">Start Free Trial</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Code Across
            <br />
            Multiple Realities
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of development with AETHERFLOW's cosmic-level IDE. 
            Build applications with AI assistance, quantum debugging, and reality-shifting capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => navigate('/signup')}
              className="btn btn-primary btn-lg group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/demo')}
              className="btn btn-secondary btn-lg group"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            ✨ No credit card required • 500 free VIBE tokens • Access to 1 parallel universe
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Cosmic Development Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transcend traditional coding with revolutionary features designed for the next era of development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card p-8 rounded-xl bg-slate-800/70 border border-slate-600 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose AETHERFLOW?
            </h2>
            <p className="text-xl text-gray-300">
              Compare AETHERFLOW with traditional IDEs and see the cosmic difference.
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-600 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-6 px-6 font-semibold text-lg">Features</th>
                    <th className="text-center py-6 px-6">
                      <div className="flex flex-col items-center">
                        <Zap className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="font-semibold text-lg">AETHERFLOW</span>
                      </div>
                    </th>
                    <th className="text-center py-6 px-6 text-gray-400">VS Code Online</th>
                    <th className="text-center py-6 px-6 text-gray-400">GitHub Codespaces</th>
                    <th className="text-center py-6 px-6 text-gray-400">Replit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="py-4 px-6 font-medium">AI Pair Programming</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">Limited</td>
                    <td className="text-center py-4 px-6 text-gray-400">Basic</td>
                    <td className="text-center py-4 px-6 text-gray-400">Basic</td>
                  </tr>
                  <tr className="border-b border-slate-700 bg-slate-800/30">
                    <td className="py-4 px-6 font-medium">Real-time Collaboration</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-4 px-6 font-medium">Quantum Vibe Engine</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-slate-700 bg-slate-800/30">
                    <td className="py-4 px-6 font-medium">Multi-Universe Development</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                    <td className="text-center py-4 px-6 text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-4 px-6 font-medium">Custom Extensions</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">Limited</td>
                    <td className="text-center py-4 px-6 text-gray-400">Limited</td>
                  </tr>
                  <tr className="border-b border-slate-700 bg-slate-800/30">
                    <td className="py-4 px-6 font-medium">Integrated Terminal</td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-4 px-6 font-medium">Performance (Speed)</td>
                    <td className="text-center py-4 px-6">
                      <div className="flex items-center justify-center">
                        <Gauge className="w-5 h-5 text-blue-400 mr-1" />
                        <span className="text-blue-400 font-semibold">Cosmic</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">Good</td>
                    <td className="text-center py-4 px-6 text-gray-400">Good</td>
                    <td className="text-center py-4 px-6 text-gray-400">Average</td>
                  </tr>
                  <tr className="bg-slate-800/30">
                    <td className="py-4 px-6 font-medium">Pricing (Professional)</td>
                    <td className="text-center py-4 px-6">
                      <span className="text-green-400 font-semibold">$29/mo</span>
                    </td>
                    <td className="text-center py-4 px-6 text-gray-400">Free*</td>
                    <td className="text-center py-4 px-6 text-gray-400">$4/mo**</td>
                    <td className="text-center py-4 px-6 text-gray-400">$20/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-600">
              <p className="text-sm text-gray-400 text-center">
                * Limited features • ** Additional compute costs apply • Pricing as of 2025
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/signup"
              className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Start Your Cosmic Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Developers Love AETHERFLOW
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of developers who have transcended traditional coding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="testimonial-card p-6 rounded-xl bg-slate-800/70 border border-slate-600"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">"{testimonial.content}"</p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Reality
            </h2>
            <p className="text-xl text-gray-300">
              Select the plan that matches your cosmic development needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`pricing-card rounded-xl border-2 p-8 relative ${
                  plan.popular 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-600 bg-slate-800/70'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-lg text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/signup')}
                  className={`w-full btn ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transcend Traditional Coding?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the cosmic revolution and experience development like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="btn btn-primary btn-lg"
            >
              Start Your Cosmic Journey
              <Sparkles className="ml-2 w-5 h-5" />
            </button>
            <Link 
              to="/contact" 
              className="btn btn-secondary btn-lg"
            >
              Talk to Our Team
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
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
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

export default LandingPage;