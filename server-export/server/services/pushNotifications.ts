/**
 * 🚀 REVOLUTIONARY: Push Notification Service
 * Instant mobile alerts for parents when children post kindness acts
 * Creates real-time family engagement through the dual reward system
 */

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface ParentNotificationData {
  parentAccountId: string;
  studentName: string;
  studentUserId: string;
  notificationType: 'kindness_post' | 'safety_alert' | 'milestone' | 'reward_earned';
  postContent?: string;
  rewardAmount?: number;
  safetyLevel?: 'low' | 'medium' | 'high' | 'urgent';
}

class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'demo-public-key',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'demo-private-key'
  };

  /**
   * 🔔 Send instant push notification to parent
   */
  async sendParentNotification(
    notificationData: ParentNotificationData,
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    console.log('📱 Sending push notification to parent:', {
      parent: notificationData.parentAccountId,
      student: notificationData.studentName,
      type: notificationData.notificationType
    });

    const payload = this.buildNotificationPayload(notificationData);
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        await this.sendPushNotification(subscription, payload);
        sent++;
        console.log('✅ Push notification sent successfully');
      } catch (error) {
        failed++;
        console.error('❌ Push notification failed:', error);
      }
    }

    return { success: sent > 0, sent, failed };
  }

  /**
   * 🌟 Build notification payload based on type
   */
  private buildNotificationPayload(data: ParentNotificationData): NotificationPayload {
    switch (data.notificationType) {
      case 'kindness_post':
        return {
          title: `🌟 ${data.studentName} shared kindness!`,
          body: `Your child just posted a wonderful act of kindness. You both earned rewards through our dual system!`,
          icon: '/icons/kindness-icon-192.png',
          badge: '/icons/kindness-badge-72.png',
          data: {
            type: 'kindness_post',
            studentId: data.studentUserId,
            postContent: data.postContent,
            rewardAmount: data.rewardAmount,
            url: '/parent-dashboard?tab=activity'
          },
          actions: [
            {
              action: 'view',
              title: 'View Activity',
              icon: '/icons/view-icon.png'
            },
            {
              action: 'celebrate',
              title: 'Celebrate',
              icon: '/icons/heart-icon.png'
            }
          ]
        };

      case 'safety_alert':
        return {
          title: `🛡️ Safety Alert: ${data.studentName}`,
          body: `Your child's recent post has been flagged for review. Please check the parent dashboard for details.`,
          icon: '/icons/safety-icon-192.png',
          badge: '/icons/safety-badge-72.png',
          data: {
            type: 'safety_alert',
            studentId: data.studentUserId,
            safetyLevel: data.safetyLevel,
            url: '/parent-dashboard?tab=notifications&filter=safety'
          },
          actions: [
            {
              action: 'view_details',
              title: 'View Details',
              icon: '/icons/view-icon.png'
            },
            {
              action: 'contact_school',
              title: 'Contact School',
              icon: '/icons/phone-icon.png'
            }
          ]
        };

      case 'milestone':
        return {
          title: `🏆 ${data.studentName} achieved a milestone!`,
          body: `Your child just unlocked a new achievement! Check out their progress and the bonus rewards earned.`,
          icon: '/icons/trophy-icon-192.png',
          badge: '/icons/trophy-badge-72.png',
          data: {
            type: 'milestone',
            studentId: data.studentUserId,
            rewardAmount: data.rewardAmount,
            url: '/parent-dashboard?tab=rewards'
          },
          actions: [
            {
              action: 'view_milestone',
              title: 'View Achievement',
              icon: '/icons/trophy-icon.png'
            },
            {
              action: 'share_celebration',
              title: 'Celebrate Together',
              icon: '/icons/celebration-icon.png'
            }
          ]
        };

      case 'reward_earned':
        return {
          title: `💰 Family Rewards Available!`,
          body: `Your dual reward system bonus is ready! $${data.rewardAmount} in family rewards earned through kindness.`,
          icon: '/icons/reward-icon-192.png',
          badge: '/icons/reward-badge-72.png',
          data: {
            type: 'reward_earned',
            rewardAmount: data.rewardAmount,
            url: '/parent-dashboard?tab=rewards&highlight=new'
          },
          actions: [
            {
              action: 'claim_reward',
              title: 'Claim Rewards',
              icon: '/icons/gift-icon.png'
            },
            {
              action: 'view_balance',
              title: 'View Balance',
              icon: '/icons/wallet-icon.png'
            }
          ]
        };

      default:
        return {
          title: `📱 EchoDeed Update`,
          body: `You have a new notification from your child's kindness activities.`,
          icon: '/icons/app-icon-192.png',
          data: {
            type: 'general',
            url: '/parent-dashboard'
          }
        };
    }
  }

  /**
   * 📤 Send individual push notification
   */
  private async sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    // In production, this would use a service like Firebase Cloud Messaging
    // or Web Push Protocol with VAPID keys
    
    console.log('🚀 Sending push notification:', {
      endpoint: subscription.endpoint.slice(-20) + '...',
      title: payload.title,
      actions: payload.actions?.length || 0
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For demo purposes, we'll log the notification
    // In production, implement actual push sending:
    /*
    const webpush = require('web-push');
    webpush.setVapidDetails(
      'mailto:support@echodeed.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
    
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    */
  }

  /**
   * 🔄 Send bulk notifications to multiple parents
   */
  async sendBulkParentNotifications(
    notifications: Array<{
      data: ParentNotificationData;
      subscriptions: PushSubscription[];
    }>
  ): Promise<{ totalSent: number; totalFailed: number; results: any[] }> {
    console.log(`📢 Sending bulk notifications to ${notifications.length} parent groups`);

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const notification of notifications) {
      const result = await this.sendParentNotification(
        notification.data,
        notification.subscriptions
      );
      
      results.push({
        parentId: notification.data.parentAccountId,
        ...result
      });
      
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    console.log(`📊 Bulk notification results: ${totalSent} sent, ${totalFailed} failed`);
    
    return { totalSent, totalFailed, results };
  }

  /**
   * 🎯 Send kindness celebration notification
   */
  async sendKindnessCelebration(
    parentAccountId: string,
    studentName: string,
    studentUserId: string,
    postContent: string,
    rewardAmount: number,
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    return this.sendParentNotification(
      {
        parentAccountId,
        studentName,
        studentUserId,
        notificationType: 'kindness_post',
        postContent,
        rewardAmount
      },
      subscriptions
    );
  }

  /**
   * 🚨 Send safety concern notification
   */
  async sendSafetyAlert(
    parentAccountId: string,
    studentName: string,
    studentUserId: string,
    safetyLevel: 'low' | 'medium' | 'high' | 'urgent',
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    return this.sendParentNotification(
      {
        parentAccountId,
        studentName,
        studentUserId,
        notificationType: 'safety_alert',
        safetyLevel
      },
      subscriptions
    );
  }

  /**
   * 🏆 Send milestone achievement notification
   */
  async sendMilestoneNotification(
    parentAccountId: string,
    studentName: string,
    studentUserId: string,
    rewardAmount: number,
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    return this.sendParentNotification(
      {
        parentAccountId,
        studentName,
        studentUserId,
        notificationType: 'milestone',
        rewardAmount
      },
      subscriptions
    );
  }

  /**
   * 💎 Send dual reward system notification
   */
  async sendDualRewardNotification(
    parentAccountId: string,
    rewardAmount: number,
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    return this.sendParentNotification(
      {
        parentAccountId,
        studentName: 'Family',
        studentUserId: 'family-reward',
        notificationType: 'reward_earned',
        rewardAmount
      },
      subscriptions
    );
  }

  /**
   * ⚡ Real-time trigger for immediate notifications
   */
  async triggerRealTimeParentAlert(
    parentAccountId: string,
    studentName: string,
    postContent: string
  ): Promise<void> {
    console.log('⚡ Triggering real-time parent alert:', {
      parent: parentAccountId,
      student: studentName,
      preview: postContent.slice(0, 30) + '...'
    });

    // Mock push subscription retrieval
    // In production: const subscriptions = await storage.getParentPushSubscriptions(parentAccountId);
    const mockSubscriptions: PushSubscription[] = [
      {
        endpoint: 'https://fcm.googleapis.com/fcm/send/demo-endpoint',
        keys: {
          p256dh: 'demo-p256dh-key',
          auth: 'demo-auth-key'
        }
      }
    ];

    await this.sendKindnessCelebration(
      parentAccountId,
      studentName,
      'student-demo-id',
      postContent,
      5, // Base reward amount
      mockSubscriptions
    );
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Types for external use
export type {
  PushSubscription,
  NotificationPayload,
  ParentNotificationData
};