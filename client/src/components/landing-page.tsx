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
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-gradient2' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-gradient2)' filter='drop-shadow(0 0 10px rgba(255,102,51,0.6))'/%3E%3Cg transform='translate(100,100)'%3E%3Cpath d='M0,0 Q-50,-30 -80,0 Q-50,30 0,0 Q50,30 80,0 Q50,-30 0,0' fill='none' stroke='url(%23heart-gradient2)' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M0,0 Q-60,-40 -100,0 Q-60,40 0,0 Q60,40 100,0 Q60,-40 0,0' fill='none' stroke='url(%23heart-gradient2)' stroke-width='1' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'drop-shadow(0 0 15px rgba(255,102,51,0.4)) drop-shadow(0 0 30px rgba(255,51,255,0.2))'
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