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
  schoolId?: string;
}

export interface TokenEarning {
  amount: number;
  reason: string;
}

// B2B SaaS Corporate Dashboard Types
export interface CorporateDashboardData {
  account: {
    id: string;
    companyName: string;
    companyLogo: string | null;
    subscriptionTier: string;
    primaryColor: string;
    totalEmployees?: number;
  };
  overview: {
    totalEmployees: number;
    activeTeams: number;
    activeChallenges: number;
    totalChallengeCompletions: number;
    totalTokensEarned: number;
    engagementScore: number;
    wellnessScore: number;
  };
  teams: Array<{
    id: string;
    teamName: string;
    department: string | null;
    currentSize: number | null;
    targetSize: number | null;
    monthlyKindnessGoal: number | null;
  }>;
  employees: Array<{
    id: string;
    displayName: string | null;
    employeeEmail: string;
    department: string | null;
    role: string;
    teamId: string | null;
  }>;
  recentChallenges: Array<{
    id: string;
    title: string;
    challengeType: string;
    completionCount: number;
    currentParticipation: number;
    echoReward: number;
  }>;
  analytics: Array<{
    analyticsDate: Date;
    activeEmployees: number;
    totalKindnessPosts: number;
    totalChallengesCompleted: number;
    totalEchoTokensEarned: number;
    averageEngagementScore: number;
    wellnessImpactScore: number;
  }>;
}

export interface CorporateMetric {
  label: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
}

export interface ChallengeTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  challengeType: string;
  suggestedDuration: number;
  echoReward: number;
  participationGoal: number;
  icon: string;
  color: string;
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
