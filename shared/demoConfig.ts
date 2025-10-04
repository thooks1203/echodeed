/**
 * 🎓 MULTI-SCHOOL DEMO CONFIGURATION
 * 
 * Centralized configuration for EchoDeed multi-school demos
 * Supports switching between different school configurations
 * 
 * 🛡️ DEMO MODE: All emails logged locally, no real sends
 */

// 🏫 SCHOOL CONFIGURATION TYPES
export interface SchoolConfig {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  website: string;
  principalName: string;
  gradeRange: string;
  studentCount: number;
  establishedYear: number;
  denomination: string;
  accreditation: string;
  city: string;
  enrollmentCode: string;
}

export interface DemoUsers {
  student: {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolRole: string;
    schoolId: string;
    grade: string;
    title: string;
  };
  admin: {
    name: string;
    role: string;
    email: string;
    title: string;
  };
  teacher: {
    name: string;
    role: string;
    email: string;
    title: string;
  };
  parent: {
    name: string;
    role: string;
    email: string;
    students: string[];
  };
}

export interface Sponsor {
  id: string;
  name: string;
  category: string;
  tier: string;
  logo: string;
  rewardTitle: string;
  rewardDescription: string;
  targetAudience: string;
  monthlyBudget: number;
  active: boolean;
}

export interface DemoSchoolConfig {
  school: SchoolConfig;
  users: DemoUsers;
  sponsors: Sponsor[];
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      success: string;
      warning: string;
      danger: string;
      muted: string;
    };
    logo: {
      primary: string;
      secondary: string;
      icon: string;
    };
    fonts: {
      heading: string;
      body: string;
      mono: string;
    };
  };
  stats: {
    totalStudents: number;
    studentsPerGrade: number;
    grades: string[];
    kpis: {
      approvalRate: number;
      averageResponseTime: string;
      parentEngagement: string;
      teacherAdoption: string;
      expiringIn7Days: number;
      pendingOlderThan48h: number;
    };
  };
  policies: {
    parentalConsent: {
      title: string;
      version: string;
      effectiveDate: string;
      renewalDate: string;
    };
    privacy: {
      title: string;
      version: string;
      coppaCompliant: boolean;
      ferpaAligned: boolean;
    };
    safety: {
      title: string;
      version: string;
      mandatoryReporting: boolean;
      pastoralCareIntegration: boolean;
    };
  };
}

