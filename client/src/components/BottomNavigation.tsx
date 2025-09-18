interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'schools', label: 'Schools', icon: '🎓' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'summer', label: 'Summer', icon: '☀️' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
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
      justifyContent: 'space-between',
      padding: '6px 8px',
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
            gap: '2px',
            cursor: 'pointer',
            padding: '4px 2px',
            borderRadius: '6px',
            fontSize: '8px',
            fontWeight: '500',
            color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
            backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
            flex: '1',
            minWidth: '0'
          }}
          data-testid={`button-nav-${tab.id}`}
        >
          <span style={{ fontSize: '14px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
