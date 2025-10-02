import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { familyChallenges, familyChallengeCompletions } from '@shared/schema';
import type { FamilyChallenge, FamilyChallengeCompletion } from '@shared/schema';

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
  async generateWeeklyChallenges(week: number, ageGroup: '6-8' | 'family'): Promise<void> {
    const theme = this.getWeekTheme(week);
    const challengeTemplates = this.getChallengeTemplatesForAge(theme.theme, ageGroup);
    
    
    for (const template of challengeTemplates) {
      // Check if challenge already exists
      const existingChallenge = await db.select()
        .from(familyChallenges)
        .where(and(
          eq(familyChallenges.weekNumber, week),
          eq(familyChallenges.ageGroup, ageGroup),
          eq(familyChallenges.title, template.title)
        ));

      if (existingChallenge.length === 0) {
        const startDate = this.getWeekStartDate(week);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        await db.insert(familyChallenges)
          .values({
            weekNumber: week,
            title: template.title,
            description: template.description,
            category: theme.theme.toLowerCase().replace(/\s+/g, '_'),
            difficulty: template.difficulty,
            studentTokens: template.kidPoints,
            parentTokens: template.parentPoints,
            familyBonusTokens: 5,
            ageGroup,
            startDate,
            endDate,
            isActive: 1
          });
      }
    }
  }

  private getWeekStartDate(week: number): Date {
    const year = new Date().getFullYear();
    const jan1 = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7;
    return new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  private getChallengeTemplatesForAge(theme: string, ageGroup: '6-8' | 'family') {
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
      },
      'Environmental Care': {
        'family': [
          {
            title: "Earth Guardian Family Mission",
            description: "Work together to care for the environment and teach others",
            difficulty: "medium",
            kidPoints: 20,
            parentPoints: 15,
            activities: [
              {
                title: "Family Eco-Heroes Challenge",
                description: "Become environmental heroes together as a family",
                kidInstructions: "Choose one way to help the Earth this week: pick up litter, start a recycling project, plant something, or save water. Teach a friend about it!",
                parentInstructions: "Guide your child in choosing an age-appropriate environmental action. Help them understand why it matters and how to share their knowledge with others.",
                timeEstimate: 90,
                materials: "Gloves for cleanup, seeds for planting, recycling containers, or conservation tracking sheet",
                location: "outdoors",
                discussionPrompts: "Why is it important to take care of our Earth? How can we inspire other families to help the environment too?"
              }
            ]
          }
        ],
        'k-2': [
          {
            title: "Little Earth Helper",
            description: "Simple ways young kids can help our planet",
            difficulty: "easy",
            kidPoints: 15,
            parentPoints: 10,
            activities: [
              {
                title: "Nature's Friend Project",
                description: "Help take care of nature around you",
                kidInstructions: "Pick up trash in your yard or at the park. Turn off lights when you leave a room. Give water to plants or birds.",
                parentInstructions: "Make this fun by turning it into a game. Count pieces of trash together, make it a 'lights off' race, or let them be the 'water helper.'",
                timeEstimate: 30,
                materials: "Small trash bag, watering can or cup",
                location: "home",
                discussionPrompts: "How do you think the Earth feels when we help take care of it? What animals might be happy when we clean up?"
              }
            ]
          }
        ],
        '3-5': [
          {
            title: "Environmental Detective",
            description: "Discover and solve environmental problems around you",
            difficulty: "medium",
            kidPoints: 18,
            parentPoints: 12,
            activities: [
              {
                title: "Green Detective Mission",
                description: "Find environmental problems and create solutions",
                kidInstructions: "Look around your school and neighborhood for environmental problems. Pick one to solve with your family, like starting a recycling program or organizing a cleanup.",
                parentInstructions: "Help your child observe and think critically about environmental issues. Support their solution by helping them plan and execute their idea.",
                timeEstimate: 60,
                materials: "Notebook for observations, cleanup supplies, or recycling materials",
                location: "community",
                discussionPrompts: "What environmental problems did you notice? How do you think your solution will help? Who else could join your effort?"
              }
            ]
          }
        ],
        '6-8': [
          {
            title: "Climate Action Leader",
            description: "Lead environmental change in your community",
            difficulty: "hard",
            kidPoints: 25,
            parentPoints: 15,
            activities: [
              {
                title: "Environmental Leadership Project",
                description: "Create a project that educates and inspires others about environmental care",
                kidInstructions: "Research an environmental issue and create a presentation, video, or project to teach others. Organize friends or classmates to take action together.",
                parentInstructions: "Support your child's research and help them develop leadership skills. Provide guidance on how to effectively communicate their message and organize others.",
                timeEstimate: 120,
                materials: "Research materials, presentation supplies, poster board, or video equipment",
                location: "school",
                discussionPrompts: "What did you learn about this environmental issue? How can young people like you make a real difference? What was the impact of your project?"
              }
            ]
          }
        ]
      },
      'Elder Appreciation': {
        'family': [
          {
            title: "Intergenerational Kindness Project",
            description: "Connect with elderly community members and show appreciation",
            difficulty: "medium",
            kidPoints: 20,
            parentPoints: 15,
            activities: [
              {
                title: "Elderly Appreciation Cards & Visit",
                description: "Create personalized cards and spend time with elderly community members",
                kidInstructions: "Make handmade cards with drawings and kind messages for elderly neighbors, relatives, or nursing home residents. Practice what you'll say when visiting.",
                parentInstructions: "Help your child create meaningful cards and arrange safe visits to elderly family members or community centers. Guide conversations about respect and learning from elders.",
                timeEstimate: 90,
                materials: "Cardstock, markers, colored pencils, stickers, small gifts or treats",
                location: "community",
                discussionPrompts: "What stories did you hear from the elderly person you visited? What can we learn from people who have lived longer than us? How did your visit make them feel?"
              }
            ]
          }
        ],
        '6-8': [
          {
            title: "Elder Wisdom & Service Project",
            description: "Create a meaningful service project that honors elderly community members",
            difficulty: "medium",
            kidPoints: 25,
            parentPoints: 15,
            activities: [
              {
                title: "Community Elder Support Initiative",
                description: "Design and implement a project to support elderly community members",
                kidInstructions: "Choose a way to help elderly people in your community: offer technology help, organize a letter-writing campaign, create care packages, or start a lawn care service. Document the impact of your work.",
                parentInstructions: "Support your middle schooler in planning and executing their service project. Help them understand the importance of intergenerational relationships and community care.",
                timeEstimate: 120,
                materials: "Project supplies (varies by chosen project), notebook for documenting impact, camera for photos",
                location: "community",
                discussionPrompts: "What challenges do elderly people face that young people don't think about? How did your service project make a difference? What did you learn about aging and community support?"
              }
            ]
          }
        ]
      },
      'Creativity & Kindness': {
        'family': [
          {
            title: "Family Art & Kindness Project",
            description: "Create art together that spreads kindness to others",
            difficulty: "medium",
            kidPoints: 18,
            parentPoints: 12,
            activities: [
              {
                title: "Community Art Installation",
                description: "Create art that brings joy to your community",
                kidInstructions: "Work with your family to create chalk art, painted rocks, or a community mural that will make people smile. Think about colors and messages that spread happiness.",
                parentInstructions: "Guide your child in planning and creating public art that's appropriate and uplifting. Help them understand how art can be a gift to the community.",
                timeEstimate: 90,
                materials: "Chalk, paint, brushes, rocks, poster board, or permission for mural space",
                location: "community",
                discussionPrompts: "How do you think people will feel when they see our art? What makes art meaningful? How can creativity be an act of kindness?"
              }
            ]
          }
        ],
        '6-8': [
          {
            title: "Creative Kindness Leadership",
            description: "Use your creativity to inspire and lead kindness in your community",
            difficulty: "hard",
            kidPoints: 25,
            parentPoints: 15,
            activities: [
              {
                title: "Kindness Campaign Creation",
                description: "Design and execute a creative campaign to promote kindness at school",
                kidInstructions: "Create posters, videos, or a social media campaign about kindness. Work with friends to organize a school-wide kindness event or challenge.",
                parentInstructions: "Support your child's creativity while helping them understand project management and teamwork. Guide them in organizing others effectively.",
                timeEstimate: 120,
                materials: "Art supplies, camera/phone for videos, poster materials, computer access",
                location: "school",
                discussionPrompts: "How can art and creativity change people's hearts? What leadership skills did you use? How will you measure the impact of your campaign?"
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
    
    const ageGroups: Array<'6-8' | 'family'> = ['6-8', 'family'];
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
  async getCurrentWeekChallenges(ageGroup: '6-8' | 'family'): Promise<FamilyChallenge[]> {
    const currentWeek = this.getCurrentWeek();
    
    try {
      const challenges = await db.select()
        .from(familyChallenges)
        .where(and(
          eq(familyChallenges.weekNumber, currentWeek),
          eq(familyChallenges.ageGroup, ageGroup),
          eq(familyChallenges.isActive, 1)
        ));

      // If database has challenges, return them
      if (challenges.length > 0) {
        return challenges;
      }
    } catch (error) {
      console.log(`📋 Database table not found, using fallback templates for week ${currentWeek}, age group: ${ageGroup}`);
    }

    // 🚀 DEMO FALLBACK: Return templates directly when database is empty or table missing
    const theme = this.getWeekTheme(currentWeek);
    const templates = this.getChallengeTemplatesForAge(theme.theme, ageGroup);
    
    console.log(`🎯 FALLBACK DEBUG: Week ${currentWeek}, Theme: "${theme.theme}", Age Group: ${ageGroup}, Templates found: ${templates.length}`);
    
    return templates.map((template, index) => ({
      id: `demo-${ageGroup}-${currentWeek}-${index}`,
      weekNumber: currentWeek,
      title: template.title,
      description: template.description,
      category: theme.theme.toLowerCase().replace(/\s+/g, '_'),
      difficulty: template.difficulty,
      studentTokens: template.kidPoints,
      parentTokens: template.parentPoints,
      familyBonusTokens: 5,
      ageGroup,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: 1,
      createdAt: new Date()
    }));
  }
}

export const familyChallengeEngine = new FamilyChallengeEngine();