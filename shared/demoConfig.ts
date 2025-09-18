/**
 * 🎓 BURLINGTON CHRISTIAN ACADEMY (BCA) DEMO CONFIGURATION
 * 
 * Centralized configuration for George Robinson demo - September 18, 2025
 * Professional business demo settings with consistent BCA branding
 * 
 * 🛡️ DEMO MODE: All emails logged locally, no real sends
 * 📊 STATISTICS: 360 students, 88% approval rate, realistic distribution
 */

// 🏫 PRIMARY SCHOOL CONFIGURATION
export const BCA_SCHOOL_CONFIG = {
  id: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
  name: 'Burlington Christian Academy',
  shortName: 'BCA',
  address: '2829 Maple Ave, Burlington, NC 27215',
  phone: '(336) 227-0265',
  website: 'https://burlingtonchristianacademy.org',
  principalName: 'Dr. Sarah Henderson',
  gradeRange: '6-8',
  studentCount: 360,
  establishedYear: 1985,
  denomination: 'Non-denominational Christian',
  accreditation: 'Association of Christian Schools International (ACSI)'
};

// 🎨 BCA BRANDING & DESIGN
export const BCA_BRANDING = {
  colors: {
    primary: 'hsl(210, 40%, 25%)', // Deep navy blue
    secondary: 'hsl(45, 85%, 55%)', // Golden yellow
    accent: 'hsl(150, 45%, 40%)', // Forest green
    background: 'hsl(210, 15%, 98%)', // Light gray-blue
    text: 'hsl(210, 20%, 15%)', // Dark navy
    success: 'hsl(142, 70%, 45%)', // Green
    warning: 'hsl(45, 95%, 50%)', // Orange-yellow
    danger: 'hsl(0, 65%, 50%)', // Red
    muted: 'hsl(210, 10%, 65%)', // Muted blue-gray
  },
  logo: {
    primary: '/images/bca-logo-primary.png',
    secondary: '/images/bca-logo-white.png',
    icon: '/images/bca-icon.png'
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace'
  }
};

// 📊 DEMO STATISTICS & DATA
export const BCA_DEMO_STATS = {
  totalStudents: 360,
  studentsPerGrade: 120,
  grades: ['6', '7', '8'],
  
  // Consent distribution (professional presentation stats)
  consentDistribution: {
    approved: 0.88,     // 88% - 317 students
    pending: 0.09,      // 9% - 32 students  
    denied: 0.01,       // 1% - 4 students
    revoked: 0.003,     // 0.3% - 1 student
    expired: 0.017      // 1.7% - 6 students
  },
  
  // Key performance indicators
  kpis: {
    approvalRate: 88,
    averageResponseTime: '4.2 hours',
    parentEngagement: '94%',
    teacherAdoption: '100%',
    expiringIn7Days: 12,
    pendingOlderThan48h: 18
  },
  
  // Renewal metrics
  renewals: {
    total: 150,
    pending: 22,
    approvalRate: 0.93,
    scheduledRenewals: 45,
    overdueRenewals: 3
  }
};

// 🎯 DEMO MODE CONFIGURATION
export const DEMO_MODE = {
  enabled: true,
  demoDate: '2025-09-18',
  presentationMode: true,
  
  // Email handling in demo
  email: {
    logOnly: true,
    realSends: false,
    logToConsole: true,
    saveToFile: true,
    testRecipient: 'demo@burlingtonchristianacademy.org'
  },
  
  // Data privacy for demo
  privacy: {
    maskRealPII: true,
    syntheticData: true,
    anonymizedStudentIds: true,
    maskedParentEmails: true
  },
  
  // Performance settings for smooth demo
  performance: {
    fastAnimations: true,
    reducedMotion: false,
    cacheAggressively: true,
    preloadData: true
  }
};

