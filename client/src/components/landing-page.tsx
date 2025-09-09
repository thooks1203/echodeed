import { useState } from 'react';
import { useLocation } from 'wouter';
import { ElectricHeart } from './ElectricHeart';

export function LandingPage() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate('/app?tab=schools');
  };

  const handleTeacherLogin = () => {
    navigate('/teacher-dashboard');
  };

  const handleAdminLogin = () => {
    navigate('/admin-dashboard');
  };

  const handleParentLogin = () => {
    navigate('/parent-dashboard');
  };

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
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          gap: '16px'
        }}>
          <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700',
            margin: '0',
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            EchoDeed™
          </h1>
        </div>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          Character Education for K-8 Schools
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#9ca3af',
          margin: 0,
          fontStyle: 'italic'
        }}>
          Anonymous kindness platform designed for classroom character development and social-emotional learning
        </p>
      </div>

      {/* School Role Selection */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          🏫 Choose Your Role
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleTeacherLogin}
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#7C3AED';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#8B5CF6';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>👩‍🏫</span>
            Teacher Dashboard
          </button>

          <button 
            onClick={handleAdminLogin}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>👨‍💼</span>
            Administrator Dashboard
          </button>

          <button 
            onClick={handleParentLogin}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>👨‍👩‍👧‍👦</span>
            Parent Dashboard
          </button>

          <button 
            onClick={handleGetStarted}
            style={{
              backgroundColor: 'white',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = '#8B5CF6';
              (e.target as HTMLButtonElement).style.color = '#8B5CF6';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = '#e5e7eb';
              (e.target as HTMLButtonElement).style.color = '#6b7280';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>🏠</span>
            Student Feed
          </button>
        </div>
      </div>

      {/* School Features Preview */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          ✨ K-8 Character Education Features
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '📚', title: 'Curriculum Integration', desc: 'Aligned with SEL standards for K-8 character education' },
            { icon: '👩‍🏫', title: 'Teacher Tools', desc: 'Classroom management and student progress tracking' },
            { icon: '🏅', title: 'Student Achievements', desc: 'Badge system and kindness point rewards' },
            { icon: '👨‍👩‍👧‍👦', title: 'Parent Communication', desc: 'Weekly reports and progress updates' },
            { icon: '📊', title: 'School Analytics', desc: 'District-wide character development insights' },
            { icon: '🔒', title: 'Anonymous & Safe', desc: 'FERPA/COPPA compliant with privacy protection' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>{feature.icon}</span>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  color: '#1f2937'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  margin: 0
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          Trusted by K-8 schools nationwide
        </p>
        <p style={{ margin: 0 }}>
          FERPA & COPPA Compliant • Anonymous & Safe
        </p>
      </div>
    </div>
  );
}