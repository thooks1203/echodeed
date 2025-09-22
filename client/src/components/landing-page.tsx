import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ElectricHeart } from './ElectricHeart';

export function LandingPage() {
  const [, navigate] = useLocation();
  const [showFullContent, setShowFullContent] = useState(false);

  // Check URL parameters to determine if we should show full content
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show') === 'roles' || urlParams.get('show') === 'content') {
      setShowFullContent(true);
      // Scroll to roles section after content loads
      if (urlParams.get('show') === 'roles') {
        setTimeout(() => {
          const rolesElement = document.getElementById('roles');
          if (rolesElement) {
            rolesElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, []);

  const handleGetStarted = () => {
    navigate('/app?tab=feed');
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

  const handleMentorLogin = () => {
    navigate('/mentor-dashboard');
  };

  const handleFamilyLogin = () => {
    navigate('/family-dashboard');
  };

  const handleSchoolRegistration = () => {
    navigate('/school-register');
  };

  const handleStudentSignup = () => {
    navigate('/student-signup');
  };

  const handleReveal = () => {
    setShowFullContent(true);
  };

  if (!showFullContent) {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        {/* Hero Section */}
        <div style={{ marginBottom: '60px', animation: 'fadeInUp 1s ease-out' }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '800',
            margin: '0 0 24px 0',
            lineHeight: '1.2',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            What if every act of kindness could change the world?
          </h1>
          <p style={{ 
            fontSize: '20px', 
            opacity: '0.9',
            margin: '0 0 40px 0',
            lineHeight: '1.6'
          }}>
            Imagine a place where anonymous kindness spreads like wildfire...
          </p>
          <p style={{ 
            fontSize: '18px', 
            opacity: '0.8',
            margin: '0 0 50px 0',
            fontStyle: 'italic'
          }}>
            Where every good deed creates ripples of compassion that reach far beyond what you can see...
          </p>
        </div>

        {/* Emotional Hook */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '20px', 
          padding: '32px', 
          marginBottom: '50px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            margin: '0 0 20px 0',
            color: '#FFE4B5'
          }}>
            ✨ The Secret is About to Be Revealed ✨
          </p>
          <p style={{ 
            fontSize: '16px', 
            opacity: '0.9',
            margin: 0,
            lineHeight: '1.5'
          }}>
            A revolutionary platform that transforms how children learn empathy, kindness, and character... 
            <br/><br/>
            Are you ready to discover something amazing?
          </p>
        </div>

        {/* Call to Action */}
        <button 
          onClick={handleReveal}
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '20px 40px',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(255,107,107,0.4)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.05)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(255,107,107,0.6)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(255,107,107,0.4)';
          }}
        >
          🚀 Discover EchoDeed™
        </button>

        <p style={{ 
          fontSize: '14px', 
          opacity: '0.7',
          margin: '30px 0 0 0',
          fontStyle: 'italic'
        }}>
          Something extraordinary is waiting inside...
        </p>
      </div>
    );
  }

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
      {/* Dramatic Reveal */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        animation: 'fadeInUp 1.5s ease-out'
      }}>
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
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 8px 25px rgba(102,126,234,0.3)'
        }}>
          <p style={{ 
            fontSize: '22px', 
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            🎉 Welcome to the Future of Character Education! 🎉
          </p>
          <p style={{ 
            fontSize: '16px', 
            margin: 0,
            opacity: '0.95'
          }}>
            Where middle school students (grades 6-8) discover the power of anonymous kindness
          </p>
        </div>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          Revolutionary Anonymous Kindness Platform
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#9ca3af',
          margin: 0,
          fontStyle: 'italic'
        }}>
          Real rewards • Real impact • Real character development
        </p>
      </div>

      {/* School Role Selection */}
      <div id="roles" style={{
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
          {/* 1. SCHOOL SETUP PHASE - Start Here - UPDATED */}
          <button 
            onClick={handleSchoolRegistration}
            style={{
              backgroundColor: '#F59E0B',
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
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              lineHeight: 1
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#D97706';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#F59E0B';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>🏫</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>1. Register Your School</span>
          </button>

          {/* 2. ADMIN CONFIGURATION */}
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
              transition: 'all 0.2s ease',
              lineHeight: 1
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
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>👨‍💼</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>2. Administrator Dashboard</span>
          </button>

          {/* 3. TEACHER PREPARATION */}
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
              transition: 'all 0.2s ease',
              lineHeight: 1
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
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>👩‍🏫</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>3. Teacher Dashboard</span>
          </button>

          {/* 4. STUDENT REGISTRATION (TRIGGERS PARENT CONSENT) */}
          <button 
            onClick={handleStudentSignup}
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
              transition: 'all 0.2s ease',
              lineHeight: 1
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
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>🎓</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>4. Student Sign Up</span>
          </button>

          {/* 5. PARENT CONSENT VERIFICATION */}
          <button 
            onClick={handleParentLogin}
            style={{
              backgroundColor: '#EC4899',
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
              transition: 'all 0.2s ease',
              lineHeight: 1
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#DB2777';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#EC4899';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>👨‍👩‍👧‍👦</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>5. Parent Dashboard</span>
          </button>

          {/* 6. STUDENT PARTICIPATION (ONLY AFTER CONSENT) */}
          <button 
            onClick={handleGetStarted}
            style={{
              backgroundColor: '#DC2626',
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
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              lineHeight: 1
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#B91C1C';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#DC2626';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: '1', width: '1.25em', height: '1.25em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji' }}>🏠</span>
            <span style={{ lineHeight: 1.2, display: 'inline-block' }}>6. Student Feed</span>
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
          ✨ 6-8 Character Education Features
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '📚', title: 'Curriculum Integration', desc: 'Aligned with SEL standards for 6-8 character education' },
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
          Trusted by middle schools nationwide
        </p>
        <p style={{ margin: 0 }}>
          FERPA & COPPA Compliant • Anonymous & Safe
        </p>
      </div>
    </div>
  );
}