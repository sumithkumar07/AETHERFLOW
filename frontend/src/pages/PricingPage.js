import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Check, X, Star, Crown, Sparkles, ArrowRight, 
  HelpCircle, Users, Shield, Gauge, Brain, Code, Globe, Rocket, 
  ChevronDown, ChevronUp
} from 'lucide-react';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for cosmic exploration",
      icon: <Star className="w-6 h-6" />,
      color: "blue",
      features: [
        "500 VIBE tokens/month",
        "Basic AI assistance",
        "Sacred geometry UI",
        "1 parallel universe",
        "Community support",
        "Basic code evolution",
        "Standard templates",
        "Public projects only"
      ],
      limitations: [
        "No private projects",
        "Limited AI requests",
        "No advanced features",
        "Community support only"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Professional",
      price: { monthly: 29, yearly: 290 },
      description: "For serious cosmic developers",
      icon: <Code className="w-6 h-6" />,
      color: "purple", 
      features: [
        "5,000 VIBE tokens/month",
        "Advanced AI pair programming",
        "Sacred geometry UI",
        "10 parallel universes",
        "Priority support",
        "Advanced code evolution",
        "Quantum vibe shifting",
        "Avatar pantheon access",
        "Private projects",
        "Team collaboration (5 members)",
        "Advanced templates",
        "Git integration",
        "Custom themes"
      ],
      limitations: [],
      popular: true,
      cta: "Start Professional Trial"
    },
    {
      name: "Cosmic Entity",
      price: { monthly: 99, yearly: 990 },
      description: "For reality-bending development", 
      icon: <Crown className="w-6 h-6" />,
      color: "golden",
      features: [
        "Unlimited VIBE tokens",
        "Cosmic reality engine",
        "Sacred geometry UI",
        "Infinite parallel universes",
        "Dedicated cosmic support",
        "Full code evolution suite",
        "Neuro-sync BCI integration",
        "Digital archaeology mining",
        "Avatar pantheon mastery",
        "Unlimited private projects",
        "Unlimited team members",
        "Custom reality modifications",
        "White-label options",
        "API access",
        "Custom integrations",
        "SLA guarantee"
      ],
      limitations: [],
      popular: false,
      cta: "Ascend to Entity Level"
    }
  ];

  const faqs = [
    {
      question: "What are VIBE tokens and how do they work?",
      answer: "VIBE tokens are our cosmic currency that powers AI interactions, code evolution, and reality modifications. You earn tokens through coding activities and can use them for advanced features like quantum debugging and parallel universe access."
    },
    {
      question: "Can I switch between parallel universes freely?",
      answer: "The number of parallel universes you can access depends on your plan. Free users get 1, Professional users get 10, and Cosmic Entity users have infinite access. You can switch between available universes at any time."
    },
    {
      question: "How does the AI pair programming work?",
      answer: "Our AI pair programming features legendary developer avatars like Ada Lovelace and Linus Torvalds. They provide real-time coding assistance, code reviews, and help debug across multiple realities simultaneously."
    },
    {
      question: "What is the sacred geometry UI?",
      answer: "Our interface is designed using golden ratio proportions and Fibonacci sequences to optimize developer flow states and enhance productivity. It's mathematically proven to reduce cognitive load and improve focus."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes! We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with transcending traditional coding, we'll provide a full refund."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period."
    },
    {
      question: "Is my code secure across parallel universes?",
      answer: "Yes! We use quantum encryption and multi-dimensional security protocols to ensure your code remains secure across all realities. Your data is protected by cosmic-level security measures."
    },
    {
      question: "What happens to my projects if I cancel?",
      answer: "Your projects remain accessible for 90 days after cancellation. You can export all your code and data during this period. After 90 days, projects are archived but can be restored if you reactivate your account."
    }
  ];

  const addOns = [
    {
      name: "Neuro-Sync BCI Pack",
      price: 19,
      description: "Brain-computer interface integration for thought-to-code",
      icon: <Brain className="w-5 h-5" />
    },
    {
      name: "Enterprise Security",
      price: 49, 
      description: "Advanced security with quantum encryption",
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: "Global CDN",
      price: 29,
      description: "Lightning-fast cosmic deployment worldwide",
      icon: <Globe className="w-5 h-5" />
    },
    {
      name: "Priority Processing",
      price: 39,
      description: "Skip the queue for all AI operations",
      icon: <Gauge className="w-5 h-5" />
    }
  ];

  const getPlanColor = (color) => {
    const colors = {
      blue: "from-blue-400 to-cyan-400",
      purple: "from-purple-400 to-pink-400", 
      golden: "from-yellow-400 to-orange-400"
    };
    return colors[color] || colors.blue;
  };

  const getPlanBorder = (color, popular) => {
    if (popular) return "border-purple-500 bg-purple-500/10";
    const borders = {
      blue: "border-blue-500/50",
      purple: "border-purple-500/50",
      golden: "border-yellow-500/50"
    };
    return borders[color] || borders.blue;
  };

  const savings = billingCycle === 'yearly' ? 17 : 0;

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
              <Link to="/docs" className="nav-link">Docs</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
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
            Choose Your Reality
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Select the perfect plan to transcend traditional coding and embrace cosmic development.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-slate-800/70 rounded-xl p-1 border border-slate-600 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                billingCycle === 'yearly' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {savings}%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`pricing-card rounded-2xl border-2 p-8 relative bg-slate-800/70 ${getPlanBorder(plan.color, plan.popular)} hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${getPlanColor(plan.color)} mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    ${plan.price[billingCycle]}
                    <span className="text-lg text-gray-400">
                      {billingCycle === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                  {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                    <div className="mt-2 text-sm text-green-400">
                      Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <li key={limitIndex} className="flex items-start opacity-60">
                      <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/signup')}
                  className={`w-full btn ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  } group`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {plan.name === "Professional" && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-400">14-day free trial • No credit card required</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Power-Up Your Experience</h2>
            <p className="text-xl text-gray-300">Enhance your cosmic development with premium add-ons</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="addon-card p-6 rounded-xl bg-slate-800/70 border border-slate-600 hover:border-purple-500 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                    {addon.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{addon.name}</h3>
                    <p className="text-purple-400 font-bold">${addon.price}/month</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/70 rounded-2xl border border-slate-600 p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Enterprise Reality Solutions</h2>
            <p className="text-xl text-gray-300 mb-8">
              Need custom reality modifications or enterprise-grade cosmic features? 
              Let's create a solution tailored to your organization's interdimensional needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Contact Sales
              </Link>
              <button className="btn btn-secondary btn-lg">
                Book Demo
              </button>
            </div>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Unlimited Users
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center">
                <Gauge className="w-4 h-4 mr-2" />
                99.99% SLA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about cosmic development pricing</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/70 rounded-xl border border-slate-600">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors rounded-xl"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <Link to="/contact" className="btn btn-secondary">
              <Help className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transcend Traditional Development?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already coding across multiple realities.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="btn btn-primary btn-lg group"
          >
            Start Your Cosmic Journey
            <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          <div className="mt-4 text-sm text-gray-400">
            ✨ No credit card required • 14-day free trial • Cancel anytime
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
                <li><Link to="/pricing" className="hover:text-white text-blue-400">Pricing</Link></li>
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

export default PricingPage;