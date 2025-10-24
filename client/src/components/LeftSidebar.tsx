import { useAuth } from "@/hooks/useAuth";
import { canAccessSchoolsDashboard } from "@/lib/roleUtils";
import { featureFlags } from "@shared/featureFlags";

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LeftSidebar({ activeTab, onTabChange }: LeftSidebarProps) {
  const { user } = useAuth();
  
  const baseTabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
  ];

  const allStudentTabs = [
    { id: 'mentor-dashboard', label: 'Mentor', icon: '🌟' },
    { id: 'student-dashboard', label: 'Dashboard', icon: '👨‍🎓' },
    { id: 'summer', label: 'Summer', icon: '🏖️' },
    { id: 'community-service', label: 'Service', icon: '🏥' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];

  const studentTabs = allStudentTabs.filter(tab => {
    if (tab.id === 'summer') {
      return featureFlags.summerChallenges;
    }
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  const allTeacherTabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: '👩‍🏫' },
    { id: 'community-service', label: 'Service', icon: '🏥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  const teacherTabs = allTeacherTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  const allParentTabs = [
    { id: 'parent-dashboard', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
    { id: 'family-dashboard', label: 'Family', icon: '🎯' },
    { id: 'community-service', label: 'Service', icon: '🏥' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  const parentTabs = allParentTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  if (!user) {
    const signInTabs = [{ id: 'sign-in', label: 'Sign In', icon: '👤' }];
    return (
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '80px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        gap: '12px',
        zIndex: 100
      }}>
        <button 
          key="sign-in"
          onClick={() => onTabChange('sign-in')}
          style={{
            background: activeTab === 'sign-in' 
              ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
              : 'rgba(255,255,255,0.2)',
            border: activeTab === 'sign-in' ? '2px solid #fff' : '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '12px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            width: '64px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255,107,107,0.4)'
          }}
          data-testid="button-nav-sign-in"
        >
          <span style={{ fontSize: '20px' }}>👤</span>
          <span style={{ fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>Sign In</span>
        </button>
      </div>
    );
  }

  let tabs;
  if (user?.schoolRole === 'parent') {
    tabs = parentTabs;
  } else if (canAccessSchoolsDashboard(user?.schoolRole || 'student')) {
    tabs = teacherTabs;
  } else {
    tabs = [...baseTabs, ...studentTabs];
  }

  const filteredTabs = tabs;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '80px',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      gap: '12px',
      zIndex: 100,
      overflowY: 'auto'
    }}>
      {filteredTabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: activeTab === tab.id 
              ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
              : 'rgba(255,255,255,0.2)',
            border: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '12px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.2)',
            width: '64px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === tab.id 
              ? '0 4px 12px rgba(255,107,107,0.4)' 
              : '0 2px 4px rgba(0,0,0,0.1)'
          }}
          data-testid={`button-nav-${tab.id}`}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.3)';
              (e.target as HTMLElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }
          }}
        >
          <span style={{ 
            fontSize: '24px',
            filter: activeTab === tab.id ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.3px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
            textAlign: 'center'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
