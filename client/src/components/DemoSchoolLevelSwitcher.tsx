import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { School, GraduationCap } from 'lucide-react';

const DEMO_SCHOOL_LEVEL_KEY = 'demo_school_level_override';

export function DemoSchoolLevelSwitcher() {
  const [demoLevel, setDemoLevel] = useState<'middle_school' | 'high_school'>(() => {
    if (typeof window === 'undefined') return 'high_school';
    return (localStorage.getItem(DEMO_SCHOOL_LEVEL_KEY) as 'middle_school' | 'high_school') || 'high_school';
  });

  const toggleSchoolLevel = () => {
    const newLevel = demoLevel === 'middle_school' ? 'high_school' : 'middle_school';
    setDemoLevel(newLevel);
    localStorage.setItem(DEMO_SCHOOL_LEVEL_KEY, newLevel);
    
    // Trigger page reload to apply new configuration
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white'
    }}>
      <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>
        🎭 DEMO MODE
      </div>
      <Button
        onClick={toggleSchoolLevel}
        size="sm"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        data-testid="button-toggle-demo-school-level"
      >
        {demoLevel === 'middle_school' ? (
          <>
            <School className="w-4 h-4" />
            Switch to High School
          </>
        ) : (
          <>
            <GraduationCap className="w-4 h-4" />
            Switch to Middle School
          </>
        )}
      </Button>
    </div>
  );
}

// Hook to get demo school level override
export function useDemoSchoolLevel(): 'middle_school' | 'high_school' | null {
  const [demoLevel, setDemoLevel] = useState<'middle_school' | 'high_school' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_SCHOOL_LEVEL_KEY);
      setDemoLevel(stored as 'middle_school' | 'high_school' | null);
    }
  }, []);

  return demoLevel;
}