// 🎓 DUDLEY HIGH SCHOOL CONFIGURATION (Greensboro, Middle School Grades 6-8)
export const DUDLEY_CONFIG: DemoSchoolConfig = {
  school: {
    id: 'dudley-hs-001',
    name: 'Dudley High School',
    shortName: 'Dudley',
    address: '1200 Lincoln St, Greensboro, NC 27401',
    phone: '(336) 370-8240',
    website: 'https://www.gcsnc.com/dudley',
    principalName: 'Dr. Quinton Alston',
    gradeRange: '6-8',
    studentCount: 360,
    establishedYear: 1929,
    denomination: 'Public Middle School',
    accreditation: 'Southern Association of Colleges and Schools (SACS)',
    city: 'Greensboro',
    enrollmentCode: 'DUDLEY-2025'
  },
  users: {
    student: {
      id: 'dudley-student-001',
      name: 'Marcus Williams',
      email: 'marcus.williams@gcsnc.com',
      role: 'student',
      schoolRole: 'student',
      schoolId: 'dudley-hs-001',
      grade: '7',
      title: '7th Grade Student'
    },
    admin: {
      name: 'Dr. Quinton Alston',
      role: 'admin',
      email: 'qalston@gcsnc.com',
      title: 'Principal'
    },
    teacher: {
      name: 'Mrs. Patricia Green',
      role: 'teacher',
      email: 'pgreen@gcsnc.com',
      title: '7th Grade Science Teacher'
    },
    parent: {
      name: 'Michelle Williams',
      role: 'parent',
      email: 'mwilliams@email.com',
      students: ['Marcus Williams']
    }
  },
  sponsors: [
    {
      id: 'a-special-blend-gsb',
      name: 'A Special Blend Coffee',
      category: 'dining',
      tier: 'gold',
      logo: '/images/sponsors/special-blend.png',
      rewardTitle: 'Coffee & Pastry',
      rewardDescription: 'Free coffee + pastry at mission-driven coffee shop (Greensboro)',
      targetAudience: 'students',
      monthlyBudget: 2000,
      active: true
    },
    {
      id: 'tate-street-coffee-gsb',
      name: 'Tate Street Coffee House',
      category: 'dining',
      tier: 'gold',
      logo: '/images/sponsors/tate-street.png',
      rewardTitle: 'Coffee & Study Snacks',
      rewardDescription: 'Organic fair-trade coffee near UNCG (Greensboro)',
      targetAudience: 'students',
      monthlyBudget: 1800,
      active: true
    },
    {
      id: 'greensboro-science-center',
      name: 'Greensboro Science Center',
      category: 'education',
      tier: 'platinum',
      logo: '/images/sponsors/science-center.png',
      rewardTitle: 'Museum & Zoo Pass',
      rewardDescription: 'Family admission to aquarium, zoo & museum',
      targetAudience: 'families',
      monthlyBudget: 2800,
      active: true
    },
    {
      id: 'ymca-greensboro',
      name: 'YMCA Greensboro',
      category: 'recreation',
      tier: 'gold',
      logo: '/images/sponsors/ymca.png',
      rewardTitle: 'Youth Program Pass',
      rewardDescription: 'Free day pass + youth program trial',
      targetAudience: 'students',
      monthlyBudget: 1600,
      active: true
    }
  ],
  branding: {
    colors: {
      primary: 'hsl(210, 40%, 25%)',
      secondary: 'hsl(45, 85%, 55%)',
      accent: 'hsl(150, 45%, 40%)',
      background: 'hsl(210, 15%, 98%)',
      text: 'hsl(210, 20%, 15%)',
      success: 'hsl(142, 70%, 45%)',
      warning: 'hsl(45, 95%, 50%)',
      danger: 'hsl(0, 65%, 50%)',
      muted: 'hsl(210, 10%, 65%)'
    },
    logo: {
      primary: '/images/dudley-logo-primary.png',
      secondary: '/images/dudley-logo-white.png',
      icon: '/images/dudley-icon.png'
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace'
    }
  },
  stats: {
    totalStudents: 360,
    studentsPerGrade: 120,
    grades: ['6', '7', '8'],
    kpis: {
      approvalRate: 88,
      averageResponseTime: '4.2 hours',
      parentEngagement: '94%',
      teacherAdoption: '100%',
      expiringIn7Days: 12,
      pendingOlderThan48h: 18
    }
  },
  policies: {
    parentalConsent: {
      title: 'Dudley High School Parental Consent Policy',
      version: 'DUDLEY-2025.3',
      effectiveDate: '2025-08-01',
      renewalDate: '2026-07-31'
    },
    privacy: {
      title: 'Dudley HS Student Privacy Protection Framework',
      version: 'DUDLEY-PRIVACY-2025.1',
      coppaCompliant: true,
      ferpaAligned: true
    },
    safety: {
      title: 'Student Safety & Wellness Protocol',
      version: 'DUDLEY-SAFETY-2025.2',
      mandatoryReporting: true,
      pastoralCareIntegration: false
    }
  }
};

