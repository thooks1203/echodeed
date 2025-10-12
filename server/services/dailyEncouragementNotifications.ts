/**
 * 💌 Daily Encouragement Notification System
 * Sends positive, uplifting messages to students to encourage kindness
 * Students can opt-in/opt-out and choose frequency
 */

import { db } from '../db';
import { studentNotificationPreferences, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// 🌟 Pool of encouraging messages for students
const ENCOURAGEMENT_MESSAGES = [
  {
    title: "🌟 You're Making a Difference!",
    body: "Every act of kindness creates a ripple effect. Your positive actions inspire others to do good too!",
  },
  {
    title: "💪 Keep Going!",
    body: "Small acts of kindness can have a big impact. What kind gesture will you share today?",
  },
  {
    title: "✨ You're Awesome!",
    body: "Your kindness matters! Every positive action you take makes our school community stronger.",
  },
  {
    title: "🎯 Challenge Yourself!",
    body: "Try something new today - hold a door, share a compliment, or help a classmate. You've got this!",
  },
  {
    title: "🌈 Spread Joy Today!",
    body: "Your smile and kind words have the power to brighten someone's entire day. Who will you uplift?",
  },
  {
    title: "🚀 You're on Fire!",
    body: "Keep up the amazing work! Your consistent kindness is building a better school for everyone.",
  },
  {
    title: "💖 Be the Change!",
    body: "The world needs more people like you who choose kindness every single day. Thank you for being you!",
  },
  {
    title: "🎨 Get Creative with Kindness!",
    body: "Kindness comes in many forms - a note, a high-five, helping hands. What's your kindness style today?",
  },
  {
    title: "🏆 You're a Kindness Champion!",
    body: "Champions show up every day and give their best. Your kindness streak is inspiring!",
  },
  {
    title: "🌻 Plant Seeds of Kindness!",
    body: "Just like flowers grow from seeds, your kind acts today will bloom into something beautiful tomorrow.",
  },
  {
    title: "⭐ Shine Bright!",
    body: "Your positive energy lights up our school! Keep spreading those good vibes.",
  },
  {
    title: "🤝 Together We're Stronger!",
    body: "Every kind act you do contributes to our amazing school community. You're part of something special!",
  },
  {
    title: "🎁 Give the Gift of Kindness!",
    body: "The best gifts don't come wrapped - they come from the heart. Share your kindness today!",
  },
  {
    title: "🌟 You Inspire Others!",
    body: "When you choose kindness, you inspire others to do the same. You're a role model!",
  },
  {
    title: "💫 Magic Happens!",
    body: "There's something magical about kindness - it always comes back to you. Keep spreading the magic!",
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
