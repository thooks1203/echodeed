/**
 * 💌 Daily Encouragement Notification System
 * Sends positive, uplifting messages to students to encourage kindness
 * Students can opt-in/opt-out and choose frequency
 */

import { db } from '../db';
import { studentNotificationPreferences, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// 🌟 Pool of encouraging messages with actionable reminders for students
const ENCOURAGEMENT_MESSAGES = [
  {
    title: "🌟 Share Your Kindness!",
    body: "Did something kind today? Post it on the feed and inspire others! Your story could be the motivation someone needs right now.",
  },
  {
    title: "💪 Take Action Today!",
    body: "Small acts create big impact! Do something kind, then share it on EchoDeed. What positive action will you take today?",
  },
  {
    title: "✨ Spread the Love!",
    body: "Check the kindness feed and echo a post that inspires you! Your reactions encourage others to keep being kind.",
  },
  {
    title: "🎯 Your Daily Challenge!",
    body: "Try this: Hold a door, share a compliment, or help someone. Then post about it so others can join the kindness wave!",
  },
  {
    title: "🌈 Be Someone's Rainbow!",
    body: "Your smile can brighten someone's day! Do something kind, share it on the feed, and watch the ripple effect happen.",
  },
  {
    title: "🚀 Keep Your Streak Alive!",
    body: "Post a kind deed today to keep your streak going! Even small acts of kindness count and inspire our community.",
  },
  {
    title: "💖 Make Someone Smile!",
    body: "Create a moment of joy for someone, then share your story on EchoDeed. Browse the feed and echo posts that warm your heart!",
  },
  {
    title: "🎨 Get Creative Today!",
    body: "Kindness has endless forms! Try something new - help, compliment, or celebrate someone. Share it and inspire others to join!",
  },
  {
    title: "🏆 Feed Your Kindness Streak!",
    body: "Champions post daily! Share what kind act you did today, or echo an inspiring post from the feed to stay active.",
  },
  {
    title: "🌻 Plant Kindness Seeds!",
    body: "Your acts today bloom tomorrow! Post your kindness on the feed and watch others get inspired to do the same.",
  },
  {
    title: "⭐ Light Up the Feed!",
    body: "Check out the amazing kindness on the feed! Echo posts you love and add your own kind deed to brighten someone's day.",
  },
  {
    title: "🤝 Grow Our Community!",
    body: "Every post strengthens our school! Share a kind act you did or saw, and echo others to build our culture of kindness.",
  },
  {
    title: "🎁 Give & Share Kindness!",
    body: "Do something kind from the heart, then gift it to our community by posting on the feed. Your story inspires others!",
  },
  {
    title: "🌟 Inspire the Ripple!",
    body: "Post your kindness to start a chain reaction! Browse the feed, echo posts that move you, and create your own kindness wave.",
  },
  {
    title: "💫 Make Today Count!",
    body: "Do something kind, post it on EchoDeed, and echo others' posts! Your engagement keeps our kindness community thriving.",
  },
];

interface EncouragementNotification {
  userId: string;
  title: string;
  body: string;
  firstName: string;
}

export class DailyEncouragementService {
  /**
   * Get a random encouraging message
   */
  private getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
    return ENCOURAGEMENT_MESSAGES[randomIndex];
  }

  /**
   * Check if a student should receive notification based on frequency
   */
  private shouldSendNotification(
    frequency: string,
    lastNotificationSent: Date | null
  ): boolean {
    if (!lastNotificationSent) return true; // First time, always send

    const now = new Date();
    const daysSinceLastNotification = Math.floor(
      (now.getTime() - lastNotificationSent.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (frequency) {
      case 'daily':
        return daysSinceLastNotification >= 1;
      case 'every_other_day':
        return daysSinceLastNotification >= 2;
      case 'weekly':
        return daysSinceLastNotification >= 7;
      default:
        return daysSinceLastNotification >= 1;
    }
  }

  /**
   * Get all students who should receive notifications now
   */
  async getStudentsDueForNotification(): Promise<EncouragementNotification[]> {
    try {
      // Get all active students with notifications enabled
      const studentsWithPreferences = await db
        .select({
          userId: studentNotificationPreferences.userId,
          frequency: studentNotificationPreferences.notificationFrequency,
          lastNotificationSent: studentNotificationPreferences.lastNotificationSent,
          pushEnabled: studentNotificationPreferences.pushNotificationsEnabled,
          emailEnabled: studentNotificationPreferences.emailNotificationsEnabled,
          firstName: users.firstName,
          email: users.email,
        })
        .from(studentNotificationPreferences)
        .innerJoin(users, eq(users.id, studentNotificationPreferences.userId))
        .where(eq(studentNotificationPreferences.dailyEncouragementEnabled, 1));

      const notificationsToSend: EncouragementNotification[] = [];

      for (const student of studentsWithPreferences) {
        // Check if student is due for notification
        if (this.shouldSendNotification(student.frequency, student.lastNotificationSent)) {
          const message = this.getRandomMessage();
          
          notificationsToSend.push({
            userId: student.userId,
            title: message.title,
            body: message.body,
            firstName: student.firstName || 'Student',
          });
        }
      }

      return notificationsToSend;
    } catch (error) {
      console.error('❌ Error getting students for notifications:', error);
      return [];
    }
  }

  /**
   * Send encouragement notification to a student
   */
  async sendNotification(notification: EncouragementNotification): Promise<void> {
    try {
      console.log(`💌 Sending encouragement to ${notification.firstName}:`, {
        title: notification.title,
        preview: notification.body.substring(0, 50) + '...',
      });

      // Update last notification sent timestamp
      await db
        .update(studentNotificationPreferences)
        .set({
          lastNotificationSent: new Date(),
          totalNotificationsSent: sql`total_notifications_sent + 1`,
          updatedAt: new Date(),
        })
        .where(eq(studentNotificationPreferences.userId, notification.userId));

      // TODO: Integrate with actual push notification service
      // For now, we're just tracking in the database
      // Future: Send via browser push notifications or email

    } catch (error) {
      console.error('❌ Error sending encouragement notification:', error);
    }
  }

  /**
   * Process all notifications (called by scheduler)
   */
  async processNotifications(): Promise<{ sent: number; failed: number }> {
    console.log('🔔 Processing daily encouragement notifications...');

    const notifications = await this.getStudentsDueForNotification();
    
    if (notifications.length === 0) {
      console.log('✨ No students due for notifications at this time');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        await this.sendNotification(notification);
        sent++;
      } catch (error) {
        failed++;
        console.error('❌ Failed to send notification:', error);
      }
    }

    console.log(`✅ Notification processing complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  /**
   * Initialize default notification preferences for a new student
   */
  async initializePreferences(userId: string): Promise<void> {
    try {
      // Check if preferences already exist
      const existing = await db
        .select()
        .from(studentNotificationPreferences)
        .where(eq(studentNotificationPreferences.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        // Create default preferences (enabled by default)
        await db.insert(studentNotificationPreferences).values({
          userId,
          dailyEncouragementEnabled: 1,
          notificationFrequency: 'daily',
          preferredTime: '09:00',
          timezone: 'America/New_York',
          pushNotificationsEnabled: 1,
          emailNotificationsEnabled: 0,
        });

        console.log(`✅ Initialized notification preferences for user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error initializing notification preferences:', error);
    }
  }
}

export const dailyEncouragementService = new DailyEncouragementService();
