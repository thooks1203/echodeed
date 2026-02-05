import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSchoolLevel } from "@/hooks/useSchoolLevel";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { CheckCircle, Circle, Trophy, GraduationCap, Heart, FileText, Upload, Award, Calendar, Target, ChevronDown, ChevronRight, BookOpen, Sparkles, Star, Rocket, Users } from "lucide-react";

// Interactive Module Content Viewer - breaks content into clickable sections
function ModuleContentViewer({ content }: { content: string }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section open by default
  const [currentSection, setCurrentSection] = useState(0);
  
  // Parse content into sections by ### headers
  const parseContent = (rawContent: string) => {
    const lines = rawContent.split('\n');
    const sections: { title: string; content: string; type: 'intro' | 'lesson' | 'activity' | 'summary' }[] = [];
    let currentTitle = '';
    let currentContent: string[] = [];
    
    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        // Save previous section if exists
        if (currentTitle || currentContent.length > 0) {
          const title = currentTitle || 'Introduction';
          let type: 'intro' | 'lesson' | 'activity' | 'summary' = 'lesson';
          if (title.toLowerCase().includes('introduction')) type = 'intro';
          else if (title.toLowerCase().includes('activity') || title.toLowerCase().includes('reflection')) type = 'activity';
          else if (title.toLowerCase().includes('takeaway') || title.toLowerCase().includes('final')) type = 'summary';
          
          sections.push({
            title,
            content: currentContent.join('\n').trim(),
            type
          });
        }
        currentTitle = line.replace('### ', '').trim();
        currentContent = [];
      } else if (line.startsWith('## ')) {
        // Main title - add as intro
        if (sections.length === 0) {
          currentTitle = line.replace('## ', '').trim();
        }
      } else if (line !== '---') {
        currentContent.push(line);
      }
    });
    
    // Don't forget the last section
    if (currentTitle || currentContent.length > 0) {
      const title = currentTitle || 'Conclusion';
      let type: 'intro' | 'lesson' | 'activity' | 'summary' = 'summary';
      if (title.toLowerCase().includes('activity')) type = 'activity';
      sections.push({
        title,
        content: currentContent.join('\n').trim(),
        type
      });
    }
    
    return sections;
  };
  
  const sections = parseContent(content);
  
  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
      setCurrentSection(Math.max(currentSection, index));
    }
    setExpandedSections(newExpanded);
  };
  
  const goToNextSection = () => {
    const nextIndex = currentSection + 1;
    if (nextIndex < sections.length) {
      const newExpanded = new Set(expandedSections);
      newExpanded.add(nextIndex);
      setExpandedSections(newExpanded);
      setCurrentSection(nextIndex);
    }
  };
  
  const formatContent = (text: string) => {
    // Convert markdown-style formatting to styled elements
    return text.split('\n').map((line, idx) => {
      // Bold text
      let formattedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      
      // Handle bullet points
      if (line.trim().startsWith('- ')) {
        return (
          <div key={idx} style={{ 
            paddingLeft: '16px', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: '0', 
              color: '#6366F1',
              fontWeight: 'bold'
            }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace('- ', '') }} />
          </div>
        );
      }
      
      // Handle numbered items
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numberedMatch) {
        return (
          <div key={idx} style={{ 
            paddingLeft: '24px', 
            marginBottom: '8px',
            position: 'relative'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: '0', 
              color: '#6366F1',
              fontWeight: 'bold'
            }}>{numberedMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
          </div>
        );
      }
      
      // Handle checkmarks
      if (line.trim().startsWith('✓')) {
        return (
          <div key={idx} style={{ 
            marginBottom: '8px',
            color: '#059669',
            fontWeight: '500'
          }}>
            {line}
          </div>
        );
      }
      
      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={idx} style={{ marginBottom: '12px' }} dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      }
      
      return null;
    });
  };
  
  const getSectionIcon = (type: string, isOpen: boolean) => {
    const iconStyle = { width: '18px', height: '18px' };
    switch(type) {
      case 'intro': return <BookOpen style={{ ...iconStyle, color: '#6366F1' }} />;
      case 'activity': return <Target style={{ ...iconStyle, color: '#F59E0B' }} />;
      case 'summary': return <CheckCircle style={{ ...iconStyle, color: '#059669' }} />;
      default: return isOpen ? <ChevronDown style={iconStyle} /> : <ChevronRight style={iconStyle} />;
    }
  };
  
  const getSectionColor = (type: string) => {
    switch(type) {
      case 'intro': return { bg: '#EEF2FF', border: '#6366F1', accent: '#4F46E5' };
      case 'activity': return { bg: '#FFFBEB', border: '#F59E0B', accent: '#D97706' };
      case 'summary': return { bg: '#ECFDF5', border: '#10B981', accent: '#059669' };
      default: return { bg: '#F9FAFB', border: '#D1D5DB', accent: '#6B7280' };
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Progress indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '8px',
        padding: '12px 16px',
        background: '#F0FDF4',
        borderRadius: '8px',
        border: '1px solid #BBF7D0'
      }}>
        <BookOpen style={{ width: '16px', height: '16px', color: '#059669' }} />
        <span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>
          Reading Progress: {expandedSections.size} of {sections.length} sections viewed
        </span>
        <div style={{ 
          flex: 1, 
          height: '6px', 
          background: '#D1FAE5', 
          borderRadius: '3px',
          marginLeft: '8px'
        }}>
          <div style={{ 
            width: `${(expandedSections.size / sections.length) * 100}%`,
            height: '100%',
            background: '#059669',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      {/* Sections */}
      {sections.map((section, index) => {
        const isOpen = expandedSections.has(index);
        const isUnlocked = index <= currentSection + 1;
        const colors = getSectionColor(section.type);
        
        return (
          <div 
            key={index}
            style={{
              borderRadius: '12px',
              border: `2px solid ${isOpen ? colors.border : '#E5E7EB'}`,
              overflow: 'hidden',
              opacity: isUnlocked ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}
          >
            {/* Section Header - Clickable */}
            <button
              onClick={() => isUnlocked && toggleSection(index)}
              disabled={!isUnlocked}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: isOpen ? colors.bg : 'white',
                border: 'none',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isOpen ? colors.border : '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {expandedSections.has(index) ? '✓' : index + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: isOpen ? colors.accent : '#374151'
                }}>
                  {section.title}
                </div>
                {section.type !== 'lesson' && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: colors.accent,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: '2px'
                  }}>
                    {section.type === 'intro' ? '📖 Introduction' : 
                     section.type === 'activity' ? '✏️ Activity' : '⭐ Key Takeaways'}
                  </div>
                )}
              </div>
              
              {getSectionIcon(section.type, isOpen)}
            </button>
            
            {/* Section Content - Expandable */}
            {isOpen && (
              <div style={{
                padding: '20px',
                background: 'white',
                borderTop: `1px solid ${colors.border}`,
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                {formatContent(section.content)}
                
                {/* Continue button if not the last section */}
                {index < sections.length - 1 && index === currentSection && (
                  <Button
                    onClick={goToNextSection}
                    style={{
                      marginTop: '20px',
                      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                      color: 'white',
                      fontWeight: '600',
                      width: '100%'
                    }}
                  >
                    Continue to Next Section →
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface LeadershipProgress {
  id?: string;
  userId: string;
  module1Complete: number;
  module2Complete: number;
  module3Complete: number;
  module4Complete: number;
  module5Complete: number;
  trainingCompletedAt?: string;
  personalReflection?: string;
  verifiedQuestsCount: number;
  hasMiddleSchoolMentoringQuest: number;
  questsCompletedAt?: string;
  portfolioDefenseStatus: string;
  portfolioDefenseApproved: number;
  portfolioDefenseApprovedAt?: string;
  overallProgress: number;
  isScholarshipFinalist: number;
  certificateIssuedAt?: string;
}

const LEADERSHIP_MODULES = [
  { 
    id: 1, 
    title: "The Power of One", 
    description: "Discover how individual actions create ripple effects of positive change", 
    duration: "15 min", 
    content: `## The Power of One: How Individual Actions Create Ripple Effects

### Introduction: You Are More Powerful Than You Know

Have you ever thrown a stone into still water? The moment it touches the surface, ripples spread outward in every direction, reaching far beyond where the stone landed. This is exactly how leadership works. One person's decision to act—no matter how small—can create waves of positive change that touch hundreds, even thousands of lives.

Leadership doesn't require a title, a position, or permission from anyone. It begins the moment YOU decide to make a difference.

---

### Lesson 1: The Ripple Effect Explained

**What is the Ripple Effect?**
The Ripple Effect is the phenomenon where one act of kindness, courage, or initiative inspires others to do the same. Like dominoes falling, your single action can trigger a chain reaction of positive behavior.

**Real-World Example: Rosa Parks**
On December 1, 1955, Rosa Parks refused to give up her bus seat in Montgomery, Alabama. She was just one person making one decision. But that single act of courage sparked the Montgomery Bus Boycott, which lasted 381 days and became a pivotal moment in the Civil Rights Movement. One woman. One seat. One decision that changed history.

**Real-World Example: Greta Thunberg**
In August 2018, a 15-year-old Swedish student sat alone outside her country's parliament with a sign reading "School Strike for Climate." Today, millions of young people worldwide have participated in climate strikes inspired by her solitary protest. One student. One sign. A global movement.

**Key Insight:** You don't need to wait for others to start. The most powerful movements in history began with a single individual who decided that waiting for someone else wasn't an option.

---

### Lesson 2: Why "Just One Person" Matters

Many students think: "I'm just one person. What difference can I make?" This is the most common barrier to leadership—and it's based on a myth.

**The Mathematics of Influence:**
- If you positively influence just 3 people...
- And each of them influences 3 more people...
- Within 10 "generations" of influence, you've touched 59,049 people!

**The Bystander Effect:**
Psychologists discovered that when many people witness a problem, everyone assumes someone else will act. This means that in a crowd, FEWER people help than when someone is alone. By being the ONE person who steps up, you break this pattern and give others permission to act too.

**Your School Community:**
Think about your school. If no one picks up trash, hallways get messy. If one person starts picking up trash, others notice. Some join in. Soon, keeping the school clean becomes the culture. That transformation started with ONE person.

---

### Lesson 3: Types of Individual Leadership Actions

Leadership doesn't always look dramatic. Here are everyday ways to create ripples:

**1. The Courage to Speak Up**
- Standing up for someone being bullied
- Suggesting a new idea in class discussion
- Asking the question everyone is thinking but afraid to ask

**2. The Kindness of Inclusion**
- Inviting the new student to sit at your lunch table
- Including the quiet kid in your group project
- Saying hello to someone who seems lonely

**3. The Initiative to Start**
- Organizing a cleanup project
- Starting a club for something you're passionate about
- Creating a tutoring program for younger students

**4. The Consistency of Example**
- Being on time, every time
- Keeping your commitments
- Treating everyone with respect, including those who can't do anything for you

---

### Lesson 4: Overcoming the Fear of Starting

**Common Fears:**
- "What if people think I'm weird?"
- "What if it doesn't work?"
- "What if I fail?"

**The Reality:**
Every leader you admire faced these same fears. The difference is they acted DESPITE the fear. Courage isn't the absence of fear—it's action in the presence of fear.

**The "First Follower" Principle:**
Research shows that the bravest person isn't always the leader who starts—sometimes it's the FIRST FOLLOWER who validates the leader's vision. But without that initial leader, there's nothing to follow.

**Practical Strategy: The 5-Second Rule**
When you feel the urge to do something positive, count backwards from 5 and then act. 5-4-3-2-1-GO. Don't give your brain time to talk you out of it.

---

### Activity: Your Ripple Reflection

Take 5 minutes to answer these questions thoughtfully:

1. **Recall:** Think of a time when ONE person's action changed a situation you were in. What did they do? How did it affect you?

2. **Identify:** What is ONE small change you could make this week that might inspire someone else? Be specific about who, what, when, and where.

3. **Commit:** Write down your commitment: "This week, I will _____________ because I believe it could create a ripple effect by _____________."

---

### Key Takeaways

✓ Leadership begins with a single person's decision to act
✓ The Ripple Effect means one action can inspire countless others
✓ You don't need permission, a title, or a team to start leading
✓ Fear is normal—courage is acting despite the fear
✓ Small, consistent actions create lasting change

---

### Final Reflection Question
What is one small change you can make TODAY that might inspire someone else? Remember: the ripple starts with YOU.`,
    questions: [
      { id: "q1_1", question: "What is the 'Ripple Effect' in leadership?", options: ["A physical wave in the ocean", "How one act of kindness inspires others", "A mathematical equation", "A type of weather pattern"], correctAnswer: 1 },
      { id: "q1_2", question: "True or False: Leadership always requires a large team to start.", options: ["True", "False"], correctAnswer: 1 },
      { id: "q1_3", question: "Where does leadership begin according to this module?", options: ["With a government decree", "With a large budget", "With an individual's decision to act", "With a trophy"], correctAnswer: 2 }
    ]
  },
  { 
    id: 2, 
    title: "Self-Awareness", 
    description: "Understand your strengths, values, and areas for growth as a leader", 
    duration: "20 min", 
    content: `## Self-Awareness: Know Yourself to Lead Others

### Introduction: The Foundation of Leadership

Before you can effectively guide others, you must first understand yourself. Self-awareness is the cornerstone of authentic leadership. Leaders who know their strengths can leverage them. Leaders who know their weaknesses can address them or build teams that complement them.

The ancient Greek inscription at the Temple of Apollo said it simply: "Know thyself." Thousands of years later, this remains the most important advice for any leader.

---

### Lesson 1: Understanding Your Core Values

**What Are Core Values?**
Core values are the fundamental beliefs that guide your decisions, actions, and priorities. They're the non-negotiables—the things you won't compromise on, even when it's difficult.

**Why Values Matter for Leaders:**
- Values provide a compass when decisions get tough
- They help you stay consistent under pressure
- They attract people who share your beliefs
- They define what you stand FOR, not just what you're against

**Common Leadership Values:**
- **Integrity:** Doing what's right, even when no one is watching
- **Compassion:** Caring about others' well-being
- **Excellence:** Striving to do your best work
- **Courage:** Taking action despite fear
- **Humility:** Recognizing you don't have all the answers
- **Service:** Putting others' needs before your own
- **Growth:** Continuously learning and improving
- **Justice:** Standing up for fairness and equality

**Activity:** From this list (or your own ideas), identify your TOP 3 core values. These are the values you would never compromise, even if it cost you something important.

---

### Lesson 2: Discovering Your Character Strengths

**The VIA Character Strengths:**
Psychologists have identified 24 universal character strengths that exist across all cultures. Everyone has all 24, but your "signature strengths" are the ones that feel most natural and energizing to you.

**The Six Virtue Categories:**

**1. Wisdom & Knowledge**
- Creativity: Finding new ways to do things
- Curiosity: Being interested in exploring and learning
- Judgment: Thinking things through carefully
- Love of Learning: Enjoying mastering new skills
- Perspective: Seeing the big picture

**2. Courage**
- Bravery: Standing up for what's right
- Perseverance: Finishing what you start
- Honesty: Being truthful and genuine
- Zest: Approaching life with energy

**3. Humanity**
- Love: Valuing close relationships
- Kindness: Helping others
- Social Intelligence: Understanding people's feelings

**4. Justice**
- Teamwork: Working well with others
- Fairness: Treating people equally
- Leadership: Organizing and motivating groups

**5. Temperance**
- Forgiveness: Letting go of grudges
- Humility: Not seeking the spotlight
- Prudence: Being careful about choices
- Self-Regulation: Controlling impulses

**6. Transcendence**
- Appreciation of Beauty: Noticing excellence
- Gratitude: Being thankful
- Hope: Expecting the best and working for it
- Humor: Enjoying laughter and bringing joy
- Spirituality: Having purpose and meaning

**Key Insight:** Your signature strengths are superpowers. When you use them, work feels easier and more fulfilling.

---

### Lesson 3: The Window of Growth Model

**Understanding How Others See You**

The "Window of Growth" (based on the Johari Window) helps you understand the gap between how you see yourself and how others see you.

**The Four Panes:**

**1. Open Area (Known to You + Known to Others)**
These are traits you openly display and others can see. Example: If you're known for being funny and you know you're funny, that's in your open area.

**2. Blind Spot (Unknown to You + Known to Others)**
These are things others notice about you that you don't see in yourself. Example: You might not realize you interrupt people, but your friends notice it.

**3. Hidden Area (Known to You + Unknown to Others)**
These are parts of yourself you keep private. Example: You might be passionate about poetry but never share it at school.

**4. Unknown Area (Unknown to You + Unknown to Others)**
These are undiscovered potentials. You haven't tried enough things to discover all your capabilities yet!

**Growth Strategy:** Expand your "Open Area" by:
- Asking trusted friends for honest feedback
- Trying new activities to discover hidden talents
- Being more authentic about who you really are

---

### Lesson 4: Embracing Your Weaknesses

**Why Weaknesses Are Actually Valuable:**

Many people try to hide their weaknesses. Great leaders do the opposite—they acknowledge them openly. Here's why:

**1. Honesty Builds Trust**
When you admit you don't know something, people trust you more when you say you DO know something.

**2. Weaknesses Point to Growth**
You can't improve what you won't acknowledge. Identifying weaknesses is the first step to addressing them.

**3. Teams Need Diversity**
If everyone was the same, teams would have the same blind spots. Your weaknesses create opportunities for others to contribute their strengths.

**4. Vulnerability Creates Connection**
When you show you're human and imperfect, others feel comfortable doing the same. This creates psychological safety.

**The Growth Mindset:**
Stanford psychologist Carol Dweck discovered that people with a "growth mindset" see abilities as developable, not fixed. They embrace challenges as opportunities to grow. Leaders with a growth mindset say "I can't do this YET" instead of "I can't do this."

---

### Lesson 5: The Self-Awareness Practice

**Daily Reflection Questions:**
Spend 5 minutes each evening asking yourself:
1. What did I do well today?
2. What could I have done better?
3. What did I learn about myself?
4. How did my actions align with my values?

**Feedback Seeking:**
Ask 2-3 people you trust:
- "What's one thing I do that you think is a strength?"
- "What's one thing you think I could improve?"
- "When have you seen me at my best?"

**Journaling:**
Keep a leadership journal where you record your thoughts, decisions, and reflections. Over time, patterns will emerge that reveal who you truly are.

---

### Activity: Your Self-Awareness Portrait

Complete these statements thoughtfully:

1. **My top 3 core values are:** _______________________

2. **My greatest character strength is:** _______________________

3. **One thing I need to work on is:** _______________________

4. **Something others might not know about me is:** _______________________

5. **If I asked my best friend what my #1 strength is, they would say:** _______________________

---

### Key Takeaways

✓ Self-awareness is the foundation of authentic leadership
✓ Core values guide your decisions and define your character
✓ Character strengths are your natural superpowers
✓ The Window of Growth reveals gaps between self-perception and others' perceptions
✓ Acknowledging weaknesses builds trust and enables growth
✓ Regular reflection deepens self-understanding

---

### Final Reflection Question
Identify three core values that define YOUR leadership style. How do these values show up in your daily actions?`,
    questions: [
      { id: "q2_1", question: "What is the primary focus of self-awareness for a leader?", options: ["Knowing your favorite food", "Identifying core values and strengths", "Learning how to use a computer", "Memorizing school rules"], correctAnswer: 1 },
      { id: "q2_2", question: "Why is being honest about weaknesses important?", options: ["It makes you look weak", "It builds authenticity and trust", "It helps you avoid work", "It is not important"], correctAnswer: 1 },
      { id: "q2_3", question: "What model is used to understand how others perceive our leadership?", options: ["Window of Growth", "Mirror of Success", "Ladder of Power", "Circle of Friends"], correctAnswer: 0 }
    ]
  },
  { 
    id: 3, 
    title: "Effective Communication", 
    description: "Master the art of inspiring and connecting with others", 
    duration: "20 min", 
    content: `## Effective Communication: The Bridge Between Vision and Reality

### Introduction: Why Communication Is Everything

Imagine having the most brilliant idea in the world—but being unable to explain it to anyone. That idea dies with you. Communication is what transforms thoughts into action, visions into reality, and individuals into teams.

Studies show that leaders spend up to 80% of their time communicating. It's not just a leadership skill—it IS leadership.

---

### Lesson 1: The L.E.A.D. Communication Framework

Great communicators follow a pattern. We call it L.E.A.D.:

**L - Listen First**
Before you speak, seek to understand. Most people listen to respond, not to understand. Leaders do the opposite.

**Practical Techniques:**
- Put away your phone and make eye contact
- Let people finish their thoughts completely
- Summarize what you heard: "So what you're saying is..."
- Ask follow-up questions to go deeper

**E - Empathize Genuinely**
Try to see the situation from the other person's perspective. Even if you disagree, acknowledge their feelings.

**Practical Phrases:**
- "I can see why you'd feel that way."
- "That sounds frustrating."
- "Help me understand your perspective better."

**A - Ask Thoughtful Questions**
Questions show you care and help you understand. They also help the other person think more clearly.

**Powerful Question Starters:**
- "What do you think we should do?"
- "How did that make you feel?"
- "What would success look like to you?"
- "What's the most important thing about this?"

**D - Direct with Clarity**
When it's time to share your view or give direction, be clear and concise. Don't bury your message.

**Practical Techniques:**
- Start with the main point
- Use simple language
- Be specific, not vague
- Check for understanding: "Does that make sense?"

---

### Lesson 2: The 7-38-55 Rule

Research by Dr. Albert Mehrabian revealed something surprising about how we communicate:

- **7%** of meaning comes from the WORDS we say
- **38%** comes from our TONE of voice
- **55%** comes from our BODY LANGUAGE

**What This Means for You:**
Your words matter, but HOW you say them matters even more. A leader who says "Great job" while rolling their eyes sends a very different message than one who says it with genuine enthusiasm.

**Body Language Basics for Leaders:**
- Stand/sit up straight (projects confidence)
- Make appropriate eye contact (shows engagement)
- Uncross your arms (appears open and approachable)
- Nod while listening (signals understanding)
- Mirror the other person's posture (builds rapport)

**Tone Techniques:**
- Vary your pace—slow down for emphasis
- Lower your pitch at the end of statements (sounds confident)
- Raise your pitch at the end of questions (invites response)
- Pause before important points (creates anticipation)

---

### Lesson 3: Active Listening

**The Listening Ladder:**
Most people think they're good listeners. Research says otherwise. Here are the levels:

**Level 1: Ignoring**
Not paying attention at all. Thinking about something else.

**Level 2: Pretending**
Making "mm-hmm" sounds but not actually processing the words.

**Level 3: Selective**
Only hearing parts that interest you or confirm what you already think.

**Level 4: Attentive**
Hearing the words and understanding the meaning.

**Level 5: Empathic (The Leader's Level)**
Understanding not just what's said, but the feelings and needs behind it. Hearing what's NOT said.

**How to Practice Empathic Listening:**
1. Clear your mind of distractions
2. Focus entirely on the speaker
3. Watch for emotional cues
4. Ask yourself: "What is this person really trying to tell me?"
5. Reflect back what you heard, including the emotion

**Example:**
- They say: "I guess I'm okay with doing the extra work."
- You hear: Hesitation, possible resentment
- You respond: "It sounds like you might have some concerns about the workload. Can we talk about that?"

---

### Lesson 4: Difficult Conversations

Leaders don't avoid hard conversations—they handle them with skill.

**The DEAR Framework for Difficult Conversations:**

**D - Describe the situation objectively**
Stick to facts, not judgments. "I noticed you arrived 15 minutes late to our last three meetings" (not "You're always late and don't care").

**E - Express your feelings using "I" statements**
"I feel frustrated when meetings start late because it affects everyone's schedule."

**A - Assert your needs clearly**
"I need us to start on time going forward."

**R - Request specific actions**
"Can you commit to arriving 5 minutes early for our next meeting?"

**Key Principles:**
- Choose the right time and place (private, not in front of others)
- Stay calm, even if they get defensive
- Focus on the behavior, not the person
- Offer to help find solutions
- End on a positive note when possible

---

### Lesson 5: Inspiring Others Through Words

**The Power of Story:**
Facts tell, but stories sell. When you want to inspire action, wrap your message in a story.

**Story Structure:**
1. The Challenge (what problem existed?)
2. The Struggle (what obstacles were faced?)
3. The Breakthrough (what changed?)
4. The Lesson (what can we learn?)

**Example:** Instead of saying "We need to recycle more," tell the story of a school that reduced waste by 80% and how it started with one student's idea.

**Inspiring Language Patterns:**
- "Imagine if we could..."
- "What would it mean if..."
- "Together, we can..."
- "I believe in this because..."

---

### Activity: Communication Practice

**Scenario 1: Active Listening**
A friend tells you: "I don't know if I should even try out for the team. I probably won't make it anyway."
Write what you would say using empathic listening (hint: acknowledge their feeling first).

**Scenario 2: Difficult Conversation**
A group member hasn't been doing their share of work. Using the DEAR framework, write what you would say.

**Scenario 3: Inspiring Others**
You want to convince your class to participate in a community cleanup. Write a 3-sentence pitch using story or inspiring language.

---

### Key Takeaways

✓ Communication is the bridge between vision and reality
✓ The L.E.A.D. framework: Listen, Empathize, Ask, Direct
✓ Only 7% of meaning comes from words—tone and body language matter more
✓ Empathic listening means hearing feelings, not just words
✓ The DEAR framework helps with difficult conversations
✓ Stories inspire action more than facts alone

---

### Final Reflection Question
Recall a time you successfully resolved a conflict through communication. What did you do well? What would you do differently next time?`,
    questions: [
      { id: "q3_1", question: "What does the 'L' in the L.E.A.D. framework stand for?", options: ["Lead", "Listen", "Learn", "Laugh"], correctAnswer: 1 },
      { id: "q3_2", question: "Communication is described as the bridge between vision and what?", options: ["Fantasy", "Reality", "Silence", "Money"], correctAnswer: 1 },
      { id: "q3_3", question: "Is communication only about talking?", options: ["Yes, always", "No, it's also about making others feel heard", "Only when giving orders", "Only in emails"], correctAnswer: 1 }
    ]
  },
  { 
    id: 4, 
    title: "Team Leadership", 
    description: "Learn to build, motivate, and lead high-performing teams", 
    duration: "25 min", 
    content: `## Team Leadership: Creating More Leaders, Not More Followers

### Introduction: The Multiplier Effect

Here's a truth that separates good leaders from great ones: **Great leaders don't create followers—they create more leaders.**

When you develop others' abilities, you multiply your impact. One person can only do so much. But a leader who empowers 10 people, who each empower 10 more, changes the world.

---

### Lesson 1: What Makes Teams Work

**The Aristotle Project:**
Google spent years studying what makes teams effective. Their surprising discovery? The #1 factor wasn't talent, experience, or resources. It was **psychological safety**—whether team members felt safe to take risks and be vulnerable.

**Psychological Safety Means:**
- People can ask questions without feeling stupid
- Members can admit mistakes without being punished
- Everyone's ideas are heard and considered
- It's okay to disagree respectfully
- Failure is treated as a learning opportunity

**How Leaders Create Psychological Safety:**
1. Admit your own mistakes openly
2. Ask for input before sharing your opinion
3. Respond to bad news with curiosity, not anger
4. Thank people for raising concerns
5. Never ridicule or dismiss ideas

---

### Lesson 2: Building Your Team

**The Right People in the Right Roles:**
Not everyone should do the same thing. Great team leaders match people's strengths to roles.

**Common Team Roles:**

**The Visionary** - Sees the big picture, generates ideas
**The Organizer** - Creates plans, keeps track of details
**The Connector** - Builds relationships, keeps morale high
**The Doer** - Executes tasks reliably
**The Questioner** - Challenges assumptions, improves quality

**Key Insight:** A team of all visionaries will have great ideas but poor execution. A team of all doers will work hard but might miss the big picture. Balance is essential.

**When Building a Team, Ask:**
- What strengths does each person bring?
- Where are our gaps?
- Who complements (not copies) existing members?
- Is there diversity of perspective?

---

### Lesson 3: The Art of Delegation

**Why Delegation Matters:**
- You can't do everything yourself
- It develops others' skills
- It builds trust and ownership
- It frees you to focus on what only YOU can do

**The Delegation Spectrum:**
1. **Tell:** "Do exactly this, exactly this way."
2. **Sell:** "Here's what I need and why it matters."
3. **Consult:** "What do you think we should do? I'll decide."
4. **Participate:** "Let's decide together."
5. **Delegate:** "You decide and handle it. I trust you."

**Matching Level to Situation:**
- New or risky tasks → More direction (levels 1-2)
- Experienced team members → More autonomy (levels 4-5)
- Developing someone's skills → Gradually increase autonomy

**Common Delegation Mistakes:**
- Micromanaging (hovering over every detail)
- Dumping (giving tasks without context or support)
- Taking it back (grabbing tasks when they struggle)
- No follow-up (assuming it's handled without checking)

**The Right Way to Delegate:**
1. Explain the WHAT and WHY clearly
2. Ask if they have questions
3. Agree on check-in points
4. Provide resources and support
5. Let them do it THEIR way (within boundaries)
6. Give feedback afterward

---

### Lesson 4: Motivating Your Team

**What Actually Motivates People:**

Research by Daniel Pink identified three key drivers:

**1. Autonomy** - The desire to direct our own lives
Give people choices and control over how they work.

**2. Mastery** - The urge to get better at something
Help people grow their skills and see progress.

**3. Purpose** - The yearning to do what we do in service of something larger
Connect the work to meaningful impact.

**Practical Motivation Strategies:**

**Recognition:**
- Celebrate wins publicly
- Be specific: "I noticed how you..." not just "Good job"
- Recognize effort, not just results
- Personalize recognition (some prefer public, others private)

**Growth:**
- Give stretch assignments that challenge
- Provide constructive feedback
- Create learning opportunities
- Pair less experienced members with mentors

**Connection:**
- Build relationships beyond just "the work"
- Create team rituals and traditions
- Show you care about them as people
- Have fun together

---

### Lesson 5: Handling Team Challenges

**When Someone Is Struggling:**
1. Have a private, supportive conversation
2. Ask what's going on (don't assume)
3. Offer specific help
4. Create an improvement plan together
5. Follow up regularly

**When There's Conflict:**
1. Address it early—don't let it fester
2. Meet with people separately first to understand perspectives
3. Bring them together to find common ground
4. Focus on shared goals, not personalities
5. Agree on behaviors going forward

**When Energy Is Low:**
1. Reconnect the team to PURPOSE
2. Celebrate small wins
3. Shake things up—try something new
4. Give unexpected appreciation
5. Check in individually—something might be going on

---

### Lesson 6: Measuring Team Success

**How do you know your team is thriving?**

**Observable Signs:**
- Members actively contribute ideas
- People volunteer for extra tasks
- Conflicts are addressed, not avoided
- The team meets deadlines
- Members support each other

**Questions to Ask Your Team:**
- "What's working well?"
- "What's getting in our way?"
- "What do you need from me?"
- "How can we improve?"

**The Ultimate Metric:**
A leader's success is measured by the success of the people they lead. If your team members are growing, contributing, and achieving—you're doing your job.

---

### Activity: Team Leadership Scenarios

**Scenario 1: Delegation**
You're leading a group project. One member is excellent at design but weak at research. Another is the opposite. How do you assign tasks? Why?

**Scenario 2: Motivation**
A team member seems disengaged lately. They used to be enthusiastic but now just do the minimum. What steps would you take?

**Scenario 3: Conflict**
Two team members keep arguing about how to approach the project. It's affecting the whole group. What do you do?

---

### Key Takeaways

✓ Great leaders create more leaders, not more followers
✓ Psychological safety is the #1 factor in team effectiveness
✓ Match people's strengths to appropriate roles
✓ Delegation develops others and multiplies your impact
✓ Autonomy, Mastery, and Purpose drive motivation
✓ A leader's success is measured by their team's success

---

### Final Reflection Question
How do you handle a situation where a team member is struggling? What's your approach to supporting them while maintaining team standards?`,
    questions: [
      { id: "q4_1", question: "What do great leaders create according to this module?", options: ["Followers", "More leaders", "Competitors", "Rules"], correctAnswer: 1 },
      { id: "q4_2", question: "How is a leader's success measured?", options: ["By their bank account", "By the success of the people they lead", "By how many trophies they have", "By their title"], correctAnswer: 1 },
      { id: "q4_3", question: "What is an important factor in team dynamics mentioned?", options: ["Psychological safety", "Having the loudest voice", "Always being right", "Avoiding delegation"], correctAnswer: 0 }
    ]
  },
  { 
    id: 5, 
    title: "Community Impact", 
    description: "Transform your leadership into lasting community change", 
    duration: "25 min", 
    content: `## Community Impact: Leadership as Service

### Introduction: The Ultimate Purpose of Leadership

Every module in this track has built toward this moment. You've discovered the power of individual action. You've learned to know yourself. You've mastered communication and team leadership. Now it's time to answer the question: **What will you DO with these skills?**

True leadership is not about personal glory. It's about service—using your abilities to make life better for others. This final module challenges you to think beyond yourself and create lasting positive change.

---

### Lesson 1: Leadership Is Service

**The Servant Leadership Model:**
Robert Greenleaf proposed a revolutionary idea: the best leaders are those who serve first. They ask not "How can people help me achieve my goals?" but "How can I help people achieve theirs?"

**Characteristics of Servant Leaders:**
- **Listening:** Seeking to understand before being understood
- **Empathy:** Caring about others' well-being
- **Healing:** Helping people grow and recover
- **Awareness:** Being present and perceptive
- **Stewardship:** Taking responsibility for the greater good
- **Commitment to Growth:** Developing people's potential
- **Building Community:** Creating belonging

**Real-World Examples:**
- Teachers who stay late to help struggling students
- Coaches who care about character as much as winning
- Students who tutor younger kids without being asked
- Anyone who sees a need and fills it, expecting nothing in return

---

### Lesson 2: The IPARD Model for Community Projects

When you're ready to create real impact, use the IPARD model:

**I - Investigation**
What does your community actually need? Don't assume—find out.

**How to Investigate:**
- Survey community members
- Interview local leaders
- Observe what's missing
- Research successful solutions elsewhere

**Key Questions:**
- What problems do people face daily?
- What resources already exist?
- What has been tried before?
- Where are the gaps?

**P - Preparation**
Plan your approach carefully before jumping in.

**Preparation Steps:**
- Define your goal clearly (SMART goals)
- Identify resources needed
- Build your team
- Create a timeline
- Anticipate obstacles and plan responses
- Get necessary permissions or support

**A - Action**
Execute your plan while staying flexible.

**Action Principles:**
- Start small, learn fast
- Communicate constantly
- Adapt when things don't work
- Celebrate small wins along the way
- Document everything (photos, data, stories)

**R - Reflection**
Stop regularly to learn from experience.

**Reflection Questions:**
- What's working? What's not?
- What are we learning?
- How can we improve?
- Are we still addressing the real need?

**D - Demonstration**
Share your impact with others.

**Demonstration Methods:**
- Present to school or community
- Create a video or photo essay
- Write about your experience
- Teach others to replicate your project
- Celebrate and thank everyone involved

---

### Lesson 3: Finding Your Cause

**Where Passion Meets Need:**
The best community projects happen at the intersection of:
- What you CARE about (your passion)
- What you're GOOD at (your strengths)
- What the community NEEDS (real problems)

**Cause Categories to Consider:**

**Environment:**
- Campus beautification
- Recycling programs
- Community gardens
- Wildlife conservation

**Education:**
- Tutoring programs
- Literacy initiatives
- School supply drives
- Mentoring younger students

**Health & Wellness:**
- Mental health awareness
- Anti-bullying campaigns
- Healthy living education
- Senior citizen support

**Social Connection:**
- New student welcome programs
- Loneliness reduction initiatives
- Cross-cultural understanding
- Intergenerational programs

**Hunger & Poverty:**
- Food drives
- Clothing collections
- Fundraising for shelters
- Awareness campaigns

---

### Lesson 4: Sustainable Impact

**The Difference Between Events and Movements:**
An event happens once. A movement creates lasting change.

**How to Make Your Impact Last:**

**1. Build Systems, Not Just Actions**
Don't just collect food once—create an ongoing collection system.

**2. Develop Future Leaders**
Train others to continue the work when you move on.

**3. Document Everything**
Create guides, processes, and records others can use.

**4. Connect to Existing Structures**
Partner with clubs, organizations, or administrators who can sustain the work.

**5. Measure and Celebrate Impact**
Track what you've accomplished so others can see the value.

---

### Lesson 5: Your Leadership Legacy

**The Legacy Question:**
What do you want people to say about you after you've graduated? What mark will you leave on your school community?

**Legacy Thinking:**
- Focus on impact, not recognition
- Plant trees you won't sit under
- Invest in people, not just projects
- Think generationally—what will matter in 10 years?

**Examples of Student Legacies:**
- The student who started a peer tutoring program that still runs 5 years later
- The group that planted a community garden that feeds families today
- The athlete who started a "kindness in sports" culture shift
- The quiet student who befriended new kids, changing the school's welcoming culture

---

### Lesson 6: The EchoDeed Scholarship Journey

**Your Path to the $500 Leadership Scholarship:**

As you complete this Leadership Certificate Track, remember what you're working toward:

**Pillar 1: Mentor Training (This Module Series)**
You're developing the knowledge and skills to lead.

**Pillar 2: Impact Quests**
You're putting leadership into action through verified community service.
*Remember the Wildcat Rule: At least one quest must involve mentoring middle school students!*

**Pillar 3: Portfolio Defense**
You'll present your journey and demonstrate what you've learned.

**The Deadline:**
All three pillars must be completed by **May 15th** to qualify as a scholarship finalist.

**What This Means:**
You're not just earning a certificate—you're developing the skills and experiences that will shape your future. College admissions officers and employers value authentic leadership experience more than almost anything else.

---

### Activity: Your Impact Plan

Take 10 minutes to draft your community impact vision:

**1. The Need I Want to Address:**
What problem or opportunity do you see in your school or community?

**2. Why This Matters to Me:**
What personal connection do you have to this issue?

**3. Who I Would Involve:**
What people or groups would be part of your team?

**4. First Steps:**
What are 3 things you could do in the next week to start investigating?

**5. My Legacy Statement:**
Complete this sentence: "Before I graduate, I want to be known as the person who _______________."

---

### Key Takeaways

✓ Leadership is ultimately about service
✓ The IPARD model guides effective community projects
✓ The best causes combine your passion, strengths, and real community needs
✓ Sustainable impact requires systems, not just events
✓ Your legacy is what you leave behind for others
✓ The Leadership Certificate Track prepares you for real-world leadership

---

### Final Reflection Question
What kind of impact do you want to leave on your school before you graduate? Be specific—describe what you want to create, who it will help, and why it matters to you.

---

## Congratulations!

You've completed all five leadership modules. You now have the foundational knowledge to:
- Take individual initiative (The Power of One)
- Lead with self-awareness (Self-Awareness)
- Communicate effectively (Effective Communication)
- Build and motivate teams (Team Leadership)
- Create lasting community impact (Community Impact)

**Next Steps:**
1. Complete your 250-word reflection on your leadership journey
2. Begin your Impact Quests (don't forget the Wildcat Rule!)
3. Prepare for your Portfolio Defense

Your leadership journey is just beginning. The world needs what you have to offer. Go create your ripple effect! 🌊`,
    questions: [
      { id: "q5_1", question: "What is leadership ultimately about according to this module?", options: ["Control", "Service", "Fame", "Wealth"], correctAnswer: 1 },
      { id: "q5_2", question: "What does the 'I' in IPARD stand for?", options: ["Impact", "Investigation", "Initiative", "Interest"], correctAnswer: 1 },
      { id: "q5_3", question: "A leadership track culminates in what?", options: ["A test", "A project that leaves a positive legacy", "A summer vacation", "A new title"], correctAnswer: 1 }
    ]
  },
];

interface SpringSprintProps {
  onBack?: () => void;
}

export function SpringSprint({ onBack }: SpringSprintProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { schoolLevel } = useSchoolLevel();
  const isMiddleSchool = schoolLevel === 'middle_school';
  const [reflection, setReflection] = useState("");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { data: progress, isLoading } = useQuery<LeadershipProgress>({
    queryKey: ['/api/leadership-track/progress'],
    enabled: !isMiddleSchool, // Only fetch for high school
  });

  const { data: questsData } = useQuery<{ verified: number; pending: number; hasMiddleSchoolQuest: boolean }>({
    queryKey: ['/api/leadership-track/quests'],
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleNumber: number) => {
      return await apiRequest('POST', `/api/leadership-track/module/${moduleNumber}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leadership-track/progress'] });
      toast({ title: "Module Completed!", description: "Great work on your leadership journey!" });
      setActiveModuleId(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete module", variant: "destructive" });
    },
  });

  const handleQuizSubmit = (moduleId: number) => {
    const module = LEADERSHIP_MODULES.find(m => m.id === moduleId);
    if (!module || !module.questions) return;

    const allCorrect = module.questions.every((q, idx) => quizAnswers[`${moduleId}_${idx}`] === q.correctAnswer);

    if (allCorrect) {
      setQuizSubmitted(true);
      completeModuleMutation.mutate(moduleId);
    } else {
      toast({ 
        title: "Try Again", 
        description: "Some answers were incorrect. Please review the content and try again.", 
        variant: "destructive" 
      });
    }
  };

  const submitReflectionMutation = useMutation({
    mutationFn: async (reflectionText: string) => {
      return await apiRequest('POST', '/api/leadership-track/reflection', { reflection: reflectionText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leadership-track/progress'] });
      toast({ title: "Reflection Submitted!", description: "Your personal reflection has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit reflection", variant: "destructive" });
    },
  });

  const getModuleStatus = (moduleNum: number): boolean => {
    if (!progress) return false;
    const key = `module${moduleNum}Complete` as keyof LeadershipProgress;
    return progress[key] === 1;
  };

  const completedModules = progress ? 
    [progress.module1Complete, progress.module2Complete, progress.module3Complete, progress.module4Complete, progress.module5Complete]
      .filter(m => m === 1).length : 0;

  const pillar1Progress = (completedModules / 5) * 100;
  // Wildcat Rule: Must have at least 1 Middle School Mentoring quest to complete Pillar 2
  const hasWildcatRule = questsData?.hasMiddleSchoolQuest ?? false;
  const verifiedQuests = questsData?.verified ?? 0;
  // Pillar 2 caps at 75% without Middle School quest (3/4 quests), 100% only with Wildcat Rule
  const pillar2Progress = questsData ? 
    (hasWildcatRule ? (Math.min(verifiedQuests, 4) / 4) * 100 : Math.min((Math.min(verifiedQuests, 3) / 4) * 100, 75)) : 0;
  const pillar3Progress = progress?.portfolioDefenseApproved === 1 ? 100 : 0;
  const overallProgress = Math.round((pillar1Progress + pillar2Progress + pillar3Progress) / 3);

  const allModulesComplete = completedModules === 5;
  const wordCount = reflection.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (isLoading && !isMiddleSchool) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
        <p style={{ color: '#6b7280' }}>Loading your leadership journey...</p>
      </div>
    );
  }

  // MIDDLE SCHOOL CONTENT - Age-appropriate Spring Sprint activities
  if (isMiddleSchool) {
    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '24px',
        minHeight: '100vh'
      }}>
        {/* Back Button */}
        {onBack && (
          <div style={{ marginBottom: '16px' }}>
            <BackButton onClick={onBack} label="Back to Dashboard" />
          </div>
        )}
        
        {/* Middle School Header - Fun & Colorful */}
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌟</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            Spring Kindness Challenge
          </h1>
          <h2 style={{ fontSize: '18px', fontWeight: '600', opacity: 0.9, marginBottom: '16px' }}>
            Be a Kindness Champion! 🏆
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.9, maxWidth: '500px', margin: '0 auto' }}>
            Complete fun kindness activities this spring and earn awesome rewards!
          </p>
        </div>

        {/* Weekly Challenge Cards */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
            🎯 This Week's Challenges
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Challenge 1: Compliment Quest */}
            <Card style={{ 
              border: '2px solid #10B981', 
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
            }}>
              <CardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    💬
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#065F46', marginBottom: '4px' }}>
                      Compliment Quest
                    </h4>
                    <p style={{ fontSize: '13px', color: '#047857', marginBottom: '8px' }}>
                      Give 3 genuine compliments to classmates today!
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Progress value={66} style={{ flex: 1, height: '8px' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>2/3</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#10B981',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    +15 Tokens
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge 2: Helper Hero */}
            <Card style={{ 
              border: '2px solid #8B5CF6', 
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
            }}>
              <CardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    🦸
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#5B21B6', marginBottom: '4px' }}>
                      Helper Hero
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6D28D9', marginBottom: '8px' }}>
                      Help a teacher or staff member with a task
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Progress value={0} style={{ flex: 1, height: '8px' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#7C3AED' }}>0/1</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#8B5CF6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    +25 Tokens
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge 3: Friendship Friday */}
            <Card style={{ 
              border: '2px solid #EC4899', 
              background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)'
            }}>
              <CardContent style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    🤝
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#9D174D', marginBottom: '4px' }}>
                      Friendship Friday
                    </h4>
                    <p style={{ fontSize: '13px', color: '#BE185D', marginBottom: '8px' }}>
                      Sit with someone new at lunch this week
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Progress value={100} style={{ flex: 1, height: '8px' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#DB2777' }}>✓ Done!</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#EC4899',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    +20 Tokens
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Spring Kindness Bingo */}
        <Card style={{ 
          marginBottom: '24px', 
          border: '2px solid #F59E0B',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
        }}>
          <CardHeader>
            <CardTitle style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              color: '#92400E'
            }}>
              <span style={{ fontSize: '28px' }}>🎲</span>
              Spring Kindness Bingo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '14px', color: '#B45309', marginBottom: '16px' }}>
              Complete a row, column, or diagonal to earn bonus tokens!
            </p>
            
            {/* Simple 3x3 Bingo Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px',
              maxWidth: '320px',
              margin: '0 auto'
            }}>
              {[
                { text: 'Hold door', done: true },
                { text: 'Say thanks', done: true },
                { text: 'Share snack', done: false },
                { text: 'Help clean', done: false },
                { text: '⭐ FREE', done: true },
                { text: 'Smile wave', done: true },
                { text: 'Pick up trash', done: false },
                { text: 'Encourage', done: true },
                { text: 'Include new friend', done: false },
              ].map((cell, idx) => (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '8px',
                    background: cell.done 
                      ? 'linear-gradient(135deg, #10B981, #059669)' 
                      : 'white',
                    color: cell.done ? 'white' : '#6B7280',
                    border: cell.done ? 'none' : '2px solid #E5E7EB',
                    boxShadow: cell.done ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  {cell.done && cell.text !== '⭐ FREE' ? '✓ ' : ''}{cell.text}
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '16px', 
              textAlign: 'center',
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
                🎁 Complete a line for +50 bonus tokens!
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fun Achievements Section */}
        <Card style={{ marginBottom: '24px' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy className="text-yellow-500" size={24} />
              Your Kindness Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px',
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E' }}>Kindness Star</div>
                <div style={{ fontSize: '10px', color: '#B45309' }}>10 kind acts</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px',
                background: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤗</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#3730A3' }}>Friend Finder</div>
                <div style={{ fontSize: '10px', color: '#4338CA' }}>3 new friends</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px',
                background: '#F3F4F6',
                borderRadius: '16px',
                opacity: 0.6
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🦸</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Super Helper</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Help 5 teachers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            You're Doing Amazing!
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Keep spreading kindness - every small act makes a big difference!
          </p>
        </div>
      </div>
    );
  }

  // HIGH SCHOOL CONTENT - Leadership Certificate Track
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '24px',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      {onBack && (
        <div style={{ marginBottom: '16px' }}>
          <BackButton onClick={onBack} label="Back to Dashboard" />
        </div>
      )}
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(30, 58, 95, 0.4)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          Spring Sprint 2026
        </h1>
        <h2 style={{ fontSize: '18px', fontWeight: '600', opacity: 0.9, marginBottom: '16px' }}>
          Leadership Certificate Track
        </h2>
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Award size={24} />
            <span style={{ fontWeight: '700', fontSize: '16px' }}>
              Complete the 3 pillars by May 15th to qualify for the $500 EchoDeed Scholarship
            </span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <Card style={{ marginBottom: '24px', border: '2px solid #e5e7eb' }}>
        <CardContent style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Target size={28} style={{ color: '#6366F1' }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Overall Progress</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Complete all 3 pillars to earn your certificate</p>
              </div>
            </div>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `conic-gradient(#10B981 ${overallProgress * 3.6}deg, #e5e7eb ${overallProgress * 3.6}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '20px',
                color: '#10B981'
              }}>
                {overallProgress}%
              </div>
            </div>
          </div>
          
          {progress?.isScholarshipFinalist === 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>
                Congratulations! You're a Scholarship Finalist!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pillar 1: Mentor Training */}
      <Card style={{ marginBottom: '24px', border: '2px solid #e5e7eb' }}>
        <CardHeader style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GraduationCap size={28} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 1: Mentor Training</div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>The Foundation - Complete all 5 core modules</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '700' }}>
              {completedModules}/5
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '24px' }}>
          <Progress value={pillar1Progress} style={{ height: '8px', marginBottom: '20px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LEADERSHIP_MODULES.map((module) => {
              const isComplete = getModuleStatus(module.id);
              const isActive = activeModuleId === module.id;
              
              return (
                <div key={module.id}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: isComplete ? '#ECFDF5' : isActive ? '#EEF2FF' : '#F9FAFB',
                      borderRadius: '12px',
                      border: isComplete ? '2px solid #10B981' : isActive ? '2px solid #6366F1' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveModuleId(isActive ? null : module.id)}
                  >
                    {isComplete ? (
                      <CheckCircle size={24} style={{ color: '#10B981' }} />
                    ) : (
                      <Circle size={24} style={{ color: '#9CA3AF' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: isComplete ? '#059669' : '#1F2937' }}>
                        Module {module.id}: {module.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                        {module.description}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>
                      {module.duration}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div style={{
                      marginTop: '12px',
                      padding: '20px',
                      background: '#F3F4F6',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ marginBottom: '20px' }}>
                        {module.content ? (
                          <ModuleContentViewer content={module.content} />
                        ) : (
                          <div style={{ 
                            color: '#374151', 
                            fontSize: '14px', 
                            lineHeight: '1.6',
                            padding: '16px',
                            background: 'white',
                            borderRadius: '8px',
                            borderLeft: '4px solid #6366F1'
                          }}>
                            {`Complete the "${module.title}" module by reading the content and reflecting on how it applies to your leadership journey.`}
                          </div>
                        )}
                      </div>

                      {!isComplete && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                          <h5 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px', color: '#1F2937' }}>
                            Module Quiz
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {module.questions?.map((q, qIdx) => (
                              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>
                                  {qIdx + 1}. {q.question}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  {q.options.map((option, oIdx) => (
                                    <Button
                                      key={oIdx}
                                      variant="outline"
                                      style={{
                                        justifyContent: 'flex-start',
                                        fontSize: '12px',
                                        padding: '8px 12px',
                                        height: 'auto',
                                        textAlign: 'left',
                                        background: quizAnswers[`${module.id}_${qIdx}`] === oIdx ? '#EEF2FF' : 'white',
                                        borderColor: quizAnswers[`${module.id}_${qIdx}`] === oIdx ? '#6366F1' : '#e5e7eb'
                                      }}
                                      onClick={() => setQuizAnswers({ ...quizAnswers, [`${module.id}_${qIdx}`]: oIdx })}
                                    >
                                      {option}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            onClick={() => handleQuizSubmit(module.id)}
                            disabled={completeModuleMutation.isPending || (module.questions?.length || 0) !== Object.keys(quizAnswers).filter(k => k.startsWith(`${module.id}_`)).length}
                            style={{
                              marginTop: '20px',
                              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                              color: 'white',
                              fontWeight: '600',
                              width: '100%'
                            }}
                          >
                            {completeModuleMutation.isPending ? 'Submitting...' : 'Submit Quiz & Complete Module'}
                          </Button>
                        </div>
                      )}
                      {isComplete && (
                        <div style={{
                          textAlign: 'center',
                          padding: '8px',
                          background: '#ECFDF5',
                          borderRadius: '8px',
                          color: '#059669',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          ✓ Module Completed
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Personal Reflection - Only shows after all 5 modules complete */}
          {allModulesComplete && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '12px',
              border: '2px solid #F59E0B'
            }}>
              <h4 style={{ fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} />
                Personal Reflection (Required)
              </h4>
              <p style={{ fontSize: '14px', color: '#78350F', marginBottom: '12px' }}>
                Write a 250-word reflection on your leadership journey and what you've learned from the 5 modules.
              </p>
              
              {progress?.personalReflection ? (
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #D97706'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontWeight: '600' }}>Reflection Submitted</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#4B5563', whiteSpace: 'pre-wrap' }}>
                    {progress.personalReflection}
                  </p>
                </div>
              ) : (
                <>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Share your leadership journey..."
                    style={{ minHeight: '150px', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: wordCount >= 250 ? '#059669' : '#78350F' }}>
                      {wordCount}/250 words {wordCount >= 250 ? '✓' : '(minimum 250 required)'}
                    </span>
                    <Button
                      onClick={() => submitReflectionMutation.mutate(reflection)}
                      disabled={wordCount < 250 || submitReflectionMutation.isPending}
                      style={{
                        background: wordCount >= 250 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#D1D5DB',
                        color: 'white'
                      }}
                    >
                      {submitReflectionMutation.isPending ? 'Submitting...' : 'Submit Reflection'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pillar 2: Impact Quests */}
      <Card style={{ marginBottom: '24px', border: '2px solid #e5e7eb' }}>
        <CardHeader style={{ background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={28} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 2: Impact Quests</div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>The Action - Log and verify 4 acts of community service</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '700' }}>
              {questsData?.verified || 0}/4
              {(questsData?.pending || 0) > 0 && (
                <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '4px' }}>
                  (+{questsData?.pending} pending)
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '24px' }}>
          <Progress value={pillar2Progress} style={{ height: '8px', marginBottom: '20px' }} />
          
          <div style={{
            background: questsData?.hasMiddleSchoolQuest ? '#ECFDF5' : '#FEF3C7',
            border: questsData?.hasMiddleSchoolQuest ? '2px solid #10B981' : '2px solid #F59E0B',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {questsData?.hasMiddleSchoolQuest ? (
                <CheckCircle size={24} style={{ color: '#10B981' }} />
              ) : (
                <Circle size={24} style={{ color: '#F59E0B' }} />
              )}
              <div>
                <div style={{ fontWeight: '700', color: questsData?.hasMiddleSchoolQuest ? '#059669' : '#B45309' }}>
                  🐾 The Wildcat Rule
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  At least one quest must be a Middle School Mentoring Session
                </div>
                {!questsData?.hasMiddleSchoolQuest && verifiedQuests >= 3 && (
                  <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600', marginTop: '4px' }}>
                    ⚠️ Pillar 2 capped at 75% until Middle School quest is completed
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: '#F3F4F6',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Log your community service hours with photo evidence or request teacher verification
            </p>
            <Button
              variant="outline"
              style={{ borderColor: '#EC4899', color: '#EC4899' }}
            >
              Log New Impact Quest
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 3: Leadership Portfolio Defense */}
      <Card style={{ marginBottom: '24px', border: '2px solid #e5e7eb' }}>
        <CardHeader style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={28} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 3: Leadership Portfolio Defense</div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>The Validation - 10-minute presentation + faculty endorsement</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '700' }}>
              {progress?.portfolioDefenseApproved === 1 ? '✓ Approved' : 'Pending'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '24px' }}>
          <Progress value={pillar3Progress} style={{ height: '8px', marginBottom: '20px' }} />
          
          <div style={{
            background: progress?.portfolioDefenseApproved === 1 ? '#ECFDF5' : '#F3F4F6',
            border: progress?.portfolioDefenseApproved === 1 ? '2px solid #10B981' : '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            {progress?.portfolioDefenseApproved === 1 ? (
              <>
                <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
                <h4 style={{ fontWeight: '700', fontSize: '18px', color: '#059669', marginBottom: '8px' }}>
                  Portfolio Defense Approved!
                </h4>
                <p style={{ color: '#6b7280' }}>
                  Approved by faculty on {progress.portfolioDefenseApprovedAt ? new Date(progress.portfolioDefenseApprovedAt).toLocaleDateString() : 'N/A'}
                </p>
              </>
            ) : (
              <>
                <Calendar size={48} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
                <h4 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
                  Schedule Your Portfolio Defense
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  Present your leadership journey to a faculty panel. This 10-minute presentation showcases your growth and community impact.
                </p>
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  color: '#B45309'
                }}>
                  Contact your advisor to schedule your presentation
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Section - Shows when 100% complete */}
      {overallProgress === 100 && (
        <Card style={{ 
          border: '3px solid #10B981',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
        }}>
          <CardContent style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎓</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginBottom: '12px' }}>
              Leadership Certificate Earned!
            </h3>
            <p style={{ color: '#047857', marginBottom: '24px' }}>
              Congratulations on completing the Spring Sprint 2026 Leadership Certificate Track!
            </p>
            <Button
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontWeight: '700',
                padding: '16px 32px',
                fontSize: '16px'
              }}
            >
              Download Certificate (PDF)
            </Button>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
              Dual-signed by Principal and Corporate Sponsor
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}