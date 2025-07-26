import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  CreditCard, Download, Calendar, TrendingUp, 
  AlertTriangle, CheckCircle, Settings, Plus,
  FileText, Clock, DollarSign, Users, Zap
} from 'lucide-react';

const BillingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [billingInfo] = useState({
    currentPlan: 'Professional',
    billingCycle: 'monthly',
    nextBillingDate: '2025-02-15',
    currentUsage: {
      vibeTokens: 1847,
      vibeTokensLimit: 5000,
      collaborators: 5,
      collaboratorsLimit: 10,
      projects: 12,
      projectsLimit: 50,
      storage: 2.4, // GB
      storageLimit: 100
    },
    monthlySpend: 29.00,
    yearlyProjection: 348.00
  });

  const [billingHistory] = useState([
    {
      id: 1,
      date: '2025-01-15',
      description: 'Professional Plan - Monthly',
      amount: 29.00,
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: 2,
      date: '2024-12-15',
      description: 'Professional Plan - Monthly',
      amount: 29.00,
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: 3,
      date: '2024-11-15',
      description: 'Professional Plan - Monthly',
      amount: 29.00,
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: 4,
      date: '2024-10-15',
      description: 'Free to Professional Upgrade',
      amount: 29.00,
      status: 'paid',
      invoiceUrl: '#'
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true
    }
  ]);

  const usagePercentage = (current, limit) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="billing-page">
      <ProfessionalHeader />
      
      <div className="billing-container">
        <div className="billing-header">
          <div className="header-content">
            <h1 className="page-title">Billing & Usage</h1>
            <p className="page-subtitle">
              Manage your subscription, payments, and usage analytics
            </p>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Current Plan Overview */}
        <section className="plan-overview">
          <div className="plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h2 className="plan-name">{billingInfo.currentPlan}</h2>
                <p className="plan-price">
                  ${billingInfo.monthlySpend.toFixed(2)}/month
                </p>
              </div>
              <div className="plan-badge">Current Plan</div>
            </div>
            
            <div className="plan-details">
              <div className="detail-item">
                <Calendar className="w-4 h-4" />
                <span>Next billing: {new Date(billingInfo.nextBillingDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <TrendingUp className="w-4 h-4" />
                <span>Yearly projection: ${billingInfo.yearlyProjection.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="billing-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">${billingInfo.monthlySpend.toFixed(2)}</div>
                <div className="stat-label">This Month</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{billingInfo.currentUsage.collaborators}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{billingInfo.currentUsage.vibeTokens}</div>
                <div className="stat-label">VIBE Tokens Used</div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Analytics */}
        <section className="usage-section">
          <h3 className="section-title">Current Usage</h3>
          <div className="usage-grid">
            <div className="usage-card">
              <div className="usage-header">
                <div className="usage-info">
                  <h4 className="usage-title">VIBE Tokens</h4>
                  <p className="usage-description">AI assistance and code generation</p>
                </div>
                <div className={`usage-value ${getUsageColor(usagePercentage(billingInfo.currentUsage.vibeTokens, billingInfo.currentUsage.vibeTokensLimit))}`}>
                  {billingInfo.currentUsage.vibeTokens} / {billingInfo.currentUsage.vibeTokensLimit}
                </div>
              </div>
              <div className="usage-bar">
                <div 
                  className={`usage-fill ${getUsageBarColor(usagePercentage(billingInfo.currentUsage.vibeTokens, billingInfo.currentUsage.vibeTokensLimit))}`}
                  style={{ width: `${usagePercentage(billingInfo.currentUsage.vibeTokens, billingInfo.currentUsage.vibeTokensLimit)}%` }}
                ></div>
              </div>
              <div className="usage-percentage">
                {usagePercentage(billingInfo.currentUsage.vibeTokens, billingInfo.currentUsage.vibeTokensLimit).toFixed(1)}% used
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <div className="usage-info">
                  <h4 className="usage-title">Team Members</h4>
                  <p className="usage-description">Active collaborators</p>
                </div>
                <div className={`usage-value ${getUsageColor(usagePercentage(billingInfo.currentUsage.collaborators, billingInfo.currentUsage.collaboratorsLimit))}`}>
                  {billingInfo.currentUsage.collaborators} / {billingInfo.currentUsage.collaboratorsLimit}
                </div>
              </div>
              <div className="usage-bar">
                <div 
                  className={`usage-fill ${getUsageBarColor(usagePercentage(billingInfo.currentUsage.collaborators, billingInfo.currentUsage.collaboratorsLimit))}`}
                  style={{ width: `${usagePercentage(billingInfo.currentUsage.collaborators, billingInfo.currentUsage.collaboratorsLimit)}%` }}
                ></div>
              </div>
              <div className="usage-percentage">
                {usagePercentage(billingInfo.currentUsage.collaborators, billingInfo.currentUsage.collaboratorsLimit).toFixed(1)}% used
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <div className="usage-info">
                  <h4 className="usage-title">Projects</h4>
                  <p className="usage-description">Active development projects</p>
                </div>
                <div className={`usage-value ${getUsageColor(usagePercentage(billingInfo.currentUsage.projects, billingInfo.currentUsage.projectsLimit))}`}>
                  {billingInfo.currentUsage.projects} / {billingInfo.currentUsage.projectsLimit}
                </div>
              </div>
              <div className="usage-bar">
                <div 
                  className={`usage-fill ${getUsageBarColor(usagePercentage(billingInfo.currentUsage.projects, billingInfo.currentUsage.projectsLimit))}`}
                  style={{ width: `${usagePercentage(billingInfo.currentUsage.projects, billingInfo.currentUsage.projectsLimit)}%` }}
                ></div>
              </div>
              <div className="usage-percentage">
                {usagePercentage(billingInfo.currentUsage.projects, billingInfo.currentUsage.projectsLimit).toFixed(1)}% used
              </div>
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <div className="usage-info">
                  <h4 className="usage-title">Storage</h4>
                  <p className="usage-description">Project files and assets</p>
                </div>
                <div className={`usage-value ${getUsageColor(usagePercentage(billingInfo.currentUsage.storage, billingInfo.currentUsage.storageLimit))}`}>
                  {billingInfo.currentUsage.storage}GB / {billingInfo.currentUsage.storageLimit}GB
                </div>
              </div>
              <div className="usage-bar">
                <div 
                  className={`usage-fill ${getUsageBarColor(usagePercentage(billingInfo.currentUsage.storage, billingInfo.currentUsage.storageLimit))}`}
                  style={{ width: `${usagePercentage(billingInfo.currentUsage.storage, billingInfo.currentUsage.storageLimit)}%` }}
                ></div>
              </div>
              <div className="usage-percentage">
                {usagePercentage(billingInfo.currentUsage.storage, billingInfo.currentUsage.storageLimit).toFixed(1)}% used
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            Billing History
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'history' && (
            <div className="billing-history">
              <div className="history-header">
                <h3 className="section-title">Billing History</h3>
                <button className="btn btn-secondary btn-sm">
                  <Download className="w-4 h-4" />
                  Export All
                </button>
              </div>
              
              <div className="history-table">
                <div className="table-header">
                  <div className="col-date">Date</div>
                  <div className="col-description">Description</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>
                
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="table-row">
                    <div className="col-date">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                    <div className="col-description">
                      {invoice.description}
                    </div>
                    <div className="col-amount">
                      ${invoice.amount.toFixed(2)}
                    </div>
                    <div className="col-status">
                      <span className={`status-badge ${invoice.status}`}>
                        <CheckCircle className="w-3 h-3" />
                        {invoice.status}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button className="btn btn-ghost btn-sm">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="payment-methods">
              <div className="payment-header">
                <h3 className="section-title">Payment Methods</h3>
                <button className="btn btn-primary btn-sm">
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </button>
              </div>
              
              <div className="payment-cards">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="payment-card">
                    <div className="card-info">
                      <div className="card-type">
                        <CreditCard className="w-6 h-6" />
                        <span className="card-brand">
                          {method.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="card-details">
                        <div className="card-number">
                          •••• •••• •••• {method.last4}
                        </div>
                        <div className="card-expiry">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      {method.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                      <button className="btn btn-ghost btn-sm">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="billing-address">
                <h4 className="subsection-title">Billing Address</h4>
                <div className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name (Optional)</label>
                      <input type="text" placeholder="Your Company" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input type="text" placeholder="123 Main Street" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Address Line 2 (Optional)</label>
                      <input type="text" placeholder="Apt, suite, etc." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" placeholder="San Francisco" />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" placeholder="CA" />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input type="text" placeholder="94105" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary">
                      Update Billing Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;