// 🎁 BCA SPONSOR PARTNERS (Local Burlington, NC businesses)
export const BCA_SPONSORS = [
  {
    id: 'burlington-carousel',
    name: 'Burlington City Park Carousel',
    category: 'recreation',
    tier: 'gold',
    logo: '/images/sponsors/burlington-carousel.png',
    rewardTitle: 'Free Carousel Rides',
    rewardDescription: '4 free rides at Burlington\'s historic carousel',
    targetAudience: 'families',
    monthlyBudget: 2000,
    active: true
  },
  {
    id: 'putt-putt-fun',
    name: 'Putt-Putt Fun Center Burlington',
    category: 'entertainment',
    tier: 'gold',
    logo: '/images/sponsors/putt-putt.png',
    rewardTitle: 'Mini Golf & Games',
    rewardDescription: 'Free mini golf round + $5 arcade credits',
    targetAudience: 'families',
    monthlyBudget: 1800,
    active: true
  },
  {
    id: 'sock-puppets',
    name: 'Burlington Sock Puppets Baseball',
    category: 'sports',
    tier: 'silver',
    logo: '/images/sponsors/sock-puppets.png',
    rewardTitle: 'Game Tickets',
    rewardDescription: 'Family 4-pack tickets to Sock Puppets game',
    targetAudience: 'families',
    monthlyBudget: 1500,
    active: true
  },
  {
    id: 'sir-pizza',
    name: 'Sir Pizza Burlington',
    category: 'dining',
    tier: 'bronze',
    logo: '/images/sponsors/sir-pizza.png',
    rewardTitle: 'Family Pizza Night',
    rewardDescription: 'Large pizza + drinks for family of 4',
    targetAudience: 'families',
    monthlyBudget: 1200,
    active: true
  },
  {
    id: 'alamance-libraries',
    name: 'Alamance County Libraries',
    category: 'education',
    tier: 'community',
    logo: '/images/sponsors/alamance-library.png',
    rewardTitle: 'Book Store Credits',
    rewardDescription: '$10 credit at library book sales',
    targetAudience: 'students',
    monthlyBudget: 800,
    active: true
  },
  {
    id: 'chick-fil-a-burlington',
    name: 'Chick-fil-A Burlington',
    category: 'dining',
    tier: 'silver',
    logo: '/images/sponsors/chick-fil-a.png',
    rewardTitle: 'Kids Meal & Treat',
    rewardDescription: 'Free kids meal + ice cream for student',
    targetAudience: 'students',
    monthlyBudget: 1600,
    active: true
  },
  {
    id: 'scholastic-books',
    name: 'Scholastic Books',
    category: 'education',
    tier: 'platinum',
    logo: '/images/sponsors/scholastic.png',
    rewardTitle: 'Book Credits',
    rewardDescription: '$15 credit for student + $10 parent credit',
    targetAudience: 'families',
    monthlyBudget: 3000,
    active: true
  },
  {
    id: 'target-education',
    name: 'Target Education',
    category: 'retail',
    tier: 'platinum',
    logo: '/images/sponsors/target.png',
    rewardTitle: 'School Supply Rewards',
    rewardDescription: '$20 Target gift card for family',
    targetAudience: 'families',
    monthlyBudget: 2500,
    active: true
  }
];

// 📋 DEMO POLICY & COMPLIANCE TITLES
export const BCA_POLICIES = {
  parentalConsent: {
    title: 'Burlington Christian Academy Parental Consent Policy',
    version: 'BCA-2025.3',
    effectiveDate: '2025-08-01',
    renewalDate: '2026-07-31'
  },
  privacy: {
    title: 'BCA Student Privacy Protection Framework',
    version: 'BCA-PRIVACY-2025.1',
    coppaCompliant: true,
    ferpaAligned: true
  },
  safety: {
    title: 'Christian Values-Based Student Safety Protocol',
    version: 'BCA-SAFETY-2025.2',
    mandatoryReporting: true,
    pastoralCareIntegration: true
  }
};

// 🔄 RENEWAL CONFIGURATION
export const BCA_RENEWAL_CONFIG = {
  schoolYear: {
    start: '2025-08-01',
    end: '2026-07-31',
    renewalWindow: 45 // days before expiration
  },
  reminderSchedule: [
    { type: 'initial', daysBefore: 75, description: 'Initial renewal notice' },
    { type: 'followup', daysBefore: 45, description: 'First reminder' },
    { type: 'urgent', daysBefore: 14, description: 'Urgent renewal needed' },
    { type: 'final', daysBefore: 7, description: 'Final notice' },
    { type: 'critical', daysBefore: 1, description: 'Account suspension warning' }
  ]
};

