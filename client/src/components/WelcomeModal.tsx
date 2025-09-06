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
      subtitle: "Your Kindness, Amplified",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💜</div>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            The AI-Powered Corporate Wellness Platform that transforms workplace culture through kindness.
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <p style={{ fontSize: '14px', color: '#8B5CF6', fontWeight: '600', margin: 0 }}>
              ✨ Turn every act of kindness into measurable business outcomes
            </p>
          </div>
        </div>
      )
    },
    {
      title: "🧠 AI-Powered Insights",
      subtitle: "Predictive Wellness Analytics",
      content: (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🔮', title: 'Predictive Analytics', desc: '87% accuracy in predicting employee wellness decline' },
              { icon: '📊', title: 'Real-Time Insights', desc: 'Live sentiment analysis and wellness scoring' },
              { icon: '🎯', title: 'Smart Alerts', desc: 'AI recommendations for team interventions' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(59,130,246,0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(59,130,246,0.1)'
              }}>
                <span style={{ fontSize: '24px' }}>{feature.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{feature.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "🎯 How It Works",
      subtitle: "Simple. Powerful. Measurable.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { step: '1', icon: '📝', title: 'Share Kindness', desc: 'Post anonymous acts of kindness that happen in your workplace' },
            { step: '2', icon: '🧠', title: 'AI Analysis', desc: 'Our AI analyzes sentiment and predicts wellness trends' },
            { step: '3', icon: '💎', title: 'Earn Rewards', desc: 'Get $ECHO tokens to redeem for real-world partner rewards' },
            { step: '4', icon: '📈', title: 'Track Impact', desc: 'Watch your company culture transform with measurable results' }
          ].map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {step.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{step.icon}</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{step.title}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
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