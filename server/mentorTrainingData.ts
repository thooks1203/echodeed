import { storage } from "./storage";
import type { InsertMentorTraining, InsertMentorScenario, InsertMentorConversation } from "@shared/schema";

export async function initializeMentorTraining() {
  try {
    console.log('🎓 Initializing Mentor Training System...');
    console.log('📚 Creating training modules, scenarios, and sample conversations...');

    // Create basic training modules
    await createBasicTrainingModules();
    
    // Create simple scenarios
    await createBasicScenarios();
    
    // Create sample conversations
    await createBasicConversations();

    console.log('✅ Mentor Training System initialized successfully!');
    console.log('🎯 Training includes: 3 modules, 2 scenarios, and 2 sample conversations');
    console.log('📖 Ready to train the next generation of kindness mentors!');
    
  } catch (error) {
    console.error('❌ Failed to initialize mentor training:', error);
    throw error;
  }
}

async function createBasicTrainingModules() {
  const trainingModules: InsertMentorTraining[] = [
    {
      title: 'Welcome to Kindness Mentoring',
      description: 'Learn the basics of becoming an effective kindness mentor.',
      trainingType: 'orientation',
      ageGroupFocus: 'all',
      durationMinutes: 15,
      isRequired: true,
      content: {
        introduction: 'Welcome to the world of kindness mentoring!',
        keyPoints: [
          'Guide, don\'t direct: Ask questions that help mentees think',
          'Listen actively: Pay attention to their ideas and feelings', 
          'Encourage creativity: Support their unique kindness ideas',
          'Celebrate progress: Recognize every act of kindness'
        ]
      },
      completionCriteria: {
        'readComplete': true
      },
      certificateReward: 50
    },
    
    {
      title: 'Building Trust and Connection',
      description: 'Master the art of creating safe, trusting relationships.',
      trainingType: 'skills',
      ageGroupFocus: 'all',
      durationMinutes: 20,
      isRequired: true,
      content: {
        introduction: 'Trust is the foundation of effective mentoring.',
        strategies: [
          'Use their name frequently',
          'Show genuine interest in their world',
          'Share your own experiences first',
          'Be reliable and consistent'
        ]
      },
      completionCriteria: {
        'readComplete': true,
        'practiceActivity': true
      },
      certificateReward: 75
    },

    {
      title: 'Inspiring Kindness Creativity',
      description: 'Learn techniques to help mentees discover unique ways to spread kindness.',
      trainingType: 'advanced',
      ageGroupFocus: 'all',
      durationMinutes: 30,
      isRequired: false,
      content: {
        introduction: 'Help mentees discover their unique kindness style.',
        framework: {
          'S - Strengths': 'Connect kindness to what they\'re already good at',
          'P - Problem-solving': 'Turn their concerns into kindness opportunities',
          'A - Action-oriented': 'Move from ideas to reality',
          'R - Ripple effect': 'Help them see the broader impact',
          'K - Keep sustainable': 'Ensure kindness becomes a habit'
        }
      },
      completionCriteria: {
        'readComplete': true,
        'creativityExercise': true
      },
      certificateReward: 100
    }
  ];

  // Create training modules
  for (const module of trainingModules) {
    try {
      const existingModule = await storage.getMentorTrainingByTitle(module.title);
      if (!existingModule) {
        await storage.createMentorTraining(module);
      }
    } catch (error) {
      console.error(`Failed to create training module "${module.title}":`, error);
    }
  }
}