// 🎓 EASTERN GUILFORD HIGH SCHOOL CONFIGURATION (Gibsonville, High School Grades 9-12)
export const EASTERN_GUILFORD_CONFIG: DemoSchoolConfig = {
  school: {
    id: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
    name: 'Eastern Guilford High School',
    shortName: 'Eastern Guilford',
    address: '3609 Terrace Drive, Gibsonville, NC 27249',
    phone: '(336) 449-4521',
    website: 'https://www.easterngs.gcsnc.com',
    principalName: 'Dr. Darrell Harris',
    gradeRange: '9-12',
    studentCount: 1200,
    establishedYear: 1965,
    denomination: 'Public High School',
    accreditation: 'Southern Association of Colleges and Schools (SACS)',
    city: 'Gibsonville',
    enrollmentCode: 'EGHS-2025'
  },
  users: {
    student: {
      id: 'student-001',
      name: 'Emma Johnson',
      email: 'emma.johnson@easterngs.gcsnc.com',
      role: 'student',
      schoolRole: 'student',
      schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
      grade: '10',
      title: '10th Grade Student'
    },
    admin: {
      name: 'Dr. Darrell Harris',
      role: 'admin',
      email: 'dharris@easterngs.gcsnc.com',
      title: 'Principal'
    },
    teacher: {
      name: 'Ms. Kim Jones',
      role: 'teacher',
      email: 'kjones@easterngs.gcsnc.com',
      title: '10th Grade English Teacher'
    },
    parent: {
      name: 'Sarah Johnson',
      role: 'parent',
      email: 'sarah.johnson@email.com',
      students: ['Emma Johnson']
    }
  },
  sponsors: [
    {
      id: 'burlington-sock-puppets',
      name: 'Burlington Sock Puppets',
      category: 'sports',
      tier: 'silver',
      logo: '/images/sponsors/sock-puppets.png',
      rewardTitle: 'Baseball Game Tickets',
      rewardDescription: 'Family 4-pack tickets to Sock Puppets game (Burlington)',
      targetAudience: 'families',
      monthlyBudget: 1400,
      active: true
    },
    {
      id: 'smittys-ice-cream',
      name: 'Smitty\'s Homemade Ice Cream',
      category: 'dining',
      tier: 'gold',
      logo: '/images/sponsors/smittys.png',
      rewardTitle: 'Ice Cream Treats',
      rewardDescription: 'Free ice cream at downtown Burlington favorite',
      targetAudience: 'students',
      monthlyBudget: 1200,
      active: true
    },
    {
      id: 'putt-putt-burlington',
      name: 'Putt Putt Golf & Games',
      category: 'recreation',
      tier: 'bronze',
      logo: '/images/sponsors/putt-putt.png',
      rewardTitle: 'Family Fun Pass',
      rewardDescription: 'Mini-golf and games for the family (Burlington)',
      targetAudience: 'families',
      monthlyBudget: 1000,
      active: true
    },
    {
      id: 'cook-out-burlington',
      name: 'Cook Out',
      category: 'dining',
      tier: 'gold',
      logo: '/images/sponsors/cookout.png',
      rewardTitle: 'Meal Combo',
      rewardDescription: 'Free combo meal at NC institution (Burlington)',
      targetAudience: 'students',
      monthlyBudget: 1500,
      active: true
    },
    {
      id: 'urban-air-greensboro',
      name: 'Urban Air Trampoline Park',
      category: 'recreation',
      tier: 'platinum',
      logo: '/images/sponsors/urban-air.png',
      rewardTitle: 'Adventure Pass',
      rewardDescription: 'Trampoline park admission (Greensboro - 15 miles)',
      targetAudience: 'students',
      monthlyBudget: 2000,
      active: true
    },
    {
      id: 'round1-four-seasons',
      name: 'Round1 Bowling & Amusement',
      category: 'recreation',
      tier: 'platinum',
      logo: '/images/sponsors/round1.png',
      rewardTitle: 'Entertainment Pass',
      rewardDescription: 'Bowling, arcade, karaoke at Four Seasons Mall (10 miles)',
      targetAudience: 'students',
      monthlyBudget: 2200,
      active: true
    },
    {
      id: 'ymca-burlington',
      name: 'Burlington YMCA',
      category: 'recreation',
      tier: 'gold',
      logo: '/images/sponsors/ymca.png',
      rewardTitle: 'Youth Program Pass',
      rewardDescription: 'Free day pass + youth program trial (Burlington)',
      targetAudience: 'students',
      monthlyBudget: 1600,
      active: true
    },
    {
      id: 'barnes-noble-uncg',
      name: 'Barnes & Noble UNCG',
      category: 'education',
      tier: 'gold',
      logo: '/images/sponsors/barnes-noble.png',
      rewardTitle: 'Book Store Credit',
      rewardDescription: '$15 credit for books and supplies (Greensboro)',
      targetAudience: 'students',
      monthlyBudget: 1800,
      active: true
    }
  ],
  branding: {
    colors: {
      primary: 'hsl(220, 60%, 35%)',
      secondary: 'hsl(30, 80%, 55%)',
      accent: 'hsl(160, 50%, 45%)',
      background: 'hsl(220, 15%, 98%)',
      text: 'hsl(220, 20%, 15%)',
      success: 'hsl(142, 70%, 45%)',
      warning: 'hsl(45, 95%, 50%)',
      danger: 'hsl(0, 65%, 50%)',
      muted: 'hsl(220, 10%, 65%)'
    },
    logo: {
      primary: '/images/eastern-logo-primary.png',
      secondary: '/images/eastern-logo-white.png',
      icon: '/images/eastern-icon.png'
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace'
    }
  },
  stats: {
    totalStudents: 1200,
    studentsPerGrade: 300,
    grades: ['9', '10', '11', '12'],
    kpis: {
      approvalRate: 91,
      averageResponseTime: '3.8 hours',
      parentEngagement: '89%',
      teacherAdoption: '95%',
      expiringIn7Days: 8,
      pendingOlderThan48h: 12
    }
  },
  policies: {
    parentalConsent: {
      title: 'Eastern Guilford HS Parental Consent Policy',
      version: 'EGHS-2025.1',
      effectiveDate: '2025-08-01',
      renewalDate: '2026-07-31'
    },
    privacy: {
      title: 'Eastern Guilford Student Privacy Protection Framework',
      version: 'EGHS-PRIVACY-2025.1',
      coppaCompliant: true,
      ferpaAligned: true
    },
    safety: {
      title: 'Student Safety & Wellness Protocol',
      version: 'EGHS-SAFETY-2025.1',
      mandatoryReporting: true,
      pastoralCareIntegration: false
    }
  }
};

