import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Trophy, 
  BookOpen, 
  Star, 
  Heart, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Play,
  Lightbulb,
  GraduationCap,
  X
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useState } from "react";
import { useLocation } from "wouter";

type Mentorship = {
  id: string;
  menteeId: string;
  menteeName: string;
  status: string;
  startedAt: string;
  kindnessGoal: string;
  progressNotes: string;
  nextSessionAt?: string;
};

type MentorBadge = {
  id: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
  category: string;
  tier: string;
  tokenReward: number;
  earnedAt?: string;
};

type MentorActivity = {
  id: string;
  activityType: string;
  description: string;
  scheduledAt: string;
  isCompleted: boolean;
  mentorReflection?: string;
  menteeReflection?: string;
};

type MentorStats = {
  totalMentees: number;
  activeMentorships: number;
  totalSessions: number;
  avgRating: number;
  totalKindnessActsGuided: number;
  totalTokensEarned: number;
  badgesEarned: number;
  mentorLevel: number;
  nextLevelProgress: number;
  impactScore: number;
};

type TrainingModule = {
  id: string;
  title: string;
  description: string;
  trainingType: string;
  durationMinutes: number;
  isRequired: boolean;
  certificateReward: number;
  completed?: boolean;
  content?: any;
};

const trainingContent: Record<string, {
  lessons: { title: string; content: string; activity?: string; scenario?: { situation: string; options: string[]; bestChoice: number; explanation: string } }[];
  quiz: { question: string; options: string[]; correct: number }[];
  reflection: string;
}> = {
  'Welcome to Kindness Mentoring': {
    lessons: [
      {
        title: 'What is Kindness Mentoring?',
        content: 'As a Kindness Mentor, you help younger students discover the joy of spreading kindness. You\'re not just teaching - you\'re inspiring! Your role is to guide, support, and celebrate their kindness journey.\n\nMentoring is different from teaching because you\'re building a personal relationship based on trust, encouragement, and shared experiences. Your mentee will look up to you as someone who believes in them.',
        activity: 'Think about a time someone showed you kindness. How did it make you feel? Write down 3 feelings you experienced.'
      },
      {
        title: 'The Four Pillars of Mentoring',
        content: '1. GUIDE, don\'t direct - Ask questions that help mentees think for themselves\n2. LISTEN actively - Pay full attention to their ideas and feelings\n3. ENCOURAGE creativity - Support their unique kindness ideas\n4. CELEBRATE progress - Recognize every act of kindness, big or small\n\nThese four pillars work together. When you guide with questions, you naturally listen to their answers. When you encourage their ideas, you have more to celebrate!',
        activity: 'Practice asking "What do you think would help?" instead of giving direct answers.',
        scenario: {
          situation: 'Your mentee says: "I want to do something nice for the new kid, but I don\'t know what."',
          options: [
            'Tell them exactly what to do: "Just share your lunch with them."',
            'Ask: "What do you think would make someone feel welcome? What would YOU want if you were new?"',
            'Say: "That\'s too hard. Let\'s think of something easier."',
            'Change the subject to something else.'
          ],
          bestChoice: 1,
          explanation: 'Great mentors GUIDE by asking questions that help mentees discover their own answers. This builds their confidence and creativity!'
        }
      },
      {
        title: 'Being a Role Model',
        content: 'Your mentee will look up to you! Show kindness in your own actions, be patient when things don\'t go perfectly, and always speak positively about others.\n\nRemember: They\'re watching how YOU treat people, how you handle frustration, and how you talk about others when they\'re not around. Your actions teach more than your words.',
        activity: 'For the next 24 hours, notice your own acts of kindness. How many can you count?'
      },
      {
        title: 'Your Mentoring Style',
        content: 'Everyone has a unique mentoring style based on their personality and strengths. Some mentors are:\n\n• The Encourager - Always finding something positive to say\n• The Creative - Full of fun activity ideas\n• The Listener - Making mentees feel truly heard\n• The Problem-Solver - Helping overcome obstacles\n\nYou don\'t have to pick just one! The best mentors combine different styles based on what their mentee needs.',
        activity: 'Which mentoring style feels most natural to you? Which one might you need to practice more?'
      },
      {
        title: 'Setting Up for Success',
        content: 'Before your first session with a mentee, prepare yourself:\n\n✓ Review what you know about them (grade, interests if shared)\n✓ Prepare 2-3 conversation starters\n✓ Think of a kindness story from your own life to share\n✓ Have a backup activity ready in case they\'re shy\n✓ Remember: It\'s okay to feel nervous - they probably are too!',
        scenario: {
          situation: 'It\'s your first meeting with your mentee. They seem nervous and won\'t make eye contact.',
          options: [
            'Ask them lots of questions quickly to get them talking.',
            'Share something about yourself first to help them feel comfortable.',
            'Tell them they need to speak up or this won\'t work.',
            'Sit in silence until they talk.'
          ],
          bestChoice: 1,
          explanation: 'Sharing about yourself first (like a favorite hobby or a funny story) helps break the ice. It shows you\'re a real person and makes it easier for them to open up.'
        }
      },
      {
        title: 'The Mentor\'s Promise',
        content: 'As a Kindness Mentor, you make these promises to your mentee:\n\n🤝 I will show up when I say I will\n👂 I will listen without judgment\n💪 I will believe in you, even when you don\'t believe in yourself\n🎉 I will celebrate your kindness, big or small\n❤️ I will be patient as we learn together\n\nThese promises build the foundation of trust that makes mentoring work.',
        activity: 'Which promise do you think will be easiest for you to keep? Which might be challenging?'
      }
    ],
    quiz: [
      {
        question: 'What should you do when your mentee has a kindness idea?',
        options: ['Tell them your better idea', 'Support and encourage their idea', 'Ignore it and move on', 'Say it won\'t work'],
        correct: 1
      },
      {
        question: 'Which is the BEST way to help a mentee?',
        options: ['Do everything for them', 'Ask questions that help them think', 'Give them all the answers', 'Tell them what to do'],
        correct: 1
      },
      {
        question: 'What does GUIDE mean in the Four Pillars?',
        options: ['Give direct instructions', 'Ask questions to help them think for themselves', 'Tell them what\'s right and wrong', 'Show them exactly what to do'],
        correct: 1
      },
      {
        question: 'When meeting a shy mentee for the first time, you should:',
        options: ['Ask lots of rapid-fire questions', 'Share something about yourself first', 'Wait silently until they talk', 'Tell them they need to speak up'],
        correct: 1
      },
      {
        question: 'Which is NOT part of the Mentor\'s Promise?',
        options: ['I will show up when I say I will', 'I will always have perfect answers', 'I will listen without judgment', 'I will celebrate your kindness'],
        correct: 1
      }
    ],
    reflection: 'What quality do you think makes the best mentor? How will you use that quality with your mentee? Think about a mentor you\'ve had (teacher, coach, older sibling) - what did they do that made a difference for you?'
  },
  'Building Trust and Connection': {
    lessons: [
      {
        title: 'Why Trust Matters',
        content: 'Trust is the foundation of any great mentoring relationship. When your mentee trusts you, they\'ll feel safe to share ideas, try new things, and even make mistakes without fear of judgment.\n\nBuilding trust doesn\'t happen overnight - it\'s built through consistent small actions over time. Every time you keep a promise, listen carefully, or remember something they told you, you\'re adding to the trust bank.',
        activity: 'Remember a teacher or coach you really trusted. What specific things did they do to earn that trust? List at least 3.'
      },
      {
        title: 'The Trust Equation',
        content: 'Trust is built through a simple formula:\n\nTRUST = Reliability + Credibility + Connection - Self-Interest\n\n• Reliability: Do what you say you\'ll do\n• Credibility: Know what you\'re talking about\n• Connection: Show you genuinely care\n• Self-Interest: Put their needs before yours\n\nThe more you focus on THEM (not yourself), the faster trust grows.',
        activity: 'Rate yourself 1-5 on each part of the trust equation. Which area can you improve?'
      },
      {
        title: 'Building Connection',
        content: 'Use these trust-building strategies:\n\n• Use their name frequently - it shows you care and remember them\n• Show genuine interest in their world - ask about their hobbies, friends, and what makes them excited\n• Share appropriate experiences from your own life first - this shows vulnerability and makes them comfortable\n• Be reliable and consistent - always keep your promises, even small ones\n• Remember details they share - asking "How did your soccer game go?" shows you were listening',
        activity: 'Practice introducing yourself and finding 3 things in common with someone new.',
        scenario: {
          situation: 'Your mentee mentions they have a dog named Max. Two weeks later, you meet again.',
          options: [
            'Start talking about the kindness activity right away.',
            'Ask "How\'s Max doing? Has he learned any new tricks?"',
            'Say "Do you have any pets?"',
            'Talk about your own pet instead.'
          ],
          bestChoice: 1,
          explanation: 'Remembering and asking about details they shared (like their dog\'s name) shows you were really listening and that you care about their life!'
        }
      },
      {
        title: 'Active Listening Skills',
        content: 'Active listening is a superpower that most people never develop. Here\'s how to do it:\n\n👀 Eyes: Put away distractions, make comfortable eye contact\n🧠 Mind: Focus on understanding, not on what you\'ll say next\n😊 Body: Nod, lean in slightly, show you\'re engaged\n❓ Questions: Ask follow-up questions like "Tell me more about that"\n🔄 Reflect: Summarize what they said to show you understood\n\nNever interrupt! Let them finish their thoughts completely.',
        activity: 'Try the 2-minute challenge: Listen to a friend for 2 full minutes without interrupting once, then summarize what they said.'
      },
      {
        title: 'Reading Body Language',
        content: 'Your mentee might not always tell you how they\'re feeling with words. Learn to read their body language:\n\n😊 Engaged: Leaning forward, eye contact, nodding\n😟 Uncomfortable: Crossed arms, looking away, fidgeting\n😔 Sad: Slumped shoulders, quiet voice, slow responses\n😤 Frustrated: Clenched fists, short answers, sighing\n\nWhen you notice these signs, gently check in: "You seem a little quiet today. Is everything okay?"',
        scenario: {
          situation: 'Your mentee is sitting with crossed arms and looking at the floor. When you ask about their week, they just say "Fine."',
          options: [
            'Accept "fine" as an answer and move on to the activity.',
            'Say "You don\'t seem fine. Tell me what\'s wrong right now."',
            'Gently say "I notice you seem a little different today. Want to talk about anything?"',
            'Ignore it and hope they\'ll cheer up.'
          ],
          bestChoice: 2,
          explanation: 'A gentle, non-pressuring check-in shows you notice and care, while giving them the choice to share or not. Forcing them to talk can break trust.'
        }
      },
      {
        title: 'When Things Get Hard',
        content: 'Sometimes mentees feel shy, frustrated, or don\'t want to participate. That\'s okay! Here\'s what to do:\n\n😶 If they\'re shy: Give them time, share about yourself first, use activities instead of just talking\n😤 If they\'re frustrated: Acknowledge their feelings, take a break, simplify the task\n🙅 If they don\'t want to participate: Ask what\'s going on, offer choices, don\'t force it\n\nRemember: Building trust takes time. Some days will be harder than others, and that\'s completely normal.',
        activity: 'Think of a time YOU felt shy or didn\'t want to participate in something. What would have helped you?'
      },
      {
        title: 'Handling Mistakes Gracefully',
        content: 'Everyone makes mistakes - including you! How you handle mistakes affects trust:\n\nWhen THEY make a mistake:\n• Don\'t make a big deal of it\n• Say "That\'s okay! Let\'s try again."\n• Share a time you made a similar mistake\n\nWhen YOU make a mistake:\n• Admit it honestly: "I was wrong about that"\n• Apologize if needed: "I\'m sorry I forgot our meeting"\n• Show how you\'ll do better: "I\'ll set a reminder next time"\n\nBeing honest about mistakes actually BUILDS trust!',
        scenario: {
          situation: 'You accidentally forgot about a scheduled meeting with your mentee.',
          options: [
            'Pretend it didn\'t happen and don\'t mention it.',
            'Make up an excuse like "Something important came up."',
            'Apologize sincerely, explain you forgot, and promise to set reminders.',
            'Blame them for not reminding you.'
          ],
          bestChoice: 2,
          explanation: 'Honest apologies build trust. Making excuses or pretending it didn\'t happen damages the relationship because kids can usually tell when adults aren\'t being truthful.'
        }
      },
      {
        title: 'Creating a Safe Space',
        content: 'Your mentee needs to know that your time together is a judgment-free zone where they can:\n\n✅ Share ideas without being laughed at\n✅ Make mistakes without being criticized\n✅ Express feelings without being dismissed\n✅ Ask questions without feeling "dumb"\n✅ Be themselves without pretending\n\nYou create this safe space through your words, reactions, and body language. When they share something vulnerable, protect it carefully.',
        activity: 'Think of a place or person that feels "safe" to you. What makes it feel that way? How can you create that feeling for your mentee?'
      }
    ],
    quiz: [
      {
        question: 'What helps build trust with your mentee?',
        options: ['Being unreliable', 'Using their name and showing interest', 'Talking about yourself the whole time', 'Looking at your phone while they talk'],
        correct: 1
      },
      {
        question: 'What should you do if your mentee is shy?',
        options: ['Force them to talk', 'Get frustrated', 'Be patient and share about yourself first', 'Give up on them'],
        correct: 2
      },
      {
        question: 'Active listening includes all of these EXCEPT:',
        options: ['Making eye contact', 'Asking follow-up questions', 'Thinking about what you\'ll say next while they talk', 'Summarizing what they said'],
        correct: 2
      },
      {
        question: 'If your mentee seems upset but says they\'re "fine," you should:',
        options: ['Accept it and move on', 'Force them to tell you what\'s wrong', 'Gently say you noticed they seem different and ask if they want to talk', 'Ignore their feelings'],
        correct: 2
      },
      {
        question: 'When YOU make a mistake as a mentor, the best thing to do is:',
        options: ['Pretend it didn\'t happen', 'Make up an excuse', 'Admit it honestly and apologize', 'Blame someone else'],
        correct: 2
      },
      {
        question: 'Remembering details your mentee shared (like their pet\'s name) shows:',
        options: ['You have a good memory', 'You were really listening and you care', 'You\'re trying to show off', 'Nothing important'],
        correct: 1
      }
    ],
    reflection: 'Think of a time you felt really listened to and understood. How did that person make you feel? What specific things did they do? Now imagine giving that same gift of being heard to your mentee. How will you create that feeling for them?'
  },
  'Inspiring Kindness Creativity': {
    lessons: [
      {
        title: 'The SPARK Framework',
        content: 'Use SPARK to help mentees discover their unique kindness style:\n\n⭐ S - Strengths: Connect kindness to what they\'re already good at\n💡 P - Problem-solving: Turn their concerns into kindness opportunities\n🏃 A - Action-oriented: Move from ideas to reality with small steps\n🌊 R - Ripple effect: Help them see the broader impact of their kindness\n🔄 K - Keep sustainable: Make kindness a lasting habit, not just one-time\n\nThis framework helps you guide conversations and generate ideas together.',
        activity: 'Think of your own strengths. How could you use them to spread kindness? (Example: If you\'re good at art, you could make cards for people having a hard day.)'
      },
      {
        title: 'Discovering Their Strengths',
        content: 'Every kid has unique strengths that can become kindness superpowers:\n\n🎨 Creative kids: Can make cards, posters, or art projects for others\n⚽ Athletic kids: Can include others in games, teach younger kids\n📚 Bookworm kids: Can read to younger students, share book recommendations\n🗣️ Social kids: Can welcome new students, introduce people to each other\n🔧 Problem-solvers: Can help classmates with difficult tasks\n\nYour job is to help them see their strengths as tools for kindness!',
        scenario: {
          situation: 'Your mentee loves video games and spends most of their free time playing. They say they can\'t think of any kindness ideas.',
          options: [
            'Tell them video games are a waste of time and suggest something else.',
            'Help them see how gaming can connect to kindness: teaching others to play, including lonely classmates in games, being a good sport.',
            'Say that\'s okay and pick a kindness idea for them.',
            'Give up on connecting their interests to kindness.'
          ],
          bestChoice: 1,
          explanation: 'Every interest can connect to kindness! Gaming can lead to including others, teaching patience, being a good sport, or even raising money for charity through gaming events.'
        }
      },
      {
        title: 'Brainstorming Kindness Ideas',
        content: 'Great mentors help generate ideas! Try these brainstorming techniques:\n\n🤔 "What If" questions:\n• "What if everyone in your class smiled at one new person today?"\n• "What if you could make someone\'s day 10% better?"\n\n💡 Building on interests:\n• If they love art → make cards for lonely classmates\n• If they love animals → collect supplies for the animal shelter\n\n📏 Small + consistent > Big + rare:\n• Daily small kindnesses create bigger impact than one big gesture\n\nThe goal is for THEM to come up with ideas, with your guidance!',
        activity: 'Generate 5 kindness ideas that a 4th grader could do in just 5 minutes at school.'
      },
      {
        title: 'The Kindness Planning Method',
        content: 'Help your mentee turn ideas into action with this simple planning method:\n\n1️⃣ WHAT will you do? (Be specific!)\n2️⃣ WHO will it help?\n3️⃣ WHEN will you do it?\n4️⃣ WHERE will it happen?\n5️⃣ WHAT might go wrong? (Plan B!)\n\nExample:\n• WHAT: Write an encouraging note\n• WHO: A classmate who seems sad\n• WHEN: Tomorrow during lunch\n• WHERE: In the cafeteria\n• PLAN B: If they\'re not there, leave it on their desk',
        activity: 'Pick one kindness idea and walk through all 5 planning questions.',
        scenario: {
          situation: 'Your mentee says "I want to be nice to everyone!" but can\'t name a specific action.',
          options: [
            'Say "That\'s great!" and leave it at that.',
            'Help them get specific: "That\'s wonderful! Let\'s pick ONE person and ONE thing you\'ll do for them this week."',
            'Tell them their idea is too vague.',
            'Give them a specific action to do instead.'
          ],
          bestChoice: 1,
          explanation: 'Vague intentions rarely become actions. Helping them get specific (one person, one action, one timeline) makes it much more likely to actually happen!'
        }
      },
      {
        title: 'Overcoming Obstacles',
        content: 'What happens when kindness gets rejected? Help your mentee understand:\n\n❌ Not everyone will respond positively, and that\'s okay\n💎 The VALUE is in the intention and effort, not just the outcome\n🎯 Every "no" brings them closer to a meaningful "yes"\n🦁 Rejection is part of being brave enough to try\n\nPrepare them for possible obstacles:\n• What if they\'re busy?\n• What if they say no?\n• What if someone laughs?\n\nRole-play these scenarios so they feel ready!',
        activity: 'Role-play: How would you respond if your mentee\'s kindness was ignored or rejected? Practice saying supportive things.'
      },
      {
        title: 'When Kindness Doesn\'t Go as Planned',
        content: 'Sometimes kindness attempts don\'t work out:\n\n😞 The person didn\'t notice\n😕 They said "no thanks"\n😢 Someone made fun of the idea\n😤 It backfired somehow\n\nHere\'s what to say:\n• "I\'m so proud of you for trying!"\n• "It takes courage to be kind. That courage still counts."\n• "What did you learn? What might you try differently?"\n• "One person\'s reaction doesn\'t define your kindness."\n\nNever let a setback discourage them from trying again!',
        scenario: {
          situation: 'Your mentee made a friendship bracelet for a classmate, but the classmate said "I don\'t want that" and walked away. Your mentee is upset.',
          options: [
            'Say "Well, that person is just mean. Forget about them."',
            'Tell them they shouldn\'t have made the bracelet.',
            'Acknowledge their feelings, praise their courage, and help them see that the VALUE was in the kind intention.',
            'Change the subject to avoid the uncomfortable feelings.'
          ],
          bestChoice: 2,
          explanation: 'First acknowledge their feelings (validation), then praise their courage (encouragement), and finally help them see the value was in trying (reframing). This builds resilience!'
        }
      },
      {
        title: 'Celebrating Kindness Wins',
        content: 'Recognition fuels motivation! Celebrate every win:\n\n🙌 High-fives and genuine, specific praise\n📢 Share their success stories (with permission)\n👀 Help them SEE the impact they\'ve made\n🎉 Encourage them to celebrate others too\n\nBe specific with praise:\n❌ "Good job" (vague)\n✅ "I love how you noticed she was sitting alone and invited her to join you. That took courage!" (specific)\n\nSpecific praise teaches them what to repeat!',
        activity: 'Think of 3 specific ways you could celebrate a mentee\'s kindness act. Be as detailed as possible.'
      },
      {
        title: 'Creating Kindness Ripples',
        content: 'One act of kindness creates ripples that spread far beyond what we can see:\n\n🪨 → 🌊 → 🌊 → 🌊\n\n• You help your mentee be kind\n• That person feels good and is kind to someone else\n• That person passes it on...\n• The ripple keeps spreading!\n\nHelp your mentee understand that their small actions can inspire others, change someone\'s day, or even start a kindness chain. They may never see all the ripples they create, but they\'re real!',
        activity: 'Can you think of a time when one person\'s kindness inspired you to be kind to someone else? That\'s the ripple effect in action!'
      },
      {
        title: 'Building Kindness Habits',
        content: 'The goal isn\'t just one-time kindness - it\'s building a kindness HABIT:\n\n📅 Habit stacking: "After I eat lunch, I\'ll say something nice to one person"\n🎯 Start small: One act per day is better than trying to do everything\n📝 Track it: Keep a simple kindness journal\n🔄 Reflect: "What kindness did I do today? How did it feel?"\n\nHelp your mentee find their "kindness trigger" - something that reminds them to be kind every day.',
        activity: 'Create a kindness habit plan: "After I _____, I will _____ (one small kindness)."'
      }
    ],
    quiz: [
      {
        question: 'What does the "S" in SPARK stand for?',
        options: ['Sharing', 'Strengths', 'Smiling', 'Speaking'],
        correct: 1
      },
      {
        question: 'If your mentee\'s kindness gets rejected, what should you do?',
        options: ['Tell them to stop being kind', 'Help them understand the value was in trying', 'Ignore the situation', 'Be angry at the person who rejected them'],
        correct: 1
      },
      {
        question: 'What creates more impact over time?',
        options: ['One big random act of kindness', 'Many small consistent acts of kindness', 'Only being kind on holidays', 'Kindness only when others are watching'],
        correct: 1
      },
      {
        question: 'When brainstorming kindness ideas with your mentee, you should:',
        options: ['Tell them exactly what to do', 'Ask questions to help them come up with their own ideas', 'Say their ideas won\'t work', 'Skip brainstorming and assign an activity'],
        correct: 1
      },
      {
        question: 'Which is the BEST way to praise a mentee\'s kindness?',
        options: ['"Good job"', '"Nice!"', '"I love how you noticed she was alone and invited her to join. That took courage!"', '"You\'re the best"'],
        correct: 2
      },
      {
        question: 'What is the "ripple effect" of kindness?',
        options: ['Kindness only affects one person', 'One act of kindness can inspire others and spread', 'Kindness eventually runs out', 'Only big acts of kindness matter'],
        correct: 1
      }
    ],
    reflection: 'What unique kindness "superpower" do you have based on your interests and strengths? How will you help your mentee discover theirs? Write down one specific way you can connect their interests to kindness opportunities.'
  }
};

