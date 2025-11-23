export type SchoolLevel = 'middle_school' | 'high_school';

export interface SchoolLevelConfig {
  level: SchoolLevel;
  displayName: string;
  gradeRange: string;
  
  // Service hour requirements
  annualServiceHoursGoal: number;
  diplomaServiceHoursGoal: number;
  
  // Token economy milestones (celebration thresholds)
  tokenMilestones: number[];
  
  // Workflow configuration
  workflowType: 'three_phase' | 'five_phase_ipard';
  phaseLabels: {
    phase1?: string;
    phase2?: string;
    phase3?: string;
    phase4?: string;
    phase5?: string;
  };
  
  // Compliance requirements
  parentalOversight: 'coppa_strict' | 'ferpa_standard';
  moderationLevel: 'enhanced' | 'standard';
  
  // Feature flags
  features: {
    characterExcellenceAwards: boolean;
    monthlyLeaderboards: boolean;
    serviceLearningDiploma: boolean;
  };
}

export const MIDDLE_SCHOOL_CONFIG: SchoolLevelConfig = {
  level: 'middle_school',
  displayName: 'Middle School',
  gradeRange: '6-8',
  
  annualServiceHoursGoal: 0, // No requirements - community service is optional/encouraged
  diplomaServiceHoursGoal: 0, // No diploma program for MS
  
  tokenMilestones: [25, 75, 150, 300], // Lower thresholds for younger students
  
  workflowType: 'three_phase',
  phaseLabels: {
    phase1: 'Explore', // Discover opportunities
    phase2: 'Do', // Complete service
    phase3: 'Reflect', // Share learning
  },
  
  parentalOversight: 'coppa_strict', // COPPA requires parental consent + oversight
  moderationLevel: 'enhanced', // Stricter content moderation for younger audience
  
  features: {
    characterExcellenceAwards: true, // Teachers can award exceptional character
    monthlyLeaderboards: false, // Reduced competitive pressure for younger students
    serviceLearningDiploma: false, // Not applicable for MS
  },
};

export const HIGH_SCHOOL_CONFIG: SchoolLevelConfig = {
  level: 'high_school',
  displayName: 'High School',
  gradeRange: '9-12',
  
  annualServiceHoursGoal: 50, // Annual goal for tracking
  diplomaServiceHoursGoal: 200, // Guilford County Service-Learning Diploma requirement
  
  tokenMilestones: [100, 250, 500, 1000], // Higher stakes for older students
  
  workflowType: 'five_phase_ipard',
  phaseLabels: {
    phase1: 'Investigation', // Research community needs
    phase2: 'Preparation', // Plan service approach
    phase3: 'Action', // Execute service
    phase4: 'Reflection', // Analyze impact and learning
    phase5: 'Demonstration', // Share outcomes
  },
  
  parentalOversight: 'ferpa_standard', // FERPA compliance, less parental oversight
  moderationLevel: 'standard', // Age-appropriate content filtering
  
  features: {
    characterExcellenceAwards: true,
    monthlyLeaderboards: true, // Principal's Corner recognition
    serviceLearningDiploma: true, // Full IPARD model
  },
};

export const SCHOOL_LEVEL_CONFIGS: Record<SchoolLevel, SchoolLevelConfig> = {
  middle_school: MIDDLE_SCHOOL_CONFIG,
  high_school: HIGH_SCHOOL_CONFIG,
};

export function getSchoolLevelConfig(level: SchoolLevel): SchoolLevelConfig {
  return SCHOOL_LEVEL_CONFIGS[level];
}

export function getTokenMilestones(level: SchoolLevel): number[] {
  return SCHOOL_LEVEL_CONFIGS[level].tokenMilestones;
}

export function getServiceHoursGoal(level: SchoolLevel, goalType: 'annual' | 'diploma'): number {
  const config = SCHOOL_LEVEL_CONFIGS[level];
  return goalType === 'annual' ? config.annualServiceHoursGoal : config.diplomaServiceHoursGoal;
}
