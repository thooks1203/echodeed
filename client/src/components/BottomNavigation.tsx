import { Home, MapPin, TrendingUp, Info, Gift } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'feed', label: 'Kindness', icon: Home },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'spacer', label: '', icon: null }, // Spacer for FAB
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'about', label: 'Discover', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-20">
      <div className="mobile-container">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} className="w-8" />; // Spacer for FAB
            }

            const Icon = tab.icon!;
            const isActive = activeTab === tab.id;

            return (
              <button 
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`button-nav-${tab.id}`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
