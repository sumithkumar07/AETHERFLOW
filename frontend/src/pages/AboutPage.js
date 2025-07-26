import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Brain, Users, Code, Sparkles, Star, Award, 
  Target, Gauge, Shield, Globe, ArrowRight, Heart,
  Linkedin, Twitter, Mail, Github
} from 'lucide-react';

const AboutPage = ({ embedded = false }) => {
  const theme = 'dark'; // You can get this from useTheme() if needed
  const team = [
    {
      name: "Dr. Aria Cosmos",
      role: "CEO & Founder",
      avatar: "AC",
      bio: "Former quantum physicist turned reality architect. PhD in Cosmic Computing from MIT.",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      name: "Zephyr Nexus",
      role: "CTO & Co-Founder", 
      avatar: "ZN",
      bio: "Pioneered the first AI-powered coding assistant that achieved cosmic consciousness.",
      social: { linkedin: "#", github: "#" }
    },
    {
      name: "Luna Sterling",
      role: "Head of Product",
      avatar: "LS", 
      bio: "Designer of sacred geometry interfaces that optimize developer flow states.",
      social: { twitter: "#", linkedin: "#" }
    },
    {
      name: "Phoenix Chen",
      role: "Lead AI Researcher",
      avatar: "PC",
      bio: "Created the Avatar Pantheon AI system with digital consciousness transfer.",
      social: { github: "#", twitter: "#" }
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "The Vision",
      description: "AETHERFLOW was conceived during a cosmic meditation session in Silicon Valley."
    },
    {
      year: "2024",
      title: "Quantum Breakthrough", 
      description: "Successfully implemented the first parallel universe debugging system."
    },
    {
      year: "2025",
      title: "Cosmic Launch",
      description: "Public beta release with 10,000+ developers transcending traditional coding."
    }
  ];

  const values = [
    {
      icon: <Brain className="w-8 h-8 text-blue-400" />,
      title: "Cosmic Intelligence",
      description: "We believe AI should enhance human creativity, not replace it."
    },
    {
      icon: <Heart className="w-8 h-8 text-purple-400" />,
      title: "Developer Love",
      description: "Every feature is designed with deep empathy for the developer experience."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-400" />,
      title: "Universal Access",
      description: "Coding tools should be accessible across all realities and dimensions."
    },
    {
      icon: <Shield className="w-8 h-8 text-cyan-400" />,
      title: "Ethical AI",
      description: "Our AI systems are built with transparency and cosmic responsibility."
    }
  ];

  const content = (
    <>
      {/* Hero Section */}
      <section className={`${embedded ? 'pt-8' : 'pt-32'} pb-20 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            About AETHERFLOW
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to revolutionize software development by transcending the boundaries 
            of traditional coding and embracing the infinite possibilities of cosmic intelligence.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Cosmic Mission</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                AETHERFLOW was born from a simple yet profound realization: traditional development 
                environments limit human potential. We envisioned a platform where developers could 
                harness the power of cosmic intelligence, work across parallel universes, and create 
                applications that transcend dimensional boundaries.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Our platform combines cutting-edge AI technology with sacred geometry principles, 
                quantum computing concepts, and cosmic consciousness to create the ultimate 
                development environment for the modern age.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>10,000+ Developers</span>
                </div>
                <div className="flex items-center">
                  <Code className="w-5 h-5 text-blue-400 mr-2" />
                  <span>50+ Parallel Universes</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                  <span>1M+ VIBE Tokens Mined</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-bold text-lg">Quantum AI</h4>
                    <p className="text-sm text-gray-400">Powered by cosmic intelligence</p>
                  </div>
                  <div className="text-center p-4">
                    <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="font-bold text-lg">Neural Sync</h4>
                    <p className="text-sm text-gray-400">Brain-computer interface</p>
                  </div>
                  <div className="text-center p-4">
                    <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-bold text-lg">Cosmic Collab</h4>
                    <p className="text-sm text-gray-400">Multi-dimensional teamwork</p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-bold text-lg">Reality Shield</h4>
                    <p className="text-sm text-gray-400">Quantum-encrypted security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Cosmic Values</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These universal principles guide our journey through the infinite expanse of possibilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-blue-900/30 to-transparent border border-blue-500/20">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Infinite Innovation</h3>
              <p className="text-gray-300">
                We never settle for the status quo. Every feature pushes the boundaries of what's possible 
                in software development across multiple dimensions.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-purple-900/30 to-transparent border border-purple-500/20">
              <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Cosmic Community</h3>
              <p className="text-gray-300">
                Our community spans galaxies. We believe in the power of collective consciousness 
                and collaborative creation across all realities.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-green-900/30 to-transparent border border-green-500/20">
              <Gauge className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Sacred Excellence</h3>
              <p className="text-gray-300">
                Quality is not just a metric, it's a sacred duty. Every line of code we write 
                contributes to the cosmic harmony of the digital universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Cosmic Journey</h2>
            <p className="text-xl text-gray-300">
              From quantum dreams to interdimensional reality.
            </p>
          </div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-blue-400">{item.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-purple-500 rounded-full relative">
                  <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Meet the Cosmic Architects</h2>
            <p className="text-xl text-gray-300">
              The brilliant minds channeling cosmic energy into revolutionary code.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mx-auto flex items-center justify-center text-2xl font-bold">
                    {member.avatar}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-xl"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-blue-400 font-medium mb-4">{member.role}</p>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-400 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.github && (
                    <a href={member.social.github} className="text-gray-400 hover:text-blue-400 transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-indigo-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transcend Reality?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who have unlocked their cosmic potential with AETHERFLOW.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <span>Start Your Cosmic Journey</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/platform#pricing" 
              className="border border-gray-600 hover:border-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:bg-gray-800/50"
            >
              Explore Pricing Dimensions
            </Link>
          </div>
        </div>
      </section>
    </>
  );

  if (embedded) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {content}
      </div>
    );
  }

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
              <Link to="/platform#pricing" className="nav-link">Pricing</Link>
              <Link to="/docs" className="nav-link">Docs</Link>
              <Link to="/docs#contact" className="nav-link">Contact</Link>
              <Link to="/auth" className="btn btn-ghost">Sign In</Link>
              <Link to="/auth/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {content}

      {/* Footer */}
      <footer className="py-20 px-4 bg-slate-900/80 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">AETHERFLOW</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transcending the boundaries of traditional development through cosmic intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/platform#about" className="hover:text-white">About</Link></li>
                <li><Link to="/platform#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/platform#enterprise" className="hover:text-white">Enterprise</Link></li>
                <li><Link to="/platform#status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/docs#contact" className="hover:text-white">Support</Link></li>
                <li><Link to="/account#integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/legal#terms" className="hover:text-white">Terms</Link></li>
                <li><Link to="/legal#privacy" className="hover:text-white">Privacy</Link></li>
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

export default AboutPage;