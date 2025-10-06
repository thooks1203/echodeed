import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to EchoDeed™",
      subtitle: "Character Education, Reimagined",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" style={{width: '180px', height: '180px'}} />
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0', color: '#1f2937' }}>Welcome to EchoDeed™</h1>
          </div>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            Transform character development through evidence-based kindness activities and build positive school culture through our innovative platform.
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.1))',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(139,92,246,0.2)',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '16px', color: '#8B5CF6', fontWeight: '600', margin: 0 }}>
              ✨ Every character-building moment shapes tomorrow's leaders
            </p>
          </div>
          <div style={{ fontSize: '24px', color: '#10B981', fontWeight: '700' }}>
            243,876 character moments tracked!
          </div>
        </div>
      )
    },
    {
      title: "🌟 How It Works",
      subtitle: "Simple, Anonymous, Inspiring",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { step: '1', icon: '📝', title: 'Document Character', desc: 'Record acts of kindness and character development - completely anonymous' },
            { step: '2', icon: '⚡', title: 'Build Culture', desc: 'Your actions contribute to positive school culture and peer inspiration' },
            { step: '3', icon: '🪙', title: 'Track Growth', desc: 'Earn recognition and track your character development journey' },
            { step: '4', icon: '🌍', title: 'Shape Leaders', desc: 'Participate in evidence-based character education that creates tomorrow\'s leaders' }
          ].map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              background: 'rgba(16,185,129,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.1)'
            }}>
              <div style={{
                minWidth: '36px',
                height: '36px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #10B981, #8B5CF6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {step.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>{step.icon}</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>{step.title}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "🎁 Ready to Start?",
      subtitle: "Begin Your Character Journey",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌟</div>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            You're now part of an innovative character education community that develops empathy, leadership, and social responsibility.
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>
              🏠 Explore character development activities
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#8B5CF6' }}>
              📍 Connect with your school community
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#F59E0B' }}>
              🏅 Track your leadership growth
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            color: '#6b7280'
          }}
          data-testid="button-close-welcome"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 24px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {currentStepData.title}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#8B5CF6',
              margin: 0,
              fontWeight: '600'
            }}>
              {currentStepData.subtitle}
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            {currentStepData.content}
          </div>

          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: index === currentStep ? '#8B5CF6' : '#e5e7eb',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '6px'
              }}
              data-testid="button-welcome-back"
            >
              {currentStep > 0 ? 'Back' : 'Skip'}
            </button>

            <button
              onClick={isLastStep ? onClose : () => setCurrentStep(currentStep + 1)}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              data-testid="button-welcome-next"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}