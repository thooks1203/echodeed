import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { yearRoundFamilyChallenges, familyActivities, familyProgress } from '@shared/schema';
import type { YearRoundFamilyChallenge, FamilyActivity, InsertYearRoundFamilyChallenge, InsertFamilyActivity } from '@shared/schema';

interface WeeklyFamilyTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
  emoji: string;
}

export class FamilyChallengeEngine {
  // 52 weeks of family kindness themes (repeatable year-round)
  private weeklyThemes: WeeklyFamilyTheme[] = [
    { week: 1, theme: "New Year Kindness", description: "Start the year with family kindness goals", focus: "Goal setting together", color: "#8B5CF6", emoji: "🎯" },
    { week: 2, theme: "Gratitude Partners", description: "Practice gratitude as a family", focus: "Appreciation and thankfulness", color: "#F59E0B", emoji: "🙏" },
    { week: 3, theme: "Neighborhood Helpers", description: "Help your neighbors together", focus: "Community connection", color: "#10B981", emoji: "🏠" },
    { week: 4, theme: "Acts of Service", description: "Serve others as a family unit", focus: "Service learning", color: "#3B82F6", emoji: "🤝" },
    { week: 5, theme: "Kindness Coaches", description: "Teach kindness to younger kids", focus: "Mentoring and leadership", color: "#EF4444", emoji: "🎓" },
    { week: 6, theme: "Random Acts Week", description: "Surprise strangers with kindness", focus: "Spontaneous giving", color: "#EC4899", emoji: "✨" },
    { week: 7, theme: "Environmental Care", description: "Care for the earth together", focus: "Environmental stewardship", color: "#059669", emoji: "🌱" },
    { week: 8, theme: "Elder Appreciation", description: "Honor and help elderly community members", focus: "Intergenerational respect", color: "#7C3AED", emoji: "👴" },
    { week: 9, theme: "Creativity & Kindness", description: "Create something beautiful for others", focus: "Creative expression", color: "#DC2626", emoji: "🎨" },
    { week: 10, theme: "Food & Fellowship", description: "Share meals and food with others", focus: "Hospitality and sharing", color: "#D97706", emoji: "🍽️" },
    { week: 11, theme: "Learning Together", description: "Learn new skills as a family", focus: "Growth mindset", color: "#0369A1", emoji: "📚" },
    { week: 12, theme: "Animal Compassion", description: "Care for animals in your community", focus: "Animal welfare", color: "#059669", emoji: "🐕" },
    // Continue for all 52 weeks with rotating themes
    { week: 13, theme: "Family Gratitude", description: "Appreciate each family member", focus: "Family bonds", color: "#F59E0B", emoji: "👨‍👩‍👧‍👦" },
    { week: 14, theme: "School Spirit", description: "Show kindness at school", focus: "Educational community", color: "#3B82F6", emoji: "🏫" },
    { week: 15, theme: "Community Garden", description: "Plant seeds of kindness", focus: "Growth and nurturing", color: "#10B981", emoji: "🌻" },
    // ... (will add more themes as needed)
  ];

  // Get current week of year (1-52)
  getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  // Get theme for specific week
  getWeekTheme(week: number): WeeklyFamilyTheme {
    const themeIndex = (week - 1) % this.weeklyThemes.length;
    return this.weeklyThemes[themeIndex] || this.weeklyThemes[0];
  }

  // Generate age-appropriate family challenges
  async generateWeeklyChallenges(week: number, ageGroup: 'k-2' | '3-5' | '6-8' | 'family'): Promise<void> {
    const theme = this.getWeekTheme(week);
    const challengeTemplates = this.getChallengeTemplatesForAge(theme.theme, ageGroup);
    
    for (const template of challengeTemplates) {
      // Check if challenge already exists
      const existingChallenge = await db.select()
        .from(yearRoundFamilyChallenges)
        .where(and(
          eq(yearRoundFamilyChallenges.week, week),
          eq(yearRoundFamilyChallenges.ageGroup, ageGroup),
          eq(yearRoundFamilyChallenges.title, template.title)
        ));

      if (existingChallenge.length === 0) {
        const startDate = this.getWeekStartDate(week);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const [challenge] = await db.insert(yearRoundFamilyChallenges)
          .values({
            week,
            title: template.title,
            description: template.description,
            theme: theme.theme.toLowerCase().replace(/\s+/g, '_'),
            difficulty: template.difficulty,
            kidPoints: template.kidPoints,
            parentPoints: template.parentPoints,
            ageGroup,
            startDate,
            endDate,
            isActive: true
          })
          .returning();

        // Add specific activities for this challenge
        for (const activity of template.activities) {
          await db.insert(familyActivities).values({
            challengeId: challenge.id,
            title: activity.title,
            description: activity.description,
            kidInstructions: activity.kidInstructions,
            parentInstructions: activity.parentInstructions,
            timeEstimate: activity.timeEstimate,
            materialsNeeded: activity.materials,
            locationSuggestion: activity.location,
            discussionPrompts: activity.discussionPrompts
          });
        }
      }
    }
  }

