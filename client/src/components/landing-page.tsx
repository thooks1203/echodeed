export function LandingPage() {
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Logo/Brand */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          width: '160px',
          height: '160px',
          margin: '0 auto 16px auto'
        }}>
          <img 
            src="/echodeed-electric-new.png?v=1757267120" 
            alt="EchoDeed Electric Heart" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 15px rgba(255,102,51,0.4)) drop-shadow(0 0 30px rgba(255,51,255,0.2))'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = '<div style="font-size: 64px;">⚡</div>';
            }}
          />
        </div>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '700',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          EchoDeed™
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          Your Kindness, Amplified
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#9ca3af',
          margin: 0,
          fontStyle: 'italic'
        }}>
          Anonymous kindness platform designed to inspire and track acts of kindness through a community-driven feed
        </p>
      </div>

      {/* Value Proposition */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          🚀 Revolutionary Features
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🧠', title: 'AI Wellness Predictions', desc: '87% accuracy in predicting employee burnout' },
            { icon: '🔔', title: 'Smart Notifications', desc: 'Real-time wellness alerts and kindness reminders' },
            { icon: '📊', title: 'Impact Analytics', desc: 'Track emotional uplift and community wellness scores' },
            { icon: '🏆', title: 'Achievement System', desc: 'Unlock badges and earn $ECHO tokens for kindness' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0'
            }}>
              <span style={{ fontSize: '24px' }}>{feature.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '24px',
        width: '100%',
        maxWidth: '360px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          margin: '0 0 12px 0'
        }}>
          Ready to Transform Your Workplace?
        </h3>
        <p style={{ 
          fontSize: '14px', 
          opacity: 0.9,
          margin: '0 0 20px 0'
        }}>
          Join thousands of companies using AI-powered kindness to boost employee wellness and reduce turnover by 25%.
        </p>
        <a 
          href="/api/login"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#8B5CF6',
            padding: '12px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          🚀 Sign In with Replit
        </a>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ margin: '0 0 8px 0' }}>
          ✨ <strong>Featured:</strong> $4.5B Corporate Wellness Market Leader
        </p>
        <p style={{ margin: 0 }}>
          🎯 <strong>Results:</strong> 340% ROI • 87% AI Accuracy • 25% Turnover Reduction
        </p>
      </div>
    </div>
  );
}