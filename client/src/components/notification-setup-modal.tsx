import { useState, useEffect } from 'react';
import { pushNotifications } from '../services/pushNotifications';

interface NotificationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSetupModal({ isOpen, onClose }: NotificationSetupModalProps) {
  const [step, setStep] = useState(1);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState({
    wellness_alerts: true,
    kindness_reminders: true,
    achievements: true,
    team_challenges: true,
    prescriptions: true,
    feed_updates: false,
    quiet_hours: { start: '22:00', end: '07:00' }
  });

  useEffect(() => {
    if (isOpen) {
      setPermission(Notification.permission);
      const stored = pushNotifications.getNotificationPreferences();
      setPreferences(stored);
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const granted = await pushNotifications.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      setStep(2);
    }
  };

  const handleSavePreferences = () => {
    pushNotifications.enableSmartNotifications(preferences);
    
    // Mark setup as seen
    localStorage.setItem('echodeed_notification_setup_seen', 'true');
    
    // Send a test notification
    pushNotifications.sendNotification({
      title: '🎉 Notifications Enabled!',
      body: 'You\'ll now receive wellness alerts and kindness reminders from EchoDeed™',
      tag: 'welcome',
      data: { type: 'wellness_alert' }
    });
    
    // Set up daily reminders
    pushNotifications.scheduleDailyReminders({
      morning: '09:00',
      afternoon: '14:00',
      evening: '18:00'
    });
    
    onClose();
  };

  const handleSkip = () => {
    // Mark setup as seen even if skipped
    localStorage.setItem('echodeed_notification_setup_seen', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {step === 1 && (
          <>
            {/* Permission Request Step */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Enable Smart Notifications
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Get real-time wellness alerts and kindness reminders
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📱 What you'll receive:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '🚨', title: 'Wellness Alerts', desc: 'AI predictions when you need support' },
                  { icon: '💜', title: 'Kindness Reminders', desc: 'Daily prompts to spread joy' },
                  { icon: '🏆', title: 'Achievements', desc: 'Celebrate your progress' },
                  { icon: '💊', title: 'Prescriptions', desc: 'Personalized wellness activities' }
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {permission === 'granted' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#10B981', 
                  color: 'white', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  ✅ Notifications already enabled!
                </div>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Customize Settings
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleRequestPermission}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Enable Notifications 🚀
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Maybe Later
                </button>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            {/* Preferences Customization Step */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                color: '#1f2937'
              }}>
                Customize Your Notifications
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Choose what matters most to you
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {[
                { key: 'wellness_alerts', icon: '🚨', title: 'Wellness Alerts', desc: 'AI-powered mental health support' },
                { key: 'kindness_reminders', icon: '💜', title: 'Kindness Reminders', desc: 'Daily prompts to spread joy' },
                { key: 'achievements', icon: '🏆', title: 'Achievement Badges', desc: 'Celebrate your progress' },
                { key: 'team_challenges', icon: '🤝', title: 'Team Challenges', desc: 'New group activities' },
                { key: 'prescriptions', icon: '💊', title: 'Kindness Prescriptions', desc: 'Personalized wellness plans' },
                { key: 'feed_updates', icon: '📱', title: 'Feed Updates', desc: 'New posts and trends (less frequent)' }
              ].map((item) => (
                <div key={item.key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</div>
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={preferences[item.key as keyof typeof preferences] as boolean}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: preferences[item.key as keyof typeof preferences] ? '#8B5CF6' : '#cbd5e0',
                      borderRadius: '24px',
                      transition: 'all 0.2s ease'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: preferences[item.key as keyof typeof preferences] ? '23px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleSavePreferences}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Save & Enable Notifications ✨
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}