import { useAuth } from "@/hooks/useAuth";
import { canAccessSchoolsDashboard } from "@/lib/roleUtils";
import { featureFlags } from "@shared/featureFlags";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { user } = useAuth();
  
  // Different tabs for students vs teachers/admins
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

  // Filter out summer and support tabs based on feature flags
  const studentTabs = allStudentTabs.filter(tab => {
    if (tab.id === 'summer') {
      return featureFlags.summerChallenges;
    }
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  // FIXED: Teacher tabs now include Feed + Reports moved from top + Rewards + Service (VIEW ONLY)
  const allTeacherTabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: '👩‍🏫' },
    { id: 'community-service', label: 'Service', icon: '🏥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  // Filter out support tab if disabled
  const teacherTabs = allTeacherTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  // Parent tabs for family engagement (includes Service to VIEW volunteer opportunities)
  const allParentTabs = [
    { id: 'parent-dashboard', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
    { id: 'family-dashboard', label: 'Family', icon: '🎯' },
    { id: 'community-service', label: 'Service', icon: '🏥' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  // Filter out support tab if disabled
  const parentTabs = allParentTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  // If not authenticated, only show sign-in tab
  if (!user) {
    const signInTabs = [{ id: 'sign-in', label: 'Sign In', icon: '👤' }];
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '430px',
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'center',
        padding: '4px 6px',
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
            gap: '3px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            minWidth: '80px',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255,107,107,0.4)'
          }}
          data-testid="button-nav-sign-in"
        >
          <span style={{ fontSize: '16px' }}>👤</span>
          <span style={{ fontSize: '11px', fontWeight: '600' }}>Sign In</span>
        </button>
      </div>
    );
  }

  // Role-based tab selection - Only show relevant tabs for each role
  let tabs;
  if (user?.schoolRole === 'parent') {
    tabs = parentTabs; // Parents get only Parent + Family + Support + Rewards
  } else if (canAccessSchoolsDashboard(user?.schoolRole || 'student')) {
    tabs = teacherTabs; // Teachers get their dedicated tabs including Feed
  } else {
    tabs = [...baseTabs, ...studentTabs]; // Students get Feed + Student tabs
  }

  // Keep all tabs for role switching (educational demo platform)
  const filteredTabs = tabs;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '430px',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 8px 10px 8px',
      zIndex: 100
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
            gap: '4px',
            cursor: 'pointer',
            padding: '6px 4px 8px 4px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: activeTab === tab.id ? '#fff' : '#fff',
            textShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.2)',
            flex: '1',
            minWidth: '0',
            transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === tab.id 
              ? '0 4px 12px rgba(255,107,107,0.4)' 
              : '0 2px 4px rgba(0,0,0,0.1)'
          }}
          data-testid={`button-nav-${tab.id}`}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.3)';
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ 
            fontSize: '16px',
            filter: activeTab === tab.id ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.2px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
