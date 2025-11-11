import { IStorage } from '../storage';
import type { InsertStudentNotificationEvent, InsertStudentNotification, StudentNotificationEvent } from '@shared/schema';
import { emailService } from './emailService';

interface StudentNotificationData {
  userId: string;
  type: 'service_approved' | 'token_milestone' | 'streak_achievement' | 'reward_status' | 'ipard_bonus' | 'daily_encouragement';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'urgent' | 'normal' | 'low';
}

export class StudentNotificationService {
  constructor(private storage: IStorage) {}

  async queueNotification(data: StudentNotificationData): Promise<void> {
    const prefs = await this.storage.getNotificationPreferences(data.userId);
    
    if (!prefs) {
      return;
    }

    const eventType = this.mapTypeToEventType(data.type);
    
    const event: InsertStudentNotificationEvent = {
      userId: data.userId,
      eventType,
      priority: data.priority || 'normal',
      status: 'pending',
      payload: {
        type: data.type,
        title: data.title,
        message: data.message,
        ...data.metadata,
      },
    };

    await this.storage.createNotificationEvent(event);
  }

  async queueServiceApprovalNotification(
    userId: string,
    serviceName: string,
    hoursLogged: number,
    tokensEarned: number
  ): Promise<void> {
    await this.queueNotification({
      userId,
      type: 'service_approved',
      title: 'Service Hours Approved!',
      message: `Your ${hoursLogged} hours of "${serviceName}" have been approved. You earned ${tokensEarned} Echo Tokens!`,
      metadata: { serviceName, hoursLogged, tokensEarned },
      priority: 'normal',
    });
  }

  async queueTokenMilestoneNotification(
    userId: string,
    currentTokens: number,
    milestone: number
  ): Promise<void> {
    const prefs = await this.storage.getNotificationPreferences(userId);
    
    if (!prefs || (prefs.lastTokenMilestoneNotified || 0) >= milestone) {
      return;
    }

    await this.queueNotification({
      userId,
      type: 'token_milestone',
      title: `${milestone} Tokens Milestone!`,
      message: `Congratulations! You've reached ${currentTokens} Echo Tokens and unlocked new rewards!`,
      metadata: { currentTokens, milestone },
      priority: 'normal',
    });

    await this.storage.updateMilestone(userId, 'token', milestone);
  }

  async queueStreakAchievementNotification(
    userId: string,
    currentStreak: number,
    milestone: number
  ): Promise<void> {
    const prefs = await this.storage.getNotificationPreferences(userId);
    
    if (!prefs || (prefs.lastStreakMilestoneNotified || 0) >= milestone) {
      return;
    }

    await this.queueNotification({
      userId,
      type: 'streak_achievement',
      title: `${milestone}-Day Streak!`,
      message: `Amazing! You've maintained a ${currentStreak}-day kindness streak. Keep it going!`,
      metadata: { currentStreak, milestone },
      priority: 'normal',
    });

    await this.storage.updateMilestone(userId, 'streak', milestone);
  }

  async queueIpardBonusNotification(
    userId: string,
    phase: 'investigation_preparation' | 'reflection' | 'demonstration',
    tokensAwarded: number
  ): Promise<void> {
    const phaseNames = {
      investigation_preparation: 'Investigation + Preparation',
      reflection: 'Reflection',
      demonstration: 'Demonstration',
    };

    await this.queueNotification({
      userId,
      type: 'ipard_bonus',
      title: `IPARD Bonus: ${phaseNames[phase]}!`,
      message: `You earned ${tokensAwarded} bonus tokens for completing the ${phaseNames[phase]} phase!`,
      metadata: { phase, tokensAwarded },
      priority: 'normal',
    });
  }

  async queueRewardStatusNotification(
    userId: string,
    rewardName: string,
    status: 'approved' | 'denied' | 'fulfilled',
    message: string
  ): Promise<void> {
    await this.queueNotification({
      userId,
      type: 'reward_status',
      title: `Reward ${status.charAt(0).toUpperCase() + status.slice(1)}: ${rewardName}`,
      message,
      metadata: { rewardName, status },
      priority: status === 'approved' || status === 'fulfilled' ? 'normal' : 'low',
    });
  }

  async processImmediateNotifications(): Promise<number> {
    const events = await this.storage.getPendingNotificationEvents({
      status: 'pending',
      priority: 'urgent',
    });

    let processed = 0;
    for (const event of events) {
      try {
        await this.processEvent(event, false);
        processed++;
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
        await this.storage.markEventFailed(event.id, String(error));
      }
    }

    return processed;
  }