// 📧 EMAIL BRANDING FOR BCA
export const BCA_EMAIL_CONFIG = {
  fromName: 'Burlington Christian Academy - EchoDeed',
  fromEmail: 'noreply@echodeed.burlingtonchristianacademy.org',
  replyTo: 'admin@burlingtonchristianacademy.org',
  
  templates: {
    consentRequest: {
      subject: '🔐 BCA Parental Consent Required - {studentName}\'s EchoDeed Account',
      headerColor: BCA_BRANDING.colors.primary,
      logoUrl: BCA_BRANDING.logo.primary
    },
    consentApproval: {
      subject: '✅ BCA Consent Approved - {studentName} Account Activated',
      headerColor: BCA_BRANDING.colors.success,
      logoUrl: BCA_BRANDING.logo.primary
    },
    renewalReminder: {
      subject: '🔄 BCA Annual Consent Renewal - Action Required',
      headerColor: BCA_BRANDING.colors.warning,
      logoUrl: BCA_BRANDING.logo.primary
    }
  }
};

// 🚨 DEMO ALERTS & NOTIFICATIONS
export const DEMO_ALERTS = {
  presentationMode: {
    enabled: true,
    message: '📊 Demo Mode Active - George Robinson Presentation (Sep 18, 2025)',
    type: 'info',
    dismissible: false
  },
  
  realTimeUpdates: {
    enabled: true,
    simulateActivity: true,
    updateInterval: 30000 // 30 seconds
  }
};

// 📱 DEMO USER ROLES & ACCESS
export const DEMO_USERS = {
  admin: {
    name: 'Sarah Henderson',
    role: 'admin',
    email: 'admin@burlingtonchristianacademy.org',
    title: 'Principal'
  },
  teacher: {
    name: 'Michael Johnson',
    role: 'teacher',
    email: 'mjohnson@burlingtonchristianacademy.org',
    title: '7th Grade Teacher'
  },
  parent: {
    name: 'Jennifer Smith',
    role: 'parent',
    email: 'parent@example.edu',
    students: ['Emma S.', 'Liam S.']
  }
};

// 🎯 DEMO SUCCESS METRICS TO HIGHLIGHT
export const DEMO_HIGHLIGHTS = {
  safetyCompliance: {
    title: 'Child Safety Excellence',
    metrics: ['100% COPPA Compliant', 'AI Crisis Detection', 'Mandatory Reporting Integration']
  },
  parentEngagement: {
    title: 'Family Connection',
    metrics: ['94% Parent Participation', 'Dual Reward System', 'Real-time Updates']
  },
  educationalValue: {
    title: 'Character Education',
    metrics: ['SEL Standards Aligned', 'Biblical Values Integration', 'Measurable Outcomes']
  },
  technicalReliability: {
    title: 'Enterprise-Grade Platform',
    metrics: ['99.9% Uptime', 'FERPA Compliant', 'Scalable Architecture']
  }
};

// 🔧 DEVELOPMENT UTILITIES
export const isDemoMode = () => DEMO_MODE.enabled;
export const getDemoDate = () => DEMO_MODE.demoDate;
export const getBCASchoolId = () => BCA_SCHOOL_CONFIG.id;
export const getBCABrandColors = () => BCA_BRANDING.colors;
export const getBCASponsors = () => BCA_SPONSORS.filter(sponsor => sponsor.active);

// Export default configuration object
export default {
  school: BCA_SCHOOL_CONFIG,
  branding: BCA_BRANDING,
  stats: BCA_DEMO_STATS,
  demo: DEMO_MODE,
  sponsors: BCA_SPONSORS,
  policies: BCA_POLICIES,
  renewal: BCA_RENEWAL_CONFIG,
  email: BCA_EMAIL_CONFIG,
  alerts: DEMO_ALERTS,
  users: DEMO_USERS,
  highlights: DEMO_HIGHLIGHTS
};