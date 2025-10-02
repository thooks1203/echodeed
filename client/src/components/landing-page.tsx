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
    // Set up demo student authentication first
    localStorage.setItem('echodeed_demo_role', 'student');
    navigate('/app?tab=feed');
  };

  const handleTeacherLogin = () => {
    // Set teacher role in localStorage for demo purposes
    localStorage.setItem('echodeed_demo_role', 'teacher');
    localStorage.setItem('echodeed_session', 'demo-session');
    navigate('/app?tab=teacher-dashboard');
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
            Where middle and high school students (grades 6-12) discover the power of anonymous kindness
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

      {/* Demo Login - Beautiful Role Selection */}
      <div id="roles" style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px 24px',
        marginBottom: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
          }}>
            ❤️
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            margin: 0
          }}>
            🎓 Demo Mode - One-click login for testing
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Register Your School - Orange/Amber */}
          <button 
            onClick={handleSchoolRegistration}
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '18px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#D97706';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#F59E0B';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.3)';
            }}
            data-testid="button-register-school"
          >
            <span style={{ fontSize: '20px' }}>🏫</span>
            Register Your School
          </button>

          {/* Student Sign Up - Cyan/Teal */}
          <button 
            onClick={handleStudentSignup}
            style={{
              backgroundColor: '#06B6D4',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '18px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#0891B2';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#06B6D4';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(6, 182, 212, 0.3)';
            }}
            data-testid="button-student-signup"
          >
            <span style={{ fontSize: '20px' }}>✍️</span>
            Student Sign Up
          </button>

          {/* Beautiful Demo Login Buttons */}
          <button 
            onClick={() => {
              localStorage.setItem('echodeed_demo_role', 'student');
              localStorage.setItem('echodeed_session', 'demo-session');
              navigate('/app');
            }}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '20px 24px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
            }}
            data-testid="button-demo-student"
          >
            <span style={{ fontSize: '22px' }}>🎓</span>
            Try as Student (Mary Jones)
          </button>

          <button 
            onClick={() => {
              localStorage.setItem('echodeed_demo_role', 'teacher');
              localStorage.setItem('echodeed_session', 'demo-session');
              navigate('/teacher-dashboard');
            }}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '20px 24px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
            }}
            data-testid="button-demo-teacher"
          >
            <span style={{ fontSize: '22px' }}>👩‍🏫</span>
            Try as Teacher (Ms. Woods)
          </button>

          <button 
            onClick={() => {
              localStorage.setItem('echodeed_demo_role', 'admin');
              localStorage.setItem('echodeed_session', 'demo-session');
              navigate('/admin-dashboard');
            }}
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '20px 24px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#7C3AED';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#8B5CF6';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)';
            }}
            data-testid="button-demo-admin"
          >
            <span style={{ fontSize: '22px' }}>🛡️</span>
            Try as Principal (Dr. Quinton Alston)
          </button>

          <button 
            onClick={() => {
              localStorage.setItem('echodeed_demo_role', 'parent');
              localStorage.setItem('echodeed_session', 'demo-session');
              navigate('/parent-dashboard');
            }}
            style={{
              backgroundColor: '#EC4899',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '20px 24px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
              lineHeight: 1.3
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#DB2777';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.5)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#EC4899';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(236, 72, 153, 0.4)';
            }}
            data-testid="button-demo-parent"
          >
            <span style={{ fontSize: '22px' }}>❤️</span>
            Try as Parent (Keisha Jones)
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
          ✨ 6-12 Character Education Features
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '📚', title: 'Curriculum Integration', desc: 'Aligned with SEL standards for 6-12 character education' },
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