  async processDailyDigest(): Promise<number> {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours !== 7) return 0;

    const events = await this.storage.getPendingNotificationEvents({
      status: 'pending',
      priority: 'normal',
    });

    const userGroups = this.groupEventsByUser(events);
    let processed = 0;

    for (const [userId, userEvents] of Object.entries(userGroups)) {
      try {
        await this.sendDigestEmail(userId, userEvents, 'daily');
        for (const event of userEvents) {
          await this.storage.markEventProcessed(event.id, `digest-${now.toISOString()}`);
        }
        processed += userEvents.length;
      } catch (error) {
        console.error(`Failed to send digest for user ${userId}:`, error);
      }
    }

    return processed;
  }

  async processMilestoneDigest(): Promise<number> {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours !== 15) return 0;

    const events = await this.storage.getPendingNotificationEvents({
      status: 'pending',
      priority: 'normal',
    });

    const milestoneEvents = events.filter(e => 
      e.eventType === 'token_earned' || e.eventType === 'streak_increased'
    );

    const userGroups = this.groupEventsByUser(milestoneEvents);
    let processed = 0;

    for (const [userId, userEvents] of Object.entries(userGroups)) {
      try {
        await this.sendDigestEmail(userId, userEvents, 'milestone');
        for (const event of userEvents) {
          await this.storage.markEventProcessed(event.id, `milestone-${now.toISOString()}`);
        }
        processed += userEvents.length;
      } catch (error) {
        console.error(`Failed to send milestone digest for user ${userId}:`, error);
      }
    }

    return processed;
  }

  private async processEvent(event: StudentNotificationEvent, isDigest: boolean): Promise<void> {
    const prefs = await this.storage.getNotificationPreferences(event.userId);
    if (!prefs || !prefs.emailNotificationsEnabled) {
      await this.storage.markEventProcessed(event.id, 'skipped-disabled');
      return;
    }

    const student = await this.storage.getStudentAccount(event.userId);
    if (!student || !student.parentNotificationEmail) {
      await this.storage.markEventFailed(event.id, 'No parent email');
      return;
    }

    const payload = event.payload as any;
    const notification: InsertStudentNotification = {
      userId: event.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      status: 'pending',
      deliveryMethod: 'email',
      isDigest: isDigest ? 1 : 0,
      payload: event.payload as any,
    };

    const created = await this.storage.createNotification(notification);
    await emailService.sendStudentNotificationEmail({
      to: student.parentNotificationEmail,
      subject: payload.title,
      body: payload.message,
      category: payload.type,
      isDigest,
    });
    await this.storage.markNotificationSent(created.id, new Date());
    await this.storage.markEventProcessed(event.id, created.id);
  }

  private async sendDigestEmail(userId: string, events: StudentNotificationEvent[], type: 'daily' | 'milestone'): Promise<void> {
    const student = await this.storage.getStudentAccount(userId);
    if (!student || !student.parentNotificationEmail) {
      return;
    }

    const items = events.map(e => {
      const p = e.payload as any;
      return {
        title: p.title,
        message: p.message,
        type: p.type,
      };
    });

    await emailService.sendStudentDigestEmail({
      to: student.parentNotificationEmail,
      studentName: student.firstName,
      items,
      digestType: type,
    });
    
    for (const event of events) {
      const payload = event.payload as any;
      const notification: InsertStudentNotification = {
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        status: 'sent',
        deliveryMethod: 'email',
        isDigest: 1,
        digestBatchId: `${type}-${new Date().toISOString()}`,
        payload: event.payload as any,
      };
      const created = await this.storage.createNotification(notification);
      await this.storage.markNotificationSent(created.id, new Date());
    }
  }

  private groupEventsByUser(events: StudentNotificationEvent[]): Record<string, StudentNotificationEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.userId]) {
        acc[event.userId] = [];
      }
      acc[event.userId].push(event);
      return acc;
    }, {} as Record<string, StudentNotificationEvent[]>);
  }

  private mapTypeToEventType(
    type: string
  ): 'service_approved' | 'token_earned' | 'streak_increased' | 'reward_updated' | 'ipard_completed' {
    const mapping: Record<string, any> = {
      service_approved: 'service_approved',
      token_milestone: 'token_earned',
      streak_achievement: 'streak_increased',
      reward_status: 'reward_updated',
      ipard_bonus: 'ipard_completed',
      daily_encouragement: 'service_approved',
    };
    return mapping[type] || 'service_approved';
  }
}