// 🗺️ MULTI-SCHOOL REGISTRY
export const DEMO_SCHOOLS: Record<string, DemoSchoolConfig> = {
  'dudley': DUDLEY_CONFIG,
  'eastern-guilford': EASTERN_GUILFORD_CONFIG
};

export type SchoolKey = keyof typeof DEMO_SCHOOLS;

// 🎯 DEFAULT SCHOOL (Eastern Guilford for primary demo)
export const DEFAULT_SCHOOL_KEY: SchoolKey = 'eastern-guilford';

// 🎨 GLOBAL DEMO MODE CONFIGURATION (shared across all schools)
export const DEMO_MODE = {
  enabled: true,
  demoDate: '2025-09-18',
  presentationMode: true,
  
  email: {
    logOnly: true,
    realSends: false,
    logToConsole: true,
    saveToFile: true,
    testRecipient: 'demo@echodeed.com'
  },
  
  privacy: {
    maskRealPII: true,
    syntheticData: true,
    anonymizedStudentIds: true,
    maskedParentEmails: true
  },
  
  performance: {
    fastAnimations: true,
    reducedMotion: false,
    cacheAggressively: true,
    preloadData: true
  }
};

// 🚨 DEMO ALERTS & NOTIFICATIONS
export const DEMO_ALERTS = {
  presentationMode: {
    enabled: true,
    message: '📊 Demo Mode Active - Multi-School Platform Demonstration',
    type: 'info',
    dismissible: false
  },
  
  realTimeUpdates: {
    enabled: true,
    simulateActivity: true,
    updateInterval: 30000
  }
};

