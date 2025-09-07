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
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '200px',
            height: '200px',
            margin: '0 auto 20px auto'
          }}>
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-gradient4' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-gradient4)' filter='drop-shadow(0 0 10px rgba(255,102,51,0.6))'/%3E%3Cg transform='translate(100,100)'%3E%3Cpath d='M0,0 Q-50,-30 -80,0 Q-50,30 0,0 Q50,30 80,0 Q50,-30 0,0' fill='none' stroke='url(%23heart-gradient4)' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M0,0 Q-60,-40 -100,0 Q-60,40 0,0 Q60,40 100,0 Q60,-40 0,0' fill='none' stroke='url(%23heart-gradient4)' stroke-width='1' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'drop-shadow(0 0 15px rgba(255,102,51,0.4)) drop-shadow(0 0 30px rgba(255,51,255,0.2))'
              }}
            />
          </div>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            Share anonymous acts of kindness and be part of a global community spreading positivity, one kind act at a time.
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.1))',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(139,92,246,0.2)',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '16px', color: '#8B5CF6', fontWeight: '600', margin: 0 }}>
              ✨ Every act of kindness creates ripples of positivity
            </p>
          </div>
          <div style={{ fontSize: '24px', color: '#10B981', fontWeight: '700' }}>
            243,876 acts of kindness shared so far!
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
            { step: '1', icon: '📝', title: 'Share Your Story', desc: 'Post about a kind act you did or witnessed - completely anonymous' },
            { step: '2', icon: '⚡', title: 'Inspire Others', desc: 'Your story joins a global feed of kindness that motivates others' },
            { step: '3', icon: '🪙', title: 'Earn ECHO Tokens', desc: 'Get rewarded with tokens you can redeem for real gifts' },
            { step: '4', icon: '🌍', title: 'Make an Impact', desc: 'Watch the kindness counter grow as we build a more positive world' }
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
      subtitle: "Join the Global Kindness Movement",
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌟</div>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            You're now part of a growing community of people making the world a little brighter through small acts of kindness.
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
              🏠 Browse the global kindness feed
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#8B5CF6' }}>
              📍 Discover local acts of kindness
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#F59E0B' }}>
              🏅 Earn badges and track your impact
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