async function createBasicScenarios() {
  const scenarios: InsertMentorScenario[] = [
    {
      title: 'The Shy New Student',
      category: 'connection',
      difficulty: 'beginner',
      description: 'Help your mentee reach out to a new student who seems lonely.',
      scenario: 'Maria is a new student who sits alone at lunch every day. Your mentee Alex wants to help her feel welcome but doesn\'t know how to approach her.',
      learningPoints: [
        'Building inclusive communities',
        'Cultural sensitivity and awareness',
        'Overcoming social anxiety'
      ],
      suggestedApproaches: [
        'Start with small, non-verbal kindness',
        'Find common interests as conversation starters',
        'Include her in group activities'
      ],
      extensionActivities: [
        'Create a welcoming committee for new students',
        'Practice inclusive language'
      ],
      isActive: true,
      sortOrder: 1
    },

    {
      title: 'When Kindness Gets Rejected',
      category: 'guidance',
      difficulty: 'intermediate',
      description: 'Support a mentee when their kindness effort doesn\'t go as planned.',
      scenario: 'Your mentee David made a card for a new classmate, but she threw it away without reading it. David is hurt and wants to give up on being kind.',
      learningPoints: [
        'Resilience in the face of rejection',
        'Understanding others\' perspectives',
        'Separating self-worth from others\' responses'
      ],
      suggestedApproaches: [
        'Validate their hurt feelings first',
        'Explore alternative explanations for rejection',
        'Reframe the value of kind intentions'
      ],
      extensionActivities: [
        'Practice responses to different reactions',
        'Develop a support network for mentees'
      ],
      isActive: true,
      sortOrder: 2
    }
  ];

  // Create scenarios
  for (const scenario of scenarios) {
    try {
      const existingScenario = await storage.getMentorScenarioByTitle(scenario.title);
      if (!existingScenario) {
        await storage.createMentorScenario(scenario);
      }
    } catch (error) {
      console.error(`Failed to create scenario "${scenario.title}":`, error);
    }
  }
}

async function createBasicConversations() {
  const conversations: InsertMentorConversation[] = [
    {
      title: 'First Meeting Success',
      category: 'connection',
      description: 'An example of how to start building trust in your first mentoring session.',
      participants: ['Mentor (Alex)', 'Mentee (Jamie, 4th grade)'],
      conversationFlow: [
        {
          speaker: 'Mentor',
          message: 'Hi Jamie! I\'m really excited to meet you. Should we find a comfortable spot to sit?',
          teachingPoint: 'Warm greeting, gives mentee control over environment'
        },
        {
          speaker: 'Mentee', 
          message: 'Okay... are you going to make me do weird activities?',
          teachingPoint: 'Testing boundaries, expressing natural concerns'
        },
        {
          speaker: 'Mentor',
          message: 'Ha! No weird activities, I promise. I\'m curious - what\'s something you\'re really excited about these days?',
          teachingPoint: 'Reassuring while redirecting to positive topics'
        },
        {
          speaker: 'Mentee',
          message: 'I really like building with LEGOs. I\'m working on this huge castle.',
          teachingPoint: 'Opening up, sharing an interest'
        },
        {
          speaker: 'Mentor',
          message: 'That sounds amazing! What\'s your favorite part about building the castle?',
          teachingPoint: 'Showing genuine interest, asking follow-up questions'
        }
      ],
      learningPoints: [
        'Start with mentee\'s interests to build connection',
        'Ask questions that develop empathy',
        'Let mentee guide the pace of sharing'
      ],
      isActive: true,
      sortOrder: 1
    },

    {
      title: 'Working Through Disappointment',
      category: 'guidance', 
      description: 'How to support a mentee when kindness doesn\'t go as planned.',
      participants: ['Mentor (Sarah)', 'Mentee (David, 3rd grade)'],
      conversationFlow: [
        {
          speaker: 'Mentee',
          message: 'I don\'t want to talk about kindness today. It\'s stupid.',
          teachingPoint: 'Expressing frustration, covering hurt feelings'
        },
        {
          speaker: 'Mentor',
          message: 'It sounds like something happened that was really disappointing. I\'m here to listen.',
          teachingPoint: 'Acknowledging feelings, offering support without pressure'
        },
        {
          speaker: 'Mentee',
          message: 'I made a card for the new girl and she just threw it away.',
          teachingPoint: 'Sharing the hurtful experience'
        },
        {
          speaker: 'Mentor',
          message: 'Oh David, that must have really hurt. You put effort into something special for her.',
          teachingPoint: 'Validating emotions, acknowledging the effort'
        }
      ],
      learningPoints: [
        'Validate emotions before problem-solving',
        'Help mentees see alternative explanations',
        'Separate kindness value from others\' responses'
      ],
      isActive: true,
      sortOrder: 2
    }
  ];

  // Create sample conversations
  for (const conversation of conversations) {
    try {
      const existingConversation = await storage.getMentorConversationByTitle(conversation.title);
      if (!existingConversation) {
        await storage.createMentorConversation(conversation);
      }
    } catch (error) {
      console.error(`Failed to create conversation "${conversation.title}":`, error);
    }
  }
}