  private getWeekStartDate(week: number): Date {
    const year = new Date().getFullYear();
    const jan1 = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7;
    return new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  private getChallengeTemplatesForAge(theme: string, ageGroup: 'k-2' | '3-5' | '6-8' | 'family') {
    const templates: Record<string, Record<string, any[]>> = {
      'New Year Kindness': {
        'family': [
          {
            title: "Family Kindness Resolution",
            description: "Create kindness goals together as a family",
            difficulty: "easy",
            kidPoints: 15,
            parentPoints: 10,
            activities: [
              {
                title: "Kindness Resolution Board",
                description: "Create a visual board of family kindness goals",
                kidInstructions: "Draw pictures of kind things you want to do this year. Think about helping friends, family, and neighbors.",
                parentInstructions: "Help your child brainstorm realistic kindness goals. Guide them to think about daily, weekly, and monthly acts of kindness.",
                timeEstimate: 45,
                materials: "Poster board, markers, stickers, magazines for cutting",
                location: "home",
                discussionPrompts: "What made you feel good when someone was kind to you? How can we make others feel that way too?"
              }
            ]
          }
        ]
      },
      'Gratitude Partners': {
        'family': [
          {
            title: "Daily Gratitude Practice",
            description: "Practice gratitude together every day this week",
            difficulty: "easy",
            kidPoints: 12,
            parentPoints: 8,
            activities: [
              {
                title: "Gratitude Jar",
                description: "Fill a family gratitude jar together",
                kidInstructions: "Each day, write one thing you're grateful for on a paper slip. Draw a picture too if you want!",
                parentInstructions: "Model gratitude by sharing what you're grateful for. Help your child notice both big and small things to appreciate.",
                timeEstimate: 10,
                materials: "Mason jar, colored paper, pens",
                location: "home",
                discussionPrompts: "What's something small that made you happy today? How can we show appreciation to people who help us?"
              }
            ]
          }
        ]
      },
      'Neighborhood Helpers': {
        'family': [
          {
            title: "Neighbor Connection Project",
            description: "Do something kind for your neighbors",
            difficulty: "medium",
            kidPoints: 18,
            parentPoints: 12,
            activities: [
              {
                title: "Neighbor Care Package",
                description: "Create care packages for neighbors",
                kidInstructions: "Help choose treats and make cards for neighbors. Practice what you'll say when delivering them.",
                parentInstructions: "Supervise the creation and delivery. Use this as a chance to teach your child about community and caring for others.",
                timeEstimate: 60,
                materials: "Small bags, homemade treats or store-bought snacks, handmade cards",
                location: "community",
                discussionPrompts: "How do you think our neighbors felt receiving these? What other ways can we help our community?"
              }
            ]
          }
        ]
      }
    };

    return templates[theme]?.[ageGroup] || [];
  }

  // Initialize the family challenge program
  async initializeFamilyProgram(): Promise<void> {
    console.log('👨‍👩‍👧‍👦 Initializing Family Kindness Challenge Program...');
    
    const ageGroups: Array<'k-2' | '3-5' | '6-8' | 'family'> = ['k-2', '3-5', '6-8', 'family'];
    const currentWeek = this.getCurrentWeek();
    
    // Initialize current week and next 3 weeks
    for (let week = currentWeek; week <= currentWeek + 3; week++) {
      for (const ageGroup of ageGroups) {
        await this.generateWeeklyChallenges(week, ageGroup);
      }
    }
    
    console.log(`✅ Family Challenge Program initialized with ${ageGroups.length} age groups for weeks ${currentWeek}-${currentWeek + 3}!`);
  }

  // Get current week's challenges for a specific age group
  async getCurrentWeekChallenges(ageGroup: 'k-2' | '3-5' | '6-8' | 'family'): Promise<YearRoundFamilyChallenge[]> {
    const currentWeek = this.getCurrentWeek();
    
    const challenges = await db.select()
      .from(yearRoundFamilyChallenges)
      .where(and(
        eq(yearRoundFamilyChallenges.week, currentWeek),
        eq(yearRoundFamilyChallenges.ageGroup, ageGroup),
        eq(yearRoundFamilyChallenges.isActive, true)
      ));

    return challenges;
  }

  // Get activities for a specific challenge
  async getChallengeActivities(challengeId: string): Promise<FamilyActivity[]> {
    return await db.select()
      .from(familyActivities)
      .where(eq(familyActivities.challengeId, challengeId));
  }
}

export const familyChallengeEngine = new FamilyChallengeEngine();