export default function MentorDashboard() {
  const [selectedTab, setSelectedTab] = useState("training");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedTraining, setSelectedTraining] = useState<TrainingModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Fetch mentor data
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/mentor/mentorships"]
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery<MentorBadge[]>({
    queryKey: ["/api/mentor/badges"]
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<MentorActivity[]>({
    queryKey: ["/api/mentor/activities"]
  });

  const { data: stats, isLoading: statsLoading } = useQuery<MentorStats>({
    queryKey: ["/api/mentor/stats"]
  });

  const { data: trainingRaw = [], isLoading: trainingLoading } = useQuery<TrainingModule[]>({
    queryKey: ["/api/mentor/training"]
  });

  // Add completed field if missing (backend compatibility)
  const training = trainingRaw.map(module => ({
    ...module,
    completed: module.completed ?? false
  }));

  // Quick stats for overview
  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const upcomingSessions = activities.filter(a => !a.isCompleted && new Date(a.scheduledAt) > new Date());
  const recentBadges = badges.filter(b => b.earnedAt).sort((a, b) => 
    new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime()
  ).slice(0, 3);

  const startTrainingMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await apiRequest('POST', `/api/mentor/training/${trainingId}/start`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/training'] });
    },
    onError: (error: any) => {
      console.error('Error starting training:', error);
    }
  });

  const completeTrainingMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await apiRequest('POST', `/api/mentor/training/${trainingId}/complete`);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/training'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      if (data.tokensAwarded > 0) {
        toast({
          title: "Training Completed!",
          description: `Congratulations! You earned ${data.tokensAwarded} tokens for completing this training module.`,
        });
      }
      closeTrainingModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to complete training. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startTraining = (module: TrainingModule) => {
    startTrainingMutation.mutate(module.id);
    setSelectedTraining(module);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers([]);
    setShowReflection(false);
    setIsCompleting(false);
    setQuizPassed(false);
  };

  const closeTrainingModal = () => {
    setSelectedTraining(null);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers([]);
    setShowReflection(false);
    setIsCompleting(false);
    setQuizPassed(false);
  };

  const handleNextLesson = () => {
    const content = selectedTraining ? trainingContent[selectedTraining.title] : null;
    if (!content) return;
    
    if (currentLessonIndex < content.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    const content = selectedTraining ? trainingContent[selectedTraining.title] : null;
    if (!content) return;
    
    const correctAnswers = quizAnswers.filter((answer, index) => 
      answer === content.quiz[index].correct
    ).length;
    
    if (correctAnswers >= content.quiz.length - 1) {
      setQuizPassed(true);
      setShowReflection(true);
      setShowQuiz(false);
    } else {
      toast({
        title: "Almost there!",
        description: "Let's review the lessons and try again. You need to get most questions right.",
        variant: "destructive"
      });
      setShowQuiz(false);
      setCurrentLessonIndex(0);
      setQuizAnswers([]);
      setQuizPassed(false);
    }
  };

  const handleCompleteTraining = async () => {
    if (!selectedTraining || !quizPassed) {
      toast({
        title: "Cannot Complete",
        description: "Please pass the quiz first before completing the training.",
        variant: "destructive"
      });
      return;
    }
    setIsCompleting(true);
    completeTrainingMutation.mutate(selectedTraining.id);
  };

  if (statsLoading || mentorshipsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:pl-24">
        <div className="container mx-auto">
          <BackButton 
          onClick={() => {
            console.log('🔙 Back button clicked, navigating to /app');
            setLocation('/app');
          }} 
          variant="minimal" 
        />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:pl-24">
      <div className="container mx-auto max-w-7xl">
        <BackButton 
          onClick={() => {
            console.log('🔙 Back button clicked in MentorDashboard, navigating to /app');
            setLocation('/app');
          }} 
          variant="minimal" 
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600">Guide young hearts to spread kindness everywhere</p>
            </div>
          </div>
          
          {/* Quick Instructions for New Mentors */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">New to Mentoring? Start Here! 🎯</h3>
                <p className="text-blue-700 text-sm mb-2">
                  Complete your training modules first, then you'll be ready to guide other students in spreading kindness.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedTab("training")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start Training
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTab("overview")}
                  >
                    View Overview
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {stats && (
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>Level {stats.mentorLevel} Mentor</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{stats.impactScore} Impact Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span>{(Number(stats.avgRating) || 0).toFixed(1)} Average Rating</span>
              </div>
            </div>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2 p-0">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:shadow-lg transition-all"
            >
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="mentorships" 
              className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:shadow-lg transition-all"
            >
              <Users className="h-4 w-4" />
              My Mentees
            </TabsTrigger>
            <TabsTrigger 
              value="activities" 
              className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 data-[state=active]:bg-green-700 data-[state=active]:shadow-lg transition-all"
            >
              <Calendar className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 data-[state=active]:bg-amber-700 data-[state=active]:shadow-lg transition-all"
            >
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 data-[state=active]:bg-teal-700 data-[state=active]:shadow-lg transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Training
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Active Mentees</p>
                      <p className="text-3xl font-bold">{activeMentorships.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Acts Guided</p>
                      <p className="text-3xl font-bold">{stats?.totalKindnessActsGuided || 0}</p>
                    </div>
                    <Heart className="h-8 w-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Badges Earned</p>
                      <p className="text-3xl font-bold">{stats?.badgesEarned || 0}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-orange-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Sessions</p>
                      <p className="text-3xl font-bold">{stats?.totalSessions || 0}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Mentor Level Progress
                  </CardTitle>
                  <CardDescription>
                    You're currently a Level {stats?.mentorLevel || 1} Mentor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={stats?.nextLevelProgress || 0} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {stats?.nextLevelProgress || 0}% to Level {(stats?.mentorLevel || 1) + 1}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Keep Going!</h4>
                      <p className="text-sm text-blue-700">
                        Continue mentoring and completing training modules to advance your level.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>
                    {upcomingSessions.length} sessions scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming sessions scheduled</p>
                      <Button className="mt-4" size="sm">
                        Schedule a Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{activity.activityType}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges */}
            {recentBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>
                    Your latest badges and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{badge.badgeIcon}</div>
                        <div>
                          <p className="font-semibold text-yellow-900">{badge.badgeName}</p>
                          <p className="text-sm text-yellow-700">{badge.tier} • {badge.tokenReward} tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mentorships Tab */}
          <TabsContent value="mentorships" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Mentees</h2>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Users className="h-4 w-4 mr-2" />
                Find New Mentee
              </Button>
            </div>

            {activeMentorships.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Active Mentorships</h3>
                  <p className="text-gray-600 mb-6">Start your mentoring journey by connecting with a student who needs guidance.</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Get Matched with a Mentee
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {activeMentorships.map((mentorship) => (
                  <Card key={mentorship.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {mentorship.menteeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle>{mentorship.menteeName}</CardTitle>
                            <CardDescription>
                              Started {new Date(mentorship.startedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={mentorship.status === 'active' ? 'default' : 'secondary'}>
                          {mentorship.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Kindness Goal</h4>
                          <p className="text-gray-600">{mentorship.kindnessGoal}</p>
                        </div>
                        
                        {mentorship.progressNotes && (
                          <div>
                            <h4 className="font-semibold mb-2">Recent Progress</h4>
                            <p className="text-gray-600">{mentorship.progressNotes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Start Session
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Meeting
                          </Button>
                          <Button size="sm" variant="outline">
                            View Progress
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentoring Activities</h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Activity
              </Button>
            </div>

            <div className="grid gap-4">
              {activities.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">No Activities Yet</h3>
                    <p className="text-gray-600 mb-6">Start creating meaningful mentoring experiences.</p>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                      Plan Your First Activity
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activity.isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Clock className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{activity.activityType}</h3>
                            <p className="text-gray-600">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.scheduledAt).toLocaleDateString()} at {' '}
                              {new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {activity.isCompleted ? (
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          ) : (
                            <Button size="sm">
                              {new Date(activity.scheduledAt) <= new Date() ? 'Start Now' : 'View Details'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentor Badges</h2>
              <div className="text-sm text-gray-600">
                {badges.filter(b => b.earnedAt).length} of {badges.length} earned
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={`hover:shadow-lg transition-all ${
                  badge.earnedAt 
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`text-6xl mb-4 ${badge.earnedAt ? '' : 'grayscale opacity-50'}`}>
                      {badge.badgeIcon}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      badge.earnedAt ? 'text-yellow-900' : 'text-gray-600'
                    }`}>
                      {badge.badgeName}
                    </h3>
                    <p className={`text-sm mb-4 ${
                      badge.earnedAt ? 'text-yellow-700' : 'text-gray-500'
                    }`}>
                      {badge.description}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant={badge.earnedAt ? 'default' : 'secondary'}>
                        {badge.tier}
                      </Badge>
                      <Badge variant="outline">
                        {badge.tokenReward} tokens
                      </Badge>
                    </div>

                    {badge.earnedAt ? (
                      <div className="text-xs text-yellow-600">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full">
                        View Requirements
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentor Training</h2>
              <div className="text-sm text-gray-600">
                {training.filter(t => t.completed).length} of {training.length} completed
              </div>
            </div>

            <div className="grid gap-6">
              {training.map((module) => (
                <Card key={module.id} className={`hover:shadow-md transition-shadow ${
                  module.completed ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          module.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <BookOpen className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <p className="text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {module.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {module.certificateReward} tokens
                            </span>
                            {module.isRequired && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {module.completed ? (
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        ) : (
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-purple-500"
                            onClick={() => startTraining(module)}
                            data-testid={`start-training-${module.id}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Training Modal */}
      <Dialog open={selectedTraining !== null} onOpenChange={(open) => !open && closeTrainingModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTraining && trainingContent[selectedTraining.title] && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  {selectedTraining.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedTraining.durationMinutes} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {selectedTraining.certificateReward} tokens
                  </span>
                  {selectedTraining.isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {showReflection ? 'Final Reflection' : showQuiz ? 'Quiz Time' : `Lesson ${currentLessonIndex + 1} of ${trainingContent[selectedTraining.title].lessons.length}`}
                  </span>
                </div>
                <Progress 
                  value={
                    showReflection ? 100 : 
                    showQuiz ? 80 : 
                    ((currentLessonIndex + 1) / trainingContent[selectedTraining.title].lessons.length) * 70
                  } 
                  className="h-2" 
                />
              </div>

              {/* Lesson Content */}
              {!showQuiz && !showReflection && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {trainingContent[selectedTraining.title].lessons[currentLessonIndex].title}
                    </h3>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {trainingContent[selectedTraining.title].lessons[currentLessonIndex].content}
                    </div>
                  </div>

                  {trainingContent[selectedTraining.title].lessons[currentLessonIndex].activity && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Think About It</h4>
                          <p className="text-yellow-700">
                            {trainingContent[selectedTraining.title].lessons[currentLessonIndex].activity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Scenario */}
                  {trainingContent[selectedTraining.title].lessons[currentLessonIndex].scenario && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-indigo-800 mb-1">What Would You Do?</h4>
                          <p className="text-indigo-700 font-medium">
                            {trainingContent[selectedTraining.title].lessons[currentLessonIndex].scenario?.situation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 ml-11">
                        {trainingContent[selectedTraining.title].lessons[currentLessonIndex].scenario?.options.map((option, idx) => {
                          const scenario = trainingContent[selectedTraining.title].lessons[currentLessonIndex].scenario!;
                          const isCorrect = idx === scenario.bestChoice;
                          return (
                            <button
                              key={idx}
                              className={`w-full text-left p-3 rounded-lg border transition-all hover:border-indigo-400 ${
                                isCorrect 
                                  ? 'border-green-400 bg-green-50' 
                                  : 'border-gray-200 bg-white hover:bg-indigo-50'
                              }`}
                              onClick={() => {
                                if (isCorrect) {
                                  toast({
                                    title: "Great choice!",
                                    description: scenario.explanation,
                                  });
                                } else {
                                  toast({
                                    title: "Think about it...",
                                    description: "Try another option! Remember what you learned in this lesson.",
                                    variant: "default"
                                  });
                                }
                              }}
                            >
                              <span className="font-medium mr-2 text-indigo-600">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                              {isCorrect && (
                                <span className="ml-2 text-green-600 text-sm font-medium">✓ Best Choice</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentLessonIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextLesson}
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      {currentLessonIndex < trainingContent[selectedTraining.title].lessons.length - 1 
                        ? 'Next Lesson' 
                        : 'Take Quiz'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Quiz Section */}
              {showQuiz && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-purple-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Knowledge Check
                    </h3>
                    <p className="text-purple-700 text-sm">Answer these questions to show what you've learned!</p>
                  </div>

                  {trainingContent[selectedTraining.title].quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white border rounded-lg p-4">
                      <p className="font-semibold mb-3">{qIndex + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => handleQuizAnswer(qIndex, oIndex)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              quizAnswers[qIndex] === oIndex 
                                ? 'border-purple-500 bg-purple-50 text-purple-800' 
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => { setShowQuiz(false); setCurrentLessonIndex(trainingContent[selectedTraining.title].lessons.length - 1); }}
                    >
                      Review Lessons
                    </Button>
                    <Button 
                      onClick={handleSubmitQuiz}
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                      disabled={quizAnswers.length < trainingContent[selectedTraining.title].quiz.length}
                    >
                      Submit Answers
                    </Button>
                  </div>
                </div>
              )}

              {/* Reflection Section */}
              {showReflection && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5" />
                      Great job! Time for Reflection
                    </h3>
                    <p className="text-green-700 mb-4">
                      {trainingContent[selectedTraining.title].reflection}
                    </p>
                    <p className="text-green-600 text-sm italic">
                      Take a moment to think about this. Your personal insights will help you become an amazing mentor!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-6 text-center">
                    <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="font-bold text-xl text-yellow-800 mb-2">You're Ready!</h3>
                    <p className="text-yellow-700 mb-4">
                      Complete this training to earn <span className="font-bold">{selectedTraining.certificateReward} tokens</span> and unlock the next step in your mentoring journey!
                    </p>
                    <Button 
                      onClick={handleCompleteTraining}
                      disabled={isCompleting || completeTrainingMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 text-lg"
                    >
                      {isCompleting || completeTrainingMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Training
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}