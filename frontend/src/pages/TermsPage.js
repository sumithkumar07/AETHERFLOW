import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Scale, Shield, FileText, Calendar, Mail } from 'lucide-react';

const TermsPage = () => {
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
          <Scale className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">Last updated: January 1, 2025</p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none">
          <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-gray-300">
              By accessing and using AETHERFLOW ("Service"), you agree to be bound by these Terms of Service 
              and our Privacy Policy. These terms apply to all users of the Service, including developers, 
              organizations, and cosmic entities accessing our platform across multiple realities.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FileText className="w-6 h-6 text-purple-400 mr-2" />
                Service Description
              </h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  AETHERFLOW is a cosmic-level integrated development environment (IDE) that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>AI-powered coding assistance with legendary developer avatars</li>
                  <li>Parallel universe debugging capabilities</li>
                  <li>Sacred geometry user interface design</li>
                  <li>VIBE token economy and cosmic rewards system</li>
                  <li>Real-time collaboration across dimensions</li>
                  <li>Quantum vibe shifting and reality modification tools</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">User Accounts and Responsibilities</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Account Registration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per user across all parallel universes</li>
                  <li>You must be 13+ years old to create an account</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Acceptable Use</h3>
                <p className="text-gray-300 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Violate any laws or regulations in any reality or dimension</li>
                  <li>Interfere with the Service's security features</li>
                  <li>Attempt to disrupt cosmic harmony or universal balance</li>
                  <li>Use the Service to harm others or damage property</li>
                  <li>Impersonate legendary developers without proper avatar authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">VIBE Token Economy</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Token Earning and Usage</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>VIBE tokens are earned through legitimate development activities</li>
                  <li>Tokens have no real-world monetary value</li>
                  <li>Token manipulation or exploitation is prohibited</li>
                  <li>We reserve the right to adjust token balances for violations</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Cosmic Features</h3>
                <p className="text-gray-300">
                  Access to parallel universes, quantum debugging, and reality modification features 
                  are subject to fair use policies and may be limited based on your subscription plan.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Your Content</h3>
                <p className="text-gray-300 mb-4">
                  You retain all rights to code, projects, and content you create using AETHERFLOW. 
                  By using our Service, you grant us a limited license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>Host and store your content across multiple realities</li>
                  <li>Enable collaboration features with other users</li>
                  <li>Backup and restore your projects</li>
                  <li>Provide AI assistance and code analysis</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Our Content</h3>
                <p className="text-gray-300">
                  AETHERFLOW's technology, including AI models, cosmic algorithms, and sacred geometry 
                  calculations, remain our intellectual property. Avatar personalities are licensed 
                  tributes to legendary developers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Payment and Billing</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>Subscription fees are billed in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We may change pricing with 30 days' notice</li>
                  <li>Auto-renewal can be canceled at any time</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Free Tier</h3>
                <p className="text-gray-300">
                  Free accounts include basic features with usage limitations. We reserve the right 
                  to modify free tier offerings at any time.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  Your privacy is important to us. Our data practices are detailed in our 
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 ml-1">Privacy Policy</Link>.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>We use industry-standard encryption across all realities</li>
                  <li>Your code and projects remain private by default</li>
                  <li>We never sell your personal data to third parties</li>
                  <li>You can export your data at any time</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Uptime and Reliability</h3>
                <p className="text-gray-300 mb-4">
                  While we strive for 99.9% uptime across all parallel universes, we cannot guarantee 
                  uninterrupted service due to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>Cosmic storms and interdimensional interference</li>
                  <li>Scheduled maintenance and updates</li>
                  <li>Third-party service dependencies</li>
                  <li>Force majeure events in any reality</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Service Modifications</h3>
                <p className="text-gray-300">
                  We may modify, suspend, or discontinue features with reasonable notice. 
                  Critical security updates may be applied immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  AETHERFLOW is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>Data loss or corruption across any universe</li>
                  <li>Unintended reality modifications or cosmic side effects</li>
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Third-party integrations or external services</li>
                  <li>AI-generated code suggestions or recommendations</li>
                </ul>
                <p className="text-gray-300">
                  Our total liability shall not exceed the amount paid by you in the 12 months 
                  preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <h3 className="text-lg font-semibold mb-3">Account Termination</h3>
                <p className="text-gray-300 mb-4">
                  Either party may terminate your account:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-6">
                  <li>You may cancel your subscription at any time</li>
                  <li>We may terminate for violations of these terms</li>
                  <li>Termination is effective immediately upon notice</li>
                  <li>Your data will be retained for 90 days after termination</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Effect of Termination</h3>
                <p className="text-gray-300">
                  Upon termination, your access to paid features ends immediately. 
                  You may export your data during the 90-day retention period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300">
                  These Terms are governed by the laws of California, United States, and applicable 
                  intergalactic commerce regulations. Any disputes will be resolved through binding 
                  arbitration in San Francisco, CA, or the nearest cosmic tribunal with jurisdiction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300">
                  We may update these Terms from time to time. Material changes will be communicated 
                  via email or platform notification 30 days before taking effect. Continued use of 
                  AETHERFLOW constitutes acceptance of updated terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Mail className="w-6 h-6 text-green-400 mr-2" />
                Contact Information
              </h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
                <p className="text-gray-300 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> legal@aetherflow.dev</p>
                  <p><strong>Address:</strong> AETHERFLOW Legal Department, Silicon Valley, CA</p>
                  <p><strong>Cosmic Portal:</strong> Available in our interdimensional support center</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Need help understanding these terms?
          </p>
          <Link to="/contact" className="btn btn-secondary">
            Contact Our Legal Team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;