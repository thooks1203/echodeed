import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface KindnessNudge {
  id: string;
  message: string;
  emoji: string;
  category: string;
  urgency: 'gentle' | 'encouraging' | 'inspiring';
  contextType: 'time' | 'weather' | 'location' | 'activity' | 'social';
  actionSuggestion?: string;
  timestamp: Date;
  duration: number; // how long to show in ms
}

interface NudgeSettings {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high'; // every 45min | 30min | 20min
  categories: string[];
  quietHours: { start: string; end: string };
  showOnlyWhenActive: boolean;
}

export function KindnessNudgeSystem() {
  const [currentNudge, setCurrentNudge] = useState<KindnessNudge | null>(null);
  const [nudgeSettings, setNudgeSettings] = useState<NudgeSettings>({
    enabled: true,
    frequency: 'medium',
    categories: ['helping', 'sharing', 'caring', 'environmental', 'social'],
    quietHours: { start: '22:00', end: '08:00' },
    showOnlyWhenActive: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [userActivity, setUserActivity] = useState({
    lastAction: Date.now(),
    isActive: true,
    currentPage: 'feed'
  });

  const nudgeTimeoutRef = useRef<NodeJS.Timeout>();
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setUserActivity(prev => ({
        ...prev,
        lastAction: Date.now(),
        isActive: true
      }));

      // Clear existing timeout and set new one
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      // Mark as inactive after 2 minutes of no activity
      activityTimeoutRef.current = setTimeout(() => {
        setUserActivity(prev => ({ ...prev, isActive: false }));
      }, 2 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, []);

  // Fetch contextual nudge suggestions
  const { data: nudgeSuggestions = [] } = useQuery<KindnessNudge[]>({
    queryKey: ['/api/ai/kindness-nudges', nudgeSettings.categories, userActivity.currentPage],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Generate new nudge mutation
  const generateNudgeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/generate-nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userActivity: userActivity.currentPage,
          timeOfDay: new Date().getHours(),
          lastNudgeTime: currentNudge?.timestamp || 0,
          preferences: nudgeSettings.categories
        })
      });
      return response.json();
    },
    onSuccess: (newNudge) => {
      setCurrentNudge(newNudge);
    }
  });

  // Check if we're in quiet hours
  const isInQuietHours = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const start = parseInt(nudgeSettings.quietHours.start.replace(':', ''));
    const end = parseInt(nudgeSettings.quietHours.end.replace(':', ''));
    
    if (start > end) {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
    return currentTime >= start && currentTime <= end;
  };

  // Smart nudge timing system
  useEffect(() => {
    if (!nudgeSettings.enabled || isInQuietHours()) return;
    if (nudgeSettings.showOnlyWhenActive && !userActivity.isActive) return;

    const intervals = {
      low: 45 * 60 * 1000,    // 45 minutes
      medium: 30 * 60 * 1000, // 30 minutes  
      high: 20 * 60 * 1000    // 20 minutes
    };

    const scheduleNextNudge = () => {
      const interval = intervals[nudgeSettings.frequency];
      const randomDelay = Math.random() * 5 * 60 * 1000; // Random 0-5 min delay
      
      nudgeTimeoutRef.current = setTimeout(() => {
        if (nudgeSuggestions.length > 0) {
          // Use existing suggestion
          const randomNudge = nudgeSuggestions[Math.floor(Math.random() * nudgeSuggestions.length)];
          setCurrentNudge(randomNudge);
        } else {
          // Generate new suggestion
          generateNudgeMutation.mutate();
        }
        scheduleNextNudge(); // Schedule the next one
      }, interval + randomDelay);
    };

    scheduleNextNudge();

    return () => {
      if (nudgeTimeoutRef.current) {
        clearTimeout(nudgeTimeoutRef.current);
      }
    };
  }, [nudgeSettings, userActivity.isActive, nudgeSuggestions]);

  // Auto-hide nudge after duration
  useEffect(() => {
    if (!currentNudge) return;

    const hideTimeout = setTimeout(() => {
      setCurrentNudge(null);
    }, currentNudge.duration || 8000);

    return () => clearTimeout(hideTimeout);
  }, [currentNudge]);

  // Dismiss nudge
  const dismissNudge = () => {
    setCurrentNudge(null);
  };

  // Take suggested action
  const takeAction = () => {
    // Navigate to post creation or specific action
    if (currentNudge?.actionSuggestion) {
      // Could dispatch navigation or trigger specific actions
      console.log('Taking action:', currentNudge.actionSuggestion);
    }
    dismissNudge();
  };

  if (!currentNudge) {
    return (
      <>
        {/* Floating Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(139,92,246,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.3)';
          }}
          data-testid="button-nudge-settings"
        >
          🔔
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            position: 'fixed',
            bottom: '160px',
            right: '20px',
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 1001,
            minWidth: '280px',
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '16px', 
              fontWeight: '700',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔔 Kindness Nudges
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6B7280',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={nudgeSettings.enabled}
                  onChange={(e) => setNudgeSettings(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  style={{ marginRight: '4px' }}
                />
                Enable gentle reminders
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                Frequency
              </label>
              <select
                value={nudgeSettings.frequency}
                onChange={(e) => setNudgeSettings(prev => ({
                  ...prev,
                  frequency: e.target.value as any
                }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px'
                }}
              >
                <option value="low">Gentle (every 45 min)</option>
                <option value="medium">Regular (every 30 min)</option>
                <option value="high">Active (every 20 min)</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6B7280',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={nudgeSettings.showOnlyWhenActive}
                  onChange={(e) => setNudgeSettings(prev => ({
                    ...prev,
                    showOnlyWhenActive: e.target.checked
                  }))}
                  style={{ marginRight: '4px' }}
                />
                Only when I'm actively using the app
              </label>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.95) 0%, rgba(6,182,212,0.95) 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '16px 24px',
        boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
        zIndex: 1000,
        maxWidth: '350px',
        minWidth: '280px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        animation: 'slideInFromTop 0.5s ease-out'
      }}
      data-testid="nudge-notification"
    >
      {/* Nudge Content */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '12px',
        marginBottom: '12px'
      }}>
        <span style={{ 
          fontSize: '24px', 
          flexShrink: 0,
          animation: 'gentle-bounce 2s ease-in-out infinite'
        }}>
          {currentNudge.emoji}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600',
            marginBottom: '4px',
            lineHeight: '1.3'
          }}>
            {currentNudge.message}
          </div>
          {currentNudge.actionSuggestion && (
            <div style={{ 
              fontSize: '13px', 
              opacity: 0.9,
              fontStyle: 'italic'
            }}>
              💡 {currentNudge.actionSuggestion}
            </div>
          )}
        </div>
        <button
          onClick={dismissNudge}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
          data-testid="button-dismiss-nudge"
        >
          ×
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={dismissNudge}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
          data-testid="button-maybe-later"
        >
          Maybe Later
        </button>
        <button
          onClick={takeAction}
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '12px',
            color: '#8B5CF6',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          data-testid="button-take-action"
        >
          ✨ Let's Do It!
        </button>
      </div>

      {/* Progress bar showing time remaining */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '2px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '0 0 20px 20px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.8)',
          animation: `shrink ${(currentNudge.duration || 8000) / 1000}s linear`
        }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInFromTop {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.1); }
        }
        
        @keyframes shrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}} />
    </div>
  );
}