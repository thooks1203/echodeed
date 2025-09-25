import { db } from "../db";
import { schoolYearChallenges, schoolYearProgress } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

interface WeeklyChallengeTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
}

interface ChallengeTemplate {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeEstimate: number;
}

export class SchoolYearChallengeEngine {
  
  // Weekly themes for the 36-week school year (Sept-May) - designed for grades 6-12
  private readonly weeklyThemes: WeeklyChallengeTheme[] = [
    { week: 1, theme: "New Beginnings", description: "Welcome new students and create inclusive communities", focus: "Back-to-school inclusion and friendship", color: "#3B82F6" },
    { week: 2, theme: "Peer Support", description: "Help classmates succeed academically and socially", focus: "Study groups and emotional support", color: "#10B981" },
    { week: 3, theme: "Teacher Appreciation", description: "Show gratitude to educators", focus: "Recognition and assistance", color: "#F59E0B" },
    { week: 4, theme: "Leadership Initiative", description: "Take on leadership roles in school and community", focus: "Student government and peer mentoring", color: "#8B5CF6" },
    { week: 5, theme: "Digital Kindness", description: "Spread positivity online and combat cyberbullying", focus: "Social media responsibility", color: "#06B6D4" },
    { week: 6, theme: "Environmental Action", description: "Protect our planet through meaningful action", focus: "Sustainability and eco-consciousness", color: "#059669" },
    { week: 7, theme: "Community Service", description: "Make a difference in your local community", focus: "Volunteer work and civic engagement", color: "#DC2626" },
    { week: 8, theme: "Academic Excellence", description: "Support learning and educational growth", focus: "Tutoring and study assistance", color: "#EA580C" },
    { week: 9, theme: "Mental Health Awareness", description: "Promote emotional wellbeing and reduce stigma", focus: "Self-care and peer support", color: "#7C3AED" },
    { week: 10, theme: "Diversity Celebration", description: "Honor different cultures and backgrounds", focus: "Inclusion and cultural understanding", color: "#BE185D" },
    { week: 11, theme: "Anti-Bullying", description: "Create safe spaces for everyone", focus: "Bystander intervention and support", color: "#0891B2" },
    { week: 12, theme: "Gratitude Practice", description: "Express appreciation and thankfulness", focus: "Mindfulness and positive thinking", color: "#EF4444" },
    { week: 13, theme: "Creative Expression", description: "Use arts and creativity to spread joy", focus: "Art, music, and creative projects", color: "#8B5CF6" },
    { week: 14, theme: "Health & Wellness", description: "Promote physical and mental health", focus: "Fitness and healthy lifestyle choices", color: "#059669" },
    { week: 15, theme: "Technology for Good", description: "Use technology to help others", focus: "Coding for social good and digital literacy", color: "#06B6D4" },
    { week: 16, theme: "Holiday Spirit", description: "Spread joy during the holiday season", focus: "Seasonal giving and celebration", color: "#DC2626" },
    { week: 17, theme: "New Year Goals", description: "Set and support positive resolutions", focus: "Goal setting and accountability", color: "#3B82F6" },
    { week: 18, theme: "Random Acts", description: "Surprise others with unexpected kindness", focus: "Spontaneous generosity", color: "#F59E0B" },
    { week: 19, theme: "Conflict Resolution", description: "Help resolve disputes peacefully", focus: "Mediation and communication skills", color: "#10B981" },
    { week: 20, theme: "Elder Wisdom", description: "Connect with and learn from older generations", focus: "Intergenerational relationships", color: "#7C3AED" },
    { week: 21, theme: "Animal Compassion", description: "Care for animals and wildlife", focus: "Animal welfare and conservation", color: "#059669" },
    { week: 22, theme: "Career Exploration", description: "Help others discover their passions", focus: "Mentorship and career guidance", color: "#EA580C" },
    { week: 23, theme: "Financial Literacy", description: "Share knowledge about money management", focus: "Budgeting and financial responsibility", color: "#BE185D" },
    { week: 24, theme: "Spring Renewal", description: "Start fresh projects and clean initiatives", focus: "Renewal and new beginnings", color: "#10B981" },
    { week: 25, theme: "Artistic Collaboration", description: "Create art that brings people together", focus: "Collaborative creativity", color: "#8B5CF6" },
    { week: 26, theme: "Science for Society", description: "Use scientific knowledge to help others", focus: "STEM outreach and education", color: "#06B6D4" },
    { week: 27, theme: "Cultural Bridge", description: "Connect different communities", focus: "Cultural exchange and understanding", color: "#BE185D" },
    { week: 28, theme: "Physical Fitness", description: "Promote active lifestyles", focus: "Sports and exercise motivation", color: "#059669" },
    { week: 29, theme: "Memory Making", description: "Create positive memories for others", focus: "Event planning and celebration", color: "#F59E0B" },
    { week: 30, theme: "Knowledge Sharing", description: "Teach others what you know", focus: "Tutoring and skill sharing", color: "#EA580C" },
    { week: 31, theme: "Earth Day Action", description: "Take concrete steps to protect the environment", focus: "Environmental activism", color: "#059669" },
    { week: 32, theme: "Graduation Support", description: "Help seniors prepare for their next chapter", focus: "Transition assistance and celebration", color: "#3B82F6" },
    { week: 33, theme: "Summer Planning", description: "Help others prepare for summer opportunities", focus: "Planning and goal setting", color: "#F59E0B" },
    { week: 34, theme: "Reflection & Growth", description: "Reflect on the year's achievements", focus: "Self-assessment and planning", color: "#7C3AED" },
    { week: 35, theme: "Legacy Building", description: "Create lasting positive impact", focus: "Long-term thinking and impact", color: "#DC2626" },
    { week: 36, theme: "Celebration & Gratitude", description: "Celebrate accomplishments and express gratitude", focus: "Recognition and appreciation", color: "#8B5CF6" }
  ];

