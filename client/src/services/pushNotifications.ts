// Push Notification Service for EchoDeed™
// Delivers real-time wellness alerts, kindness reminders, and achievement notifications

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: {
    type: 'wellness_alert' | 'kindness_reminder' | 'achievement' | 'team_challenge' | 'prescription' | 'feed_update';
    url?: string;
    actionRequired?: boolean;
  };
}

export class PushNotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Send immediate browser notification
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled or supported');
      return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/icon-monochrome.png',
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        data: payload.data
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        notification.close();
        
        if (payload.data?.url) {
          window.open(payload.data.url, '_blank');
        } else {
          window.focus();
        }
      };

      // Auto-close after 10 seconds unless interaction required
      if (!payload.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Wellness Alert Notifications
   */
  async sendWellnessAlert(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    employee?: string;
    team?: string;
  }): Promise<void> {
    const severityEmojis = {
      low: '💙',
      medium: '💛', 
      high: '🧡',
      critical: '🚨'
    };

    const severityTitles = {
      low: 'Wellness Update',
      medium: 'Wellness Check Needed',
      high: 'Wellness Alert',
      critical: 'Urgent Wellness Alert'
    };

    await this.sendNotification({
      title: `${severityEmojis[alert.severity]} ${severityTitles[alert.severity]}`,
      body: alert.message,
      icon: '/icons/wellness-alert.png',
      tag: 'wellness-alert',
      requireInteraction: alert.severity === 'critical',
      actions: [
        { action: 'view', title: 'View Dashboard', icon: '/icons/dashboard.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
      ],
      data: {
        type: 'wellness_alert',
        url: '/ai-insights',
        actionRequired: alert.severity === 'high' || alert.severity === 'critical'
      }
    });
  }

  /**
   * Daily Kindness Reminder Notifications
   */
  async sendKindnessReminder(prescription?: {
    action: string;
    impact: number;
    timeframe: string;
  }): Promise<void> {
    const reminders = [
      "Time to spread some kindness! 💜",
      "Your daily dose of kindness awaits! ✨", 
      "Someone could use your kindness today! 🌟",
      "Ready to make someone's day brighter? 😊",
      "Your kindness has the power to change lives! 🦋"
    ];

    const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
    
    const body = prescription 
      ? `${randomReminder}\n💡 Try: ${prescription.action} (${prescription.impact}% impact)`
      : randomReminder;

    await this.sendNotification({
      title: '💜 EchoDeed™ Kindness Reminder',
      body,
      icon: '/icons/kindness-reminder.png',
      tag: 'daily-kindness',
      actions: [
        { action: 'share', title: 'Share Kindness', icon: '/icons/share.png' },
        { action: 'snooze', title: 'Remind Later', icon: '/icons/snooze.png' }
      ],
      data: {
        type: 'kindness_reminder',
        url: '/share-kindness'
      }
    });
  }

  /**
   * Achievement Unlock Notifications
   */
  async sendAchievementNotification(achievement: {
    title: string;
    description: string;
    badge: string;
    echoReward: number;
    tier: string;
  }): Promise<void> {
    const tierEmojis = {
      bronze: '🥉',
      silver: '🥈', 
      gold: '🥇',
      diamond: '💎',
      legendary: '👑'
    };

    await this.sendNotification({
      title: `🎉 Achievement Unlocked: ${achievement.title}`,
      body: `${achievement.description}\n🪙 +${achievement.echoReward} $ECHO earned!`,
      icon: '/icons/achievement.png',
      tag: 'achievement',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Badge', icon: '/icons/badge.png' },
        { action: 'share', title: 'Share Success', icon: '/icons/share.png' }
      ],
      data: {
        type: 'achievement',
        url: '/badges'
      }
    });
  }

  /**
   * Team Challenge Notifications
   */
  async sendTeamChallengeNotification(challenge: {
    title: string;
    description: string;
    reward: number;
    expiresIn: string;
    teamName?: string;
  }): Promise<void> {
    const title = challenge.teamName 
      ? `🏆 ${challenge.teamName} Team Challenge` 
      : '🏆 New Team Challenge Available';

    await this.sendNotification({
      title,
      body: `${challenge.title}\n💰 ${challenge.reward} $ECHO reward • Expires ${challenge.expiresIn}`,
      icon: '/icons/team-challenge.png',
      tag: 'team-challenge',
      actions: [
        { action: 'join', title: 'Join Challenge', icon: '/icons/join.png' },
        { action: 'later', title: 'View Later', icon: '/icons/later.png' }
      ],
      data: {
        type: 'team_challenge',
        url: '/challenges'
      }
    });
  }

  /**
   * Personalized Kindness Prescription Notifications
   */
  async sendPrescriptionNotification(prescription: {
    message: string;
    actions: Array<{
      action: string;
      impact: number;
      effort: string;
    }>;
    expectedOutcome: string;
  }): Promise<void> {
    const topAction = prescription.actions[0];
    
    await this.sendNotification({
      title: '💊 Your Kindness Prescription is Ready',
      body: `${prescription.message}\n🎯 Top recommendation: ${topAction.action} (+${topAction.impact}%)`,
      icon: '/icons/prescription.png',
      tag: 'prescription',
      actions: [
        { action: 'view', title: 'View Full Plan', icon: '/icons/plan.png' },
        { action: 'start', title: 'Start Now', icon: '/icons/start.png' }
      ],
      data: {
        type: 'prescription',
        url: '/ai-insights'
      }
    });
  }

  /**
   * Live Feed Update Notifications
   */
  async sendFeedUpdateNotification(update: {
    type: 'new_post' | 'trending' | 'milestone';
    message: string;
    count?: number;
  }): Promise<void> {
    const typeEmojis = {
      new_post: '✨',
      trending: '🔥', 
      milestone: '🎯'
    };

    await this.sendNotification({
      title: `${typeEmojis[update.type]} Kindness Feed Update`,
      body: update.message,
      icon: '/icons/feed-update.png',
      tag: 'feed-update',
      actions: [
        { action: 'view', title: 'View Feed', icon: '/icons/feed.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
      ],
      data: {
        type: 'feed_update',
        url: '/feed'
      }
    });
  }

  /**
   * Schedule daily kindness reminders
   */
  scheduleDailyReminders(timePreferences: {
    morning?: string; // "09:00"
    afternoon?: string; // "14:00"
    evening?: string; // "18:00"
  }): void {
    // This would integrate with a service worker for scheduled notifications
    // For now, we'll just set up the framework
    console.log('Scheduled daily reminders:', timePreferences);
  }

  /**
   * Enable smart notifications based on user behavior patterns
   */
  enableSmartNotifications(preferences: {
    wellness_alerts: boolean;
    kindness_reminders: boolean;
    achievements: boolean;
    team_challenges: boolean;
    prescriptions: boolean;
    feed_updates: boolean;
    quiet_hours?: { start: string; end: string };
  }): void {
    localStorage.setItem('echodeed_notification_preferences', JSON.stringify(preferences));
  }

  /**
   * Get current notification preferences
   */
  getNotificationPreferences(): any {
    const stored = localStorage.getItem('echodeed_notification_preferences');
    return stored ? JSON.parse(stored) : {
      wellness_alerts: true,
      kindness_reminders: true,
      achievements: true,
      team_challenges: true,
      prescriptions: true,
      feed_updates: false, // Less frequent by default
      quiet_hours: { start: '22:00', end: '07:00' }
    };
  }
}

export const pushNotifications = new PushNotificationService();