interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'local', label: 'Local', icon: '📍' },
    { id: 'ai', label: 'AI', icon: '🧠' },
    { id: 'badges', label: 'Badges', icon: '🏅' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'corporate', label: 'Corporate', icon: '🏢' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '430px',
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0',
      zIndex: 100
    }}>
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '500',
            color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
            backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
          }}
          data-testid={`button-nav-${tab.id}`}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
