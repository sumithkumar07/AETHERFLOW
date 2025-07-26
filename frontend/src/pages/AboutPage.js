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
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/docs" className="nav-link">Docs</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/signin" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
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
              <div className="cosmic-orb w-96 h-96 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-purple-500/40 to-cyan-500/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-8 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400"></div>
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center mb-16 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <div className="bg-slate-800/70 p-6 rounded-xl border border-slate-600">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{item.year}</div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-400 rounded-full border-4 border-slate-900"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-300">The cosmic principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/70 rounded-xl border border-slate-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Cosmic Team</h2>
            <p className="text-xl text-gray-300">The visionaries behind the reality-bending development revolution</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl font-bold text-white mb-4">
                    {member.avatar}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-purple-400 mb-3">{member.role}</p>
                <p className="text-sm text-gray-300 mb-4">{member.bio}</p>
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
                    <a href={member.social.github} className="text-gray-400 hover:text-purple-400 transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-400">10,000+</div>
              <div className="text-gray-300">Cosmic Developers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">50+</div>
              <div className="text-gray-300">Parallel Universes</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-400">1M+</div>
              <div className="text-gray-300">VIBE Tokens Mined</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-yellow-400">99.9%</div>
              <div className="text-gray-300">Reality Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Cosmic Mission?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of the revolution that's transforming how developers create the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Get in Touch
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
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white text-blue-400">About</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/press" className="hover:text-white">Press</Link></li>
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

export default AboutPage;