// 🔧 UTILITY FUNCTIONS
export const isDemoMode = () => DEMO_MODE.enabled;
export const getDemoDate = () => DEMO_MODE.demoDate;
export const getSchoolConfig = (schoolKey: SchoolKey = DEFAULT_SCHOOL_KEY): DemoSchoolConfig => {
  return DEMO_SCHOOLS[schoolKey] || DEMO_SCHOOLS[DEFAULT_SCHOOL_KEY];
};
export const getAllSchools = () => DEMO_SCHOOLS;
export const getSchoolKeys = (): SchoolKey[] => Object.keys(DEMO_SCHOOLS) as SchoolKey[];

// 🎓 BACKWARD COMPATIBILITY EXPORTS (for existing code)
export const BCA_SCHOOL_CONFIG = EASTERN_GUILFORD_CONFIG.school;
export const BCA_BRANDING = EASTERN_GUILFORD_CONFIG.branding;
export const BCA_DEMO_STATS = EASTERN_GUILFORD_CONFIG.stats;
export const BCA_SPONSORS = EASTERN_GUILFORD_CONFIG.sponsors;
export const BCA_POLICIES = EASTERN_GUILFORD_CONFIG.policies;
export const DEMO_USERS = EASTERN_GUILFORD_CONFIG.users;
export const DEMO_USER_STUDENT = EASTERN_GUILFORD_CONFIG.users.student;

// Helper function for backward compatibility
export const getBCASchoolId = () => EASTERN_GUILFORD_CONFIG.school.id;

// Email configuration (backward compatibility)
export const BCA_EMAIL_CONFIG = {
  fromName: `${EASTERN_GUILFORD_CONFIG.school.name} - EchoDeed`,
  fromEmail: 'noreply@echodeed.com',
  replyTo: 'admin@easterngs.gcsnc.com',
  
  templates: {
    consentRequest: {
      subject: `🔐 ${EASTERN_GUILFORD_CONFIG.school.shortName} Parental Consent Required - {studentName}'s EchoDeed Account`,
      headerColor: EASTERN_GUILFORD_CONFIG.branding.colors.primary,
      logoUrl: EASTERN_GUILFORD_CONFIG.branding.logo.primary
    },
    consentApproval: {
      subject: `✅ ${EASTERN_GUILFORD_CONFIG.school.shortName} Consent Approved - {studentName} Account Activated`,
      headerColor: EASTERN_GUILFORD_CONFIG.branding.colors.success,
      logoUrl: EASTERN_GUILFORD_CONFIG.branding.logo.primary
    },
    renewalReminder: {
      subject: `🔄 ${EASTERN_GUILFORD_CONFIG.school.shortName} Annual Consent Renewal - Action Required`,
      headerColor: EASTERN_GUILFORD_CONFIG.branding.colors.warning,
      logoUrl: EASTERN_GUILFORD_CONFIG.branding.logo.primary
    }
  }
};

// Renewal configuration (backward compatibility)
export const BCA_RENEWAL_CONFIG = {
  schoolYear: {
    start: '2025-08-01',
    end: '2026-07-31',
    renewalWindow: 45
  },
  reminderSchedule: [
    { type: 'initial', daysBefore: 75, description: 'Initial renewal notice' },
    { type: 'followup', daysBefore: 45, description: 'First reminder' },
    { type: 'urgent', daysBefore: 14, description: 'Urgent renewal needed' },
    { type: 'final', daysBefore: 7, description: 'Final notice' },
    { type: 'critical', daysBefore: 1, description: 'Account suspension warning' }
  ]
};

// Default export
export default {
  schools: DEMO_SCHOOLS,
  defaultSchool: DEFAULT_SCHOOL_KEY,
  getSchoolConfig,
  demo: DEMO_MODE,
  alerts: DEMO_ALERTS
};
