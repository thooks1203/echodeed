import { useAuth } from "@/hooks/useAuth";
import { canAccessSchoolsDashboard } from "@/lib/roleUtils";

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

  const studentTabs = [
    { id: 'student-dashboard', label: 'Dashboard', icon: '👨‍🎓' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];

  const adminTabs = [
    { id: 'schools', label: 'Schools', icon: '🏫' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];

  const tabs = canAccessSchoolsDashboard(user?.schoolRole || 'student') 
    ? [...baseTabs, ...adminTabs]
    : [...baseTabs, ...studentTabs];

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
      justifyContent: 'space-between',
      padding: '4px 6px',
      zIndex: 100
    }}>
      {tabs.map((tab) => (
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
            gap: '3px',
            cursor: 'pointer',
            padding: '4px 3px',
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
            fontSize: '11px',
            letterSpacing: '0.2px',
            fontWeight: '600'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
