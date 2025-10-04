/**
 * 🎓 DUDLEY HIGH SCHOOL DEMO CONFIGURATION
 * 
 * Centralized configuration for EchoDeed demo
 * Professional business demo settings with consistent Dudley HS branding
 * 
 * 🛡️ DEMO MODE: All emails logged locally, no real sends
 * 📊 STATISTICS: 1200 students (grades 9-12), 88% approval rate, realistic distribution
 */

// 🏫 PRIMARY SCHOOL CONFIGURATION
export const BCA_SCHOOL_CONFIG = {
  id: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
  name: 'Dudley High School',
  shortName: 'Dudley',
  address: '1200 Lincoln St, Greensboro, NC 27401',
  phone: '(336) 370-8240',
  website: 'https://www.gcsnc.com/dudley',
  principalName: 'Dr. Quinton Alston',
  gradeRange: '9-12',
  studentCount: 1200,
  establishedYear: 1929,
  denomination: 'Public High School',
  accreditation: 'Southern Association of Colleges and Schools (SACS)'
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

// 🎁 GREENSBORO SPONSOR PARTNERS (Local Greensboro, NC businesses)
export const BCA_SPONSORS = [
  {
    id: 'a-special-blend',
    name: 'A Special Blend Coffee',
    category: 'dining',
    tier: 'gold',
    logo: '/images/sponsors/special-blend.png',
    rewardTitle: 'Coffee & Pastry',
    rewardDescription: 'Free coffee + pastry at mission-driven coffee shop',
    targetAudience: 'students',
    monthlyBudget: 2000,
    active: true
  },
  {
    id: 'tate-street-coffee',
    name: 'Tate Street Coffee House',
    category: 'dining',
    tier: 'gold',
    logo: '/images/sponsors/tate-street.png',
    rewardTitle: 'Coffee & Study Snacks',
    rewardDescription: 'Organic fair-trade coffee + snack near UNCG',
    targetAudience: 'students',
    monthlyBudget: 1800,
    active: true
  },
  {
    id: 'chez-genese',
    name: 'Chez Genèse',
    category: 'dining',
    tier: 'silver',
    logo: '/images/sponsors/chez-genese.png',
    rewardTitle: 'Family Meal Voucher',
    rewardDescription: '$15 credit at French-inspired community restaurant',
    targetAudience: 'families',
    monthlyBudget: 1500,
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
    id: 'fig-and-olive-cafe',
    name: 'Fig & Olive Cafe',
    category: 'dining',
    tier: 'bronze',
    logo: '/images/sponsors/fig-olive.png',
    rewardTitle: 'Cafe Rewards',
    rewardDescription: '$10 credit for healthy meals and snacks',
    targetAudience: 'students',
    monthlyBudget: 1200,
    active: true
  },
  {
    id: 'ymca-greensboro',
    name: 'YMCA of Greensboro',
    category: 'recreation',
    tier: 'gold',
    logo: '/images/sponsors/ymca.png',
    rewardTitle: 'Youth Program Pass',
    rewardDescription: 'Free day pass + youth program trial',
    targetAudience: 'students',
    monthlyBudget: 1600,
    active: true
  },
  {
    id: 'greensboro-grasshoppers',
    name: 'Greensboro Grasshoppers',
    category: 'sports',
    tier: 'silver',
    logo: '/images/sponsors/grasshoppers.png',
    rewardTitle: 'Baseball Game Tickets',
    rewardDescription: 'Family 4-pack tickets to Grasshoppers game',
    targetAudience: 'families',
    monthlyBudget: 1400,
    active: true
  },
  {
    id: 'target-education',
    name: 'Target Greensboro',
    category: 'retail',
    tier: 'platinum',
    logo: '/images/sponsors/target.png',
    rewardTitle: 'School Supply Rewards',
    rewardDescription: '$20 Target gift card for family',
    targetAudience: 'families',
    monthlyBudget: 2500,
    active: true
  },
  {
    id: 'barnes-noble-uncg',
    name: 'Barnes & Noble UNCG',
    category: 'education',
    tier: 'gold',
    logo: '/images/sponsors/barnes-noble.png',
    rewardTitle: 'Book Store Credit',
    rewardDescription: '$15 credit for books and school supplies',
    targetAudience: 'students',
    monthlyBudget: 1800,
    active: true
  },
  {
    id: 'common-grounds-coffee',
    name: 'Common Grounds Coffee',
    category: 'dining',
    tier: 'bronze',
    logo: '/images/sponsors/common-grounds.png',
    rewardTitle: 'Study Session Reward',
    rewardDescription: 'Coffee + snack at student-friendly cafe',
    targetAudience: 'students',
    monthlyBudget: 1000,
    active: true
  }
];

// 📋 DEMO POLICY & COMPLIANCE TITLES
export const BCA_POLICIES = {
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

// 📧 EMAIL BRANDING FOR DUDLEY
export const BCA_EMAIL_CONFIG = {
  fromName: 'Dudley High School - EchoDeed',
  fromEmail: 'noreply@echodeed.dudleyhs.org',
  replyTo: 'admin@gcsnc.com',
  
  templates: {
    consentRequest: {
      subject: '🔐 Dudley HS Parental Consent Required - {studentName}\'s EchoDeed Account',
      headerColor: BCA_BRANDING.colors.primary,
      logoUrl: BCA_BRANDING.logo.primary
    },
    consentApproval: {
      subject: '✅ Dudley HS Consent Approved - {studentName} Account Activated',
      headerColor: BCA_BRANDING.colors.success,
      logoUrl: BCA_BRANDING.logo.primary
    },
    renewalReminder: {
      subject: '🔄 Dudley HS Annual Consent Renewal - Action Required',
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
    email: 'admin@easterngs.gcsnc.com',
    title: 'Principal'
  },
  teacher: {
    name: 'Ms. Kim Jones',
    role: 'teacher',
    email: 'kjones@easterngs.gcsnc.com',
    title: '10th Grade English Teacher'
  },
  parent: {
    name: 'Emma\'s Parent',
    role: 'parent',
    email: 'parent@example.edu',
    students: ['Emma J.']
  }
};

// 👨‍🎓 PRIMARY DEMO STUDENT (for consistent auth across frontend/backend)
export const DEMO_USER_STUDENT = DEMO_USERS.student;

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