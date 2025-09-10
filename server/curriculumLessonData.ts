import type { InsertCurriculumLesson } from '@shared/schema';

// Comprehensive K-8 Kindness Curriculum Lesson Templates
export const kindnessLessonTemplates: InsertCurriculumLesson[] = [
  // KINDERGARTEN - GRADE 2 LESSONS (Ages 5-8)
  {
    title: "The Power of Thank You",
    description: "Students discover the joy of gratitude and learn to express thanks in meaningful ways to family, friends, and community helpers.",
    gradeLevel: "K-2",
    subject: "Character Education",
    kindnessTheme: "Gratitude",
    difficulty: "Easy", 
    duration: 30,
    objectives: [
      "Students will understand what gratitude means and feels like",
      "Students will identify 3 things they are thankful for each day",
      "Students will practice saying thank you with eye contact and sincerity",
      "Students will create thank you cards for people who help them"
    ],
    activities: [
      "Gratitude Circle Time (10 min): Students sit in a circle and share one thing they're thankful for today using a gratitude bear.",
      "Thank You Card Creation (15 min): Students create colorful thank you cards for school helpers like custodians and cafeteria workers.",
      "Gratitude Walk (5 min): Take a brief walk to deliver thank you cards and practice expressing gratitude in person."
    ],
    assessment: "Observation checklist: Student explains gratitude, identifies thankful moments, makes eye contact when saying thank you, shows enthusiasm.",
    materials: [
      "Gratitude bear or special object",
      "Construction paper (various colors)",
      "Crayons and markers", 
      "Stickers",
      "Child-safe scissors",
      "Circle time carpet"
    ],
    vocabulary: [
      "grateful - feeling thankful for something good",
      "thankful - happy about something someone did for you", 
      "appreciate - to value something or someone",
      "kindness - being friendly and helpful"
    ],
    kindnessSkills: ["Gratitude", "Expression", "Recognition", "Appreciation"],
    selStandards: ["Self-Awareness", "Social Skills", "Relationship Building"],
    isActive: true
  },

  {
    title: "Including Everyone at Play",
    description: "Students learn to recognize when someone feels left out and practice specific strategies to include others in games and activities.",
    gradeLevel: "K-2", 
    subject: "Social Studies",
    kindnessTheme: "Inclusion",
    difficulty: "Easy",
    duration: 35,
    objectives: [
      "Students will identify signs that someone feels left out",
      "Students will use the 'magic inclusion words' to invite others to play",
      "Students will modify games to include everyone",
      "Students will understand how inclusion makes everyone feel good"
    ],
    activities: [
      "Sad Sam Story (10 min): Read a picture book about inclusion and discuss feelings when left out.",
      "Magic Inclusion Words Practice (10 min): Learn and practice phrases like 'Want to play with us?' and 'Come sit by me!'",
      "Playground Problem Solving (15 min): Modify games to include everyone, even those with different abilities."
    ],
    assessment: "Role-play assessment: Student uses inclusion words, notices exclusion, modifies activities, understands inclusion benefits.",
    materials: [
      "Picture book about inclusion/exclusion",
      "Emotion cards with faces",
      "Magic wand prop",
      "Magic inclusion phrase cards",
      "Game scenario cards",
      "Chart paper for poster",
      "Inclusion wizard badges"
    ],
    vocabulary: [
      "include - to let someone join in",
      "exclude - to leave someone out", 
      "belong - to feel like you fit in",
      "friendship - caring about each other"
    ],
    kindnessSkills: ["Inclusion", "Empathy", "Problem-solving", "Friendship"],
    selStandards: ["Social Awareness", "Relationship Skills", "Responsible Decision Making"],
    isActive: true
  },

  // GRADES 3-5 LESSONS (Ages 8-11)
  {
    title: "Empathy Detectives",
    description: "Students develop empathy skills by learning to read body language, tone of voice, and facial expressions to understand how others feel.",
    gradeLevel: "3-5",
    subject: "Character Education", 
    kindnessTheme: "Empathy",
    difficulty: "Medium",
    duration: 45,
    objectives: [
      "Students will identify at least 5 different emotions through body language",
      "Students will practice perspective-taking in various scenarios",
      "Students will demonstrate empathetic responses to others' feelings",
      "Students will create an empathy action plan for their classroom"
    ],
    activities: [
      "Body Language Detective Game (15 min): Students act out emotions using only body language while others guess and explain clues.",
      "Perspective-Taking Theater (20 min): Role-play scenarios from different characters' perspectives to understand varied feelings.",
      "Empathy Action Plan Creation (10 min): Create practical strategies for showing empathy in daily classroom situations."
    ],
    assessment: "Performance assessment: Student identifies emotions, demonstrates perspective-taking, suggests empathetic responses.",
    materials: [
      "Emotion cards with various feelings",
      "Detective badges",
      "Observation recording sheets", 
      "Scenario role-play cards",
      "Simple costume props",
      "Action plan templates",
      "Markers and colored pencils",
      "Poster board"
    ],
    vocabulary: [
      "empathy - understanding and sharing someone else's feelings",
      "perspective - how someone else sees or experiences something",
      "body language - communicating through posture and gestures",
      "compassion - caring about others' suffering and wanting to help"
    ],
    kindnessSkills: ["Empathy", "Perspective-taking", "Emotional awareness", "Compassionate response"],
    selStandards: ["Self-Awareness", "Social Awareness", "Relationship Skills"],
    isActive: true
  },

  {
    title: "Community Kindness Champions",
    description: "Students research local community helpers and design a service project to show appreciation for people who make their community better.",
    gradeLevel: "3-5",
    subject: "Social Studies",
    kindnessTheme: "Community Service", 
    difficulty: "Medium",
    duration: 60,
    objectives: [
      "Students will identify at least 8 different community helpers and their roles",
      "Students will research how community helpers serve others",
      "Students will plan and execute a community service project",
      "Students will reflect on how their actions impact the community"
    ],
    activities: [
      "Community Helper Research (20 min): Research different community helpers using books, videos, and interviews.",
      "Service Project Planning (25 min): Design and plan realistic community service projects to help community helpers.",
      "Kindness in Action Implementation (15 min): Begin implementing service projects by creating thank you items."
    ],
    assessment: "Project-based assessment: Student completes research, contributes to planning, participates in implementation.",
    materials: [
      "Community helper research books",
      "Research worksheet templates",
      "Interview question guides",
      "Project planning templates",
      "Brainstorming worksheets",
      "Thank you card supplies",
      "Care package materials",
      "Cameras for documentation",
      "Reflection journals"
    ],
    vocabulary: [
      "community - a group of people living in the same area",
      "service - work done to help others",
      "appreciation - recognizing and valuing someone's efforts",
      "impact - the effect your actions have on others"
    ],
    kindnessSkills: ["Community service", "Appreciation", "Planning", "Collaboration"],
    selStandards: ["Social Awareness", "Responsible Decision Making", "Relationship Skills"],
    isActive: true
  },

  // GRADES 6-8 LESSONS (Ages 11-14)
  {
    title: "Breaking Down Barriers: Understanding Differences",
    description: "Students explore diversity, unconscious bias, and privilege while developing strategies to create inclusive environments for all classmates.",
    gradeLevel: "6-8",
    subject: "Language Arts",
    kindnessTheme: "Inclusion",
    difficulty: "Hard",
    duration: 90,
    objectives: [
      "Students will identify different types of diversity in their school and community",
      "Students will recognize unconscious biases and their impact on others",
      "Students will develop strategies for creating inclusive environments",
      "Students will create inclusive media campaigns for their school"
    ],
    activities: [
      "Diversity Mapping and Privilege Walk (30 min): Explore identity aspects and examine how privilege affects experiences.",
      "Unconscious Bias Investigation (30 min): Learn about bias through scenarios and analyze bias in media and daily life.",
      "Inclusive Campaign Creation (30 min): Design campaigns promoting inclusion using digital tools and posters."
    ],
    assessment: "Portfolio assessment: Student demonstrates diversity understanding, identifies biases, creates inclusive campaigns.",
    materials: [
      "Identity wheel worksheets",
      "Privilege reflection questions",
      "Bias scenario cards",
      "Media analysis examples",
      "Research access (computers/tablets)",
      "Campaign design materials",
      "Poster supplies",
      "Digital design tools",
      "Presentation equipment"
    ],
    vocabulary: [
      "diversity - the variety of different identities and experiences",
      "unconscious bias - automatic preferences we have without realizing it",
      "privilege - unearned advantages some people have",
      "inclusion - actively welcoming and valuing all people",
      "equity - fairness that takes different needs into account"
    ],
    kindnessSkills: ["Inclusion", "Cultural awareness", "Bias recognition", "Advocacy"],
    selStandards: ["Self-Awareness", "Social Awareness", "Responsible Decision Making"],
    isActive: true
  },

  {
    title: "Digital Citizenship and Online Kindness",
    description: "Students develop skills for positive online interactions, learn to combat cyberbullying, and create digital content that spreads kindness.",
    gradeLevel: "6-8",
    subject: "Technology/Language Arts",
    kindnessTheme: "Digital Kindness",
    difficulty: "Hard",
    duration: 75,
    objectives: [
      "Students will identify characteristics of positive digital citizenship",
      "Students will develop strategies for responding to cyberbullying",
      "Students will create digital content that promotes kindness and inclusion",
      "Students will establish personal guidelines for online interactions"
    ],
    activities: [
      "Digital Footprint Analysis (25 min): Examine examples of positive and negative digital footprints to understand lasting impact.",
      "Cyberbullying Response Training (25 min): Learn STOP-BLOCK-TELL strategy and practice responding to cyberbullying scenarios.",
      "Kindness Content Creation (25 min): Create positive digital content like videos or campaigns promoting kindness online."
    ],
    assessment: "Digital portfolio assessment: Student understands digital citizenship, responds to cyberbullying, creates kindness content.",
    materials: [
      "Computers/tablets with internet access",
      "Digital footprint example materials",
      "Cyberbullying scenario cards",
      "Video recording equipment",
      "Digital design software",
      "Content creation apps",
      "Digital citizenship resource guides",
      "Online safety guidelines"
    ],
    vocabulary: [
      "digital footprint - the trail of data you leave when using the internet",
      "cyberbullying - using technology to hurt, embarrass, or threaten someone",
      "upstander - someone who speaks up when they see bullying",
      "digital citizenship - responsible and appropriate use of technology"
    ],
    kindnessSkills: ["Digital citizenship", "Upstander behavior", "Online communication", "Content creation"],
    selStandards: ["Self-Management", "Social Awareness", "Responsible Decision Making"],
    isActive: true
  },

  {
    title: "Restorative Justice Circle: Healing Harm with Kindness",
    description: "Students learn restorative justice principles to repair relationships, build empathy, and create classroom communities focused on healing rather than punishment.",
    gradeLevel: "6-8",
    subject: "Character Education",
    kindnessTheme: "Conflict Resolution",
    difficulty: "Hard", 
    duration: 80,
    objectives: [
      "Students will understand restorative vs. punitive approaches to conflict",
      "Students will practice using restorative circle processes",
      "Students will develop skills for taking responsibility and making amends",
      "Students will create classroom agreements based on restorative principles"
    ],
    activities: [
      "Introduction to Restorative Justice (25 min): Learn principles and compare to traditional punishment using case studies.",
      "Restorative Circle Practice (30 min): Practice facilitating circles using role-play scenarios and talking pieces.",
      "Classroom Agreement Creation (25 min): Collaboratively create classroom agreements based on restorative principles."
    ],
    assessment: "Authentic assessment: Student understands restorative justice, participates in circles, takes responsibility.",
    materials: [
      "Restorative justice educational materials",
      "Circle guidelines poster",
      "Talking piece (special object)",
      "Conflict scenario cards",
      "Circle reflection sheets",
      "Classroom agreement templates",
      "Chart paper and markers",
      "Implementation planning materials"
    ],
    vocabulary: [
      "restorative justice - focusing on healing and repairing harm rather than punishment",
      "accountability - taking responsibility for your actions",
      "amends - actions taken to repair harm you've caused",
      "circle keeper - the person who facilitates a restorative circle"
    ],
    kindnessSkills: ["Conflict resolution", "Accountability", "Empathy", "Community building"],
    selStandards: ["Self-Management", "Social Awareness", "Relationship Skills", "Responsible Decision Making"],
    isActive: true
  }
];

// Initialize curriculum lessons in database
export async function initializeCurriculumLessons(storage: any) {
  try {
    console.log('🎓 Initializing Kindness Curriculum Lessons...');
    
    // Check if lessons already exist
    const existingLessons = await storage.getCurriculumLessons();
    if (existingLessons && existingLessons.length > 0) {
      console.log('✅ Curriculum lessons already exist, skipping initialization');
      return;
    }

    // Create all lesson templates
    for (const lesson of kindnessLessonTemplates) {
      await storage.createCurriculumLesson(lesson);
    }

    console.log(`✅ Curriculum initialized with ${kindnessLessonTemplates.length} kindness lessons!`);
    console.log('📚 Lessons span K-8 with age-appropriate activities');
    console.log('🎯 Themes include: Gratitude, Inclusion, Empathy, Community Service, Digital Kindness, Conflict Resolution');
    console.log('📖 Ready to transform classrooms with research-based character education!');
    
  } catch (error: any) {
    console.error('Failed to initialize curriculum lessons:', error.message);
    throw error;
  }
}