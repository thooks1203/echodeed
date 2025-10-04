import type { InsertCurriculumLesson } from '@shared/schema';

// High School Kindness Curriculum (Grades 9-12) - Character Education for Ages 14-18
export const kindnessLessonTemplates: InsertCurriculumLesson[] = [
  {
    title: "Community Impact Research & Action",
    description: "Students conduct research on local community issues, interview stakeholders, and develop data-driven service projects that create measurable positive impact in their community.",
    gradeLevel: "9-12",
    subject: "Social Studies", 
    kindnessTheme: "Community Service", 
    difficulty: "Advanced",
    duration: 90,
    learningObjectives: [
      "Students will identify and research 3 specific community issues using data sources",
      "Students will conduct stakeholder interviews to understand community needs",
      "Students will design evidence-based service projects with measurable outcomes",
      "Students will present their findings and recommendations to community leaders"
    ],
    activities: [
      "Community Issue Data Analysis (30 min): Research community challenges using census data, local news, and municipal reports.",
      "Stakeholder Interview Project (35 min): Conduct structured interviews with community members, officials, and service providers.",
      "Evidence-Based Solution Design (25 min): Develop service projects with clear goals, success metrics, and implementation timelines."
    ],
    reflectionQuestions: [
      "How do community helpers make our lives better?",
      "What service project made the biggest impact?",
      "How can young people serve their community?"
    ],
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
      "community service - organized activity to help solve community problems",
      "civic responsibility - duty to participate in community improvement",
      "impact assessment - measuring the effects of your actions",
      "stakeholder - person or group affected by community issues"
    ],
    isActive: true
  },

  {
    title: "Breaking Down Barriers: Understanding Differences",
    description: "Students explore diversity, unconscious bias, and privilege while developing strategies to create inclusive environments for all classmates.",
    gradeLevel: "9-12",
    subject: "Language Arts",
    kindnessTheme: "Inclusion",
    difficulty: "Hard",
    duration: 90,
    learningObjectives: [
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
    reflectionQuestions: [
      "What did you learn about your own identity?",
      "How can we challenge unfair treatment?",
      "What makes a truly inclusive community?"
    ],
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
    isActive: true
  },

  {
    title: "Digital Citizenship and Online Kindness",
    description: "Students develop skills for positive online interactions, learn to combat cyberbullying, and create digital content that spreads kindness.",
    gradeLevel: "9-12",
    subject: "Technology/Language Arts",
    kindnessTheme: "Digital Kindness",
    difficulty: "Hard",
    duration: 75,
    learningObjectives: [
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
    reflectionQuestions: [
      "How can we spread kindness online?",
      "What's your responsibility as a digital citizen?",
      "How do your online actions affect others?"
    ],
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
      "digital footprint - the permanent trail of data you leave when using the internet",
      "cyberbullying - using technology to hurt, embarrass, or threaten someone repeatedly",
      "upstander - someone who speaks up when they see bullying or injustice",
      "digital citizenship - responsible and ethical use of technology and online resources",
      "digital empathy - understanding and caring about others' feelings in online interactions"
    ],
    isActive: true
  },

  {
    title: "Restorative Justice Circle: Healing Harm with Kindness",
    description: "Students learn restorative justice principles to repair relationships, build empathy, and create classroom communities focused on healing rather than punishment.",
    gradeLevel: "9-12",
    subject: "Character Education",
    kindnessTheme: "Conflict Resolution",
    difficulty: "Hard", 
    duration: 80,
    learningObjectives: [
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
    reflectionQuestions: [
      "How can we repair harm when someone is hurt?",
      "What does taking responsibility mean to you?",
      "How do circles help heal relationships?"
    ],
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
      "accountability - taking full responsibility for your actions and their consequences",
      "amends - concrete actions taken to repair harm you've caused",
      "circle keeper - the person who facilitates a restorative circle discussion",
      "community agreements - shared expectations created together for how to treat each other"
    ],
    isActive: true
  },

  {
    title: "Emotional Intelligence & Advanced Empathy Skills",
    description: "Students develop sophisticated emotional intelligence by analyzing complex social situations, practicing advanced perspective-taking, and creating comprehensive empathy action plans.",
    gradeLevel: "9-12",
    subject: "Character Education",
    kindnessTheme: "Empathy Development",
    difficulty: "Intermediate",
    duration: 75,
    learningObjectives: [
      "Students will identify complex emotions through subtle nonverbal cues",
      "Students will analyze multi-perspective scenarios involving social conflicts",
      "Students will demonstrate sophisticated empathetic responses to peer challenges",
      "Students will design and implement school-wide empathy initiatives"
    ],
    activities: [
      "Advanced Emotion Recognition (25 min): Analyze video scenarios to identify layered emotions and motivations behind behavior.",
      "Multi-Perspective Conflict Analysis (25 min): Examine school conflicts from all stakeholders' perspectives using case studies.",
      "Empathy Initiative Design (25 min): Create school programs to build empathy culture using data and feedback systems."
    ],
    reflectionQuestions: [
      "How do unmet needs drive difficult behaviors?",
      "When is empathy most challenging for you?",
      "How can empathy transform school culture?"
    ],
    materials: [
      "Video scenario library",
      "Emotion analysis worksheets", 
      "Multi-perspective case studies",
      "Conflict mapping templates",
      "Program design materials",
      "Data collection tools",
      "Presentation equipment",
      "Reflection journals"
    ],
    vocabulary: [
      "empathy - understanding and sharing someone else's feelings deeply",
      "perspective-taking - actively considering how someone else views a situation",
      "emotional regulation - managing your emotions in healthy ways",
      "social awareness - understanding group dynamics and social cues",
      "compassionate response - taking action to help based on understanding others' needs"
    ],
    isActive: true
  }
];

// Initialize curriculum lessons in database
export async function initializeCurriculumLessons(storage: any) {
  try {
    console.log('🎓 Initializing Middle School Kindness Curriculum...');
    
    // FORCE COMPREHENSIVE RE-SEEDING FOR COMPLETE DEMO DATA
    console.log('🔄 FORCE RE-SEEDING: Creating comprehensive curriculum lessons');
    const existingLessons = await storage.getCurriculumLessons();
    if (existingLessons && existingLessons.length > 0) {
      console.log('🔄 Re-creating curriculum lessons for comprehensive demo');
    }

    // Create all lesson templates
    for (const lesson of kindnessLessonTemplates) {
      await storage.createCurriculumLesson(lesson);
    }

    console.log(`✅ Middle School Curriculum initialized with ${kindnessLessonTemplates.length} lessons!`);
    console.log('📚 All lessons designed specifically for grades 6-12 (ages 11-18)');
    console.log('🎯 Themes: Community Service, Inclusion, Digital Kindness, Conflict Resolution, Empathy');
    console.log('🏫 Ready to transform middle school classrooms with evidence-based character education!');
    
  } catch (error: any) {
    console.error('Failed to initialize curriculum lessons:', error.message);
    throw error;
  }
}