  // Get current school week (1-36, September to May)
  getCurrentSchoolWeek(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // School year starts first Monday of September
    const septemberFirst = new Date(currentYear, 8, 1); // September is month 8
    const firstMonday = new Date(septemberFirst);
    firstMonday.setDate(septemberFirst.getDate() + (1 - septemberFirst.getDay() + 7) % 7);
    
    // If we're before the school year start, use previous year
    const schoolYearStart = now < firstMonday ? 
      new Date(currentYear - 1, 8, 1) : firstMonday;
    
    // Calculate weeks since school year start
    const weeksSinceStart = Math.floor((now.getTime() - schoolYearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Return week 1-36, cycling if needed
    return Math.max(1, Math.min(36, weeksSinceStart + 1));
  }

  // Get theme for a specific week
  getWeekTheme(week: number): WeeklyChallengeTheme {
    return this.weeklyThemes.find(t => t.week === week) || this.weeklyThemes[0];
  }

  // Generate weekly challenges for specific grade level
  async generateWeeklyChallenges(week: number, gradeLevel: '6-8' | '9-12'): Promise<void> {
    const theme = this.getWeekTheme(week);
    const challengeTemplates = this.getChallengeTemplatesForGrade(theme.theme, gradeLevel);
    
    for (const template of challengeTemplates) {
      // Check if challenge already exists
      const existingChallenge = await db.select()
        .from(schoolYearChallenges)
        .where(and(
          eq(schoolYearChallenges.week, week),
          eq(schoolYearChallenges.gradeLevel, gradeLevel),
          eq(schoolYearChallenges.title, template.title)
        ));

      if (existingChallenge.length === 0) {
        await db.insert(schoolYearChallenges)
          .values({
            week,
            title: template.title,
            description: template.description,
            theme: theme.theme,
            category: theme.theme.toLowerCase().replace(/\s+/g, '_'),
            difficulty: template.difficulty,
            points: template.points,
            gradeLevel,
            timeEstimate: template.timeEstimate,
            isActive: true
          });
      }
    }
  }

  // Get grade-appropriate challenge templates
  private getChallengeTemplatesForGrade(theme: string, gradeLevel: '6-8' | '9-12'): ChallengeTemplate[] {
    const baseTemplates: Record<string, Record<string, ChallengeTemplate[]>> = {
      'New Beginnings': {
        '6-8': [
          {
            title: "Welcome Buddy Program",
            description: "Help a new student feel welcome by being their buddy for the week",
            difficulty: "easy",
            points: 15,
            timeEstimate: 60
          }
        ],
        '9-12': [
          {
            title: "Freshman Mentor Initiative",
            description: "Create and lead a mentoring group for new high school students",
            difficulty: "medium",
            points: 20,
            timeEstimate: 90
          }
        ]
      },
      'Peer Support': {
        '6-8': [
          {
            title: "Study Circle Leader",
            description: "Organize a study group to help classmates with challenging subjects",
            difficulty: "medium",
            points: 20,
            timeEstimate: 75
          }
        ],
        '9-12': [
          {
            title: "Academic Support Network",
            description: "Establish a peer tutoring system for struggling students",
            difficulty: "hard",
            points: 25,
            timeEstimate: 120
          }
        ]
      },
      'Digital Kindness': {
        '6-8': [
          {
            title: "Positive Post Champion",
            description: "Create and share 5 positive, encouraging posts on social media",
            difficulty: "easy",
            points: 15,
            timeEstimate: 45
          }
        ],
        '9-12': [
          {
            title: "Anti-Cyberbullying Campaign",
            description: "Design and implement a campaign to promote digital citizenship",
            difficulty: "hard",
            points: 25,
            timeEstimate: 150
          }
        ]
      },
      'Environmental Action': {
        '6-8': [
          {
            title: "Green School Initiative",
            description: "Start a recycling program or environmental club at school",
            difficulty: "medium",
            points: 20,
            timeEstimate: 90
          }
        ],
        '9-12': [
          {
            title: "Sustainability Research Project",
            description: "Research and present solutions for local environmental issues",
            difficulty: "hard",
            points: 25,
            timeEstimate: 180
          }
        ]
      },
      'Community Service': {
        '6-8': [
          {
            title: "Local Helper Hero",
            description: "Volunteer 3+ hours at a local community organization",
            difficulty: "medium",
            points: 20,
            timeEstimate: 180
          }
        ],
        '9-12': [
          {
            title: "Service Leadership Project",
            description: "Organize and lead a community service project involving other students",
            difficulty: "hard",
            points: 25,
            timeEstimate: 240
          }
        ]
      }
    };

    return baseTemplates[theme]?.[gradeLevel] || [
      {
        title: `${theme} Explorer`,
        description: `Explore ways to practice ${theme.toLowerCase()} in your daily life`,
        difficulty: "easy",
        points: 15,
        timeEstimate: 60
      }
    ];
  }

  // Get challenges for current week and grade level
  async getCurrentWeekChallenges(gradeLevel: '6-8' | '9-12') {
    const currentWeek = this.getCurrentSchoolWeek();
    
    return await db.select()
      .from(schoolYearChallenges)
      .where(and(
        eq(schoolYearChallenges.week, currentWeek),
        eq(schoolYearChallenges.gradeLevel, gradeLevel),
        eq(schoolYearChallenges.isActive, true)
      ));
  }

  // Record challenge completion
  async completeChallenge(userId: string, challengeId: string, studentReflection?: string) {
    const [completion] = await db.insert(schoolYearProgress)
      .values({
        userId,
        challengeId,
        completedAt: new Date(),
        pointsEarned: 0, // Will be updated when teacher approves
        studentReflection: studentReflection || null,
        teacherApproved: false,
        parentNotified: false
      })
      .returning();

    return completion;
  }

  // Get user's school year progress
  async getUserProgress(userId: string) {
    return await db.select({
      progress: schoolYearProgress,
      challenge: schoolYearChallenges
    })
    .from(schoolYearProgress)
    .leftJoin(schoolYearChallenges, eq(schoolYearProgress.challengeId, schoolYearChallenges.id))
    .where(eq(schoolYearProgress.userId, userId));
  }

  // Initialize school year program with all 36 weeks
  async initializeSchoolYearProgram(): Promise<void> {
    console.log('🎓 Initializing School Year Challenge Program...');
    
    const gradeLevels: Array<'6-8' | '9-12'> = ['6-8', '9-12'];
    
    for (let week = 1; week <= 36; week++) {
      for (const gradeLevel of gradeLevels) {
        await this.generateWeeklyChallenges(week, gradeLevel);
      }
    }
    
    console.log('✅ School Year Challenge Program initialized with all 36 weeks for grades 6-12!');
  }

  // Approve a completed challenge and award points
  async approveCompletion(progressId: string, pointsAwarded: number) {
    try {
      const [updatedProgress] = await db.update(schoolYearProgress)
        .set({
          teacherApproved: true,
          pointsEarned: pointsAwarded
        })
        .where(eq(schoolYearProgress.id, progressId))
        .returning();

      return updatedProgress;
    } catch (error) {
      throw new Error('Failed to approve challenge completion');
    }
  }
}

export const schoolYearChallengeEngine = new SchoolYearChallengeEngine();