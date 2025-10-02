/**
 * Feature Flags Configuration
 * 
 * This file controls which features are visible in the EchoDeed application.
 * Features can be toggled on/off without deleting code, allowing easy reactivation later.
 * 
 * Environment variable overrides:
 * - VITE_ENABLE_CHALLENGES=true to show challenge features
 * - VITE_ENABLE_AI_FEATURES=true to show AI dashboards
 * - VITE_ENABLE_CURRICULUM=true to show curriculum lessons
 */

export const featureFlags = {
  // ============================================================================
  // CORE FEATURES (Always Enabled - Essential for MVP)
  // ============================================================================
  
  /** Anonymous kindness posting - core feature */
  kindnessPosts: true,
  
  /** Service hours logging with photo verification - core feature */
  serviceHours: true,
  
  /** Token earning and balance display - core monetization */
  tokens: true,
  
  /** Reward partners and redemption - core profit model */
  rewardPartners: true,
  
  /** Teacher approval workflow - core feature */
  teacherApprovals: true,
  
  /** Basic parent notifications - core feature */
  parentNotifications: true,
  
  /** School subscription system - future revenue */
  subscriptions: true,

  // ============================================================================
  // HIDDEN FEATURES (Disabled by Default - Can Reactivate Later)
  // ============================================================================
  
  /** Summer challenges (12 weeks) - HIDDEN to reduce complexity */
  summerChallenges: getEnvFlag('VITE_ENABLE_CHALLENGES', false),
  
  /** School-year challenges (36 weeks) - HIDDEN to reduce complexity */
  schoolYearChallenges: getEnvFlag('VITE_ENABLE_CHALLENGES', false),
  
  /** AI wellness predictions and dashboards - HIDDEN to reduce complexity */
  aiWellness: getEnvFlag('VITE_ENABLE_AI_FEATURES', false),
  
  /** Curriculum lessons (5 lessons) - HIDDEN to reduce complexity */
  curriculum: getEnvFlag('VITE_ENABLE_CURRICULUM', false),
  
  /** Crisis counselor system - HIDDEN to reduce complexity */
  crisisCounselor: getEnvFlag('VITE_ENABLE_AI_FEATURES', false),
  
  /** Surprise giveaway campaigns - HIDDEN to reduce complexity */
  surpriseGiveaways: getEnvFlag('VITE_ENABLE_CHALLENGES', false),
  
  /** Sentiment analysis dashboards - HIDDEN to reduce complexity */
  sentimentAnalysis: getEnvFlag('VITE_ENABLE_AI_FEATURES', false),
  
  /** Global kindness exchanges - HIDDEN to reduce complexity */
  globalExchanges: getEnvFlag('VITE_ENABLE_CHALLENGES', false),
  
  /** Advanced parent dashboard tabs - HIDDEN to simplify */
  advancedParentDashboard: getEnvFlag('VITE_ENABLE_CHALLENGES', false),
};

/**
 * Helper function to read environment variable flags
 * Supports both development (import.meta.env) and server (process.env)
 */
function getEnvFlag(key: string, defaultValue: boolean): boolean {
  // Check browser environment (Vite)
  if (typeof window !== 'undefined' && import.meta?.env) {
    const value = import.meta.env[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  
  // Check Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  
  return defaultValue;
}

/**
 * Check if user has admin/teacher role to see hidden features
 * This allows staff to test hidden features without exposing to students
 */
export function canViewHiddenFeatures(userRole?: string): boolean {
  return userRole === 'teacher' || userRole === 'admin' || userRole === 'school_admin';
}

export type FeatureFlags = typeof featureFlags;
