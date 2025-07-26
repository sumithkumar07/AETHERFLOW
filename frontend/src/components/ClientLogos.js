import React from 'react';

const ClientLogos = () => {
  const clients = [
    {
      name: 'Microsoft',
      logo: 'https://img.icons8.com/?size=100&id=23028&format=png&color=000000',
      description: 'Fortune 500 Technology'
    },
    {
      name: 'Google',
      logo: 'https://img.icons8.com/?size=100&id=17949&format=png&color=000000',
      description: 'Search & Cloud Computing'
    },
    {
      name: 'Amazon',
      logo: 'https://img.icons8.com/?size=100&id=32354&format=png&color=000000',
      description: 'E-commerce & AWS'
    },
    {
      name: 'Meta',
      logo: 'https://img.icons8.com/?size=100&id=32323&format=png&color=000000',
      description: 'Social Media Platform'
    },
    {
      name: 'Netflix',
      logo: 'https://img.icons8.com/?size=100&id=13963&format=png&color=000000',
      description: 'Streaming Entertainment'
    },
    {
      name: 'Stripe',
      logo: 'https://img.icons8.com/?size=100&id=qYfwpsRXEcPC&format=png&color=000000',
      description: 'Financial Technology'
    },
    {
      name: 'Shopify',
      logo: 'https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000',
      description: 'E-commerce Platform'
    },
    {
      name: 'Adobe',
      logo: 'https://img.icons8.com/?size=100&id=44471&format=png&color=000000',
      description: 'Creative Software'
    }
  ];

  return (
    <section className="client-logos-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Trusted by Industry Leaders</h2>
          <p className="section-subtitle">
            Join thousands of developers and enterprises building the future with AETHERFLOW
          </p>
        </div>

        <div className="logos-grid">
          {clients.map((client, index) => (
            <div key={client.name} className={`logo-item fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="logo-container">
                <img 
                  src={client.logo} 
                  alt={`${client.name} logo`}
                  className="client-logo"
                  loading="lazy"
                />
              </div>
              <div className="client-info">
                <h3 className="client-name">{client.name}</h3>
                <p className="client-description">{client.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="social-proof-stats">
          <div className="stat-item">
            <span className="stat-number">10M+</span>
            <span className="stat-label">Lines of Code Generated</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500K+</span>
            <span className="stat-label">Active Developers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime SLA</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Countries</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;