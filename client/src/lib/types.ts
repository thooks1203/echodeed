export interface LocationData {
  city: string;
  state: string;
  country: string;
  fullLocation: string;
}

export interface WebSocketMessage {
  type: 'NEW_POST' | 'COUNTER_UPDATE' | 'POST_UPDATE' | 'CHALLENGE_COMPLETED' | 'ACHIEVEMENTS_UNLOCKED';
  post?: any;
  counter?: any;
  challenge?: any;
  achievements?: any[];
  sessionId?: string;
}

export type FilterType = 'global' | 'local' | 'category';

export interface PostFilters {
  category?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface TokenEarning {
  amount: number;
  reason: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  category: 'kindness' | 'challenges' | 'social' | 'milestones' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  requirement: string;
  echoReward: number;
  isActive: number;
  sortOrder: number;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  sessionId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export interface AchievementNotification {
  achievement: Achievement;
  echoReward: number;
}
