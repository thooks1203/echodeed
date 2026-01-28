import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';

const presentations = [
  {
    id: 'full-presentation',
    title: 'Full Middle School Presentation',
    description: 'Complete slide-by-slide presentation for school demos',
    icon: '📊',
  },
  {
    id: 'one-pager',
    title: 'One-Pager Leave-Behind',
    description: 'Quick visual summary to leave with principals',
    icon: '📄',
  },
  {
    id: 'talking-points',
    title: 'Talking Points & Demo Guide',
    description: 'Key phrases, objection handlers, and demo flow',
    icon: '🎤',
  },
];

function FullPresentation() {
  return (
    <div className="presentation-content">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">EchoDeed™ for Middle Schools</h1>
        <h2 className="text-2xl text-gray-600">Eastern Guilford Middle School Demo Presentation</h2>
        <p className="text-lg text-gray-500 mt-2">For Principal McNeil</p>
      </div>

      <div className="page-break" />

      <section className="mb-8">
        <h2 className="text-3xl font-bold text-purple-600 border-b-4 border-purple-600 pb-2 mb-4">Welcome to EchoDeed™</h2>
        <p className="text-xl italic text-gray-600 mb-4">"Character Education, Reimagined"</p>
        <p className="text-lg font-semibold">Where Kindness Becomes Currency and Character Builds Community</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">The Challenge We Solve</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <th className="p-3 text-left">Current Reality</th>
              <th className="p-3 text-left">EchoDeed Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50"><td className="p-3 border">Character education feels like a "checklist"</td><td className="p-3 border">Makes kindness FUN and rewarding</td></tr>
            <tr><td className="p-3 border">Hard to measure character outcomes</td><td className="p-3 border">Real-time data and metrics</td></tr>
            <tr className="bg-gray-50"><td className="p-3 border">Students lack sense of belonging</td><td className="p-3 border">Community-building through shared kindness</td></tr>
            <tr><td className="p-3 border">Administrative burden on teachers</td><td className="p-3 border">Automated tracking and reporting</td></tr>
            <tr className="bg-gray-50"><td className="p-3 border">No tangible recognition for good behavior</td><td className="p-3 border">Token rewards + real prizes from local businesses</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Why EchoDeed for Middle School?</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Age-Appropriate Design</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fun, engaging interface designed for grades 6-8</li>
              <li>Colorful, emoji-rich experience</li>
              <li>Safe, moderated environment</li>
              <li>FERPA compliant</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Optional Community Service</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>NO mandatory hour requirements</li>
              <li>Students CHOOSE to participate</li>
              <li>Focuses on character growth</li>
              <li>Builds habits before high school</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Core Features for Students</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="font-bold">Share Kindness Acts</h3>
            <p className="text-sm text-gray-600">"Did something nice? Share it anonymously!"</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🪙</div>
            <h3 className="font-bold">Earn Tokens</h3>
            <p className="text-sm text-gray-600">25, 75, 150, 300 tokens for acts of kindness</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🎁</div>
            <h3 className="font-bold">Redeem Rewards</h3>
            <p className="text-sm text-gray-600">Chick-fil-A, Science Center, and more!</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Core Features for Parents</h2>
        <div className="bg-pink-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Dual Rewards System</h3>
          <p className="italic mb-2">"When your child wins, you win too!"</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Parents earn tokens when children do good</li>
            <li>Family leaderboards</li>
            <li>Shared celebration of character growth</li>
            <li>Real-time visibility into kindness journey</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Core Features for Teachers</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Reduce Workload</h3>
          <p className="italic mb-2">"Less paperwork. More impact."</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Automated tracking</li>
            <li>One-click verification</li>
            <li>Pre-built reporting</li>
            <li>Character Excellence Awards (50-250 bonus tokens)</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Core Features for School Leaders</h2>
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Real-Time Inclusion Score</h3>
          <p className="italic mb-2">"Measure what matters"</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Daily pulse checks from students</li>
            <li>"How supported do you feel in your school community?"</li>
            <li>Anonymous, safe reporting</li>
            <li>Trend analytics over time</li>
            <li>Behavioral climate monitoring</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Implementation Timeline</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <th className="p-3 text-left">Phase</th>
              <th className="p-3 text-left">Timeline</th>
              <th className="p-3 text-left">What Happens</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50"><td className="p-3 border font-bold">Setup</td><td className="p-3 border">Week 1</td><td className="p-3 border">School registration, teacher accounts</td></tr>
            <tr><td className="p-3 border font-bold">Launch</td><td className="p-3 border">Week 2</td><td className="p-3 border">Student onboarding, parent invites</td></tr>
            <tr className="bg-gray-50"><td className="p-3 border font-bold">Grow</td><td className="p-3 border">Weeks 3-4</td><td className="p-3 border">First rewards redeemed, culture building</td></tr>
            <tr><td className="p-3 border font-bold">Measure</td><td className="p-3 border">Month 2+</td><td className="p-3 border">Reports, data analysis, optimization</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8 text-center bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Let's Build a Kinder School Together</h2>
        <p className="text-lg italic mb-4">"Every act of kindness, no matter how small, creates ripples that can change the world."</p>
        <p className="font-bold">Ready to start building a culture of kindness at Eastern Guilford Middle School?</p>
        <p className="mt-4 text-gray-600">Contact: hello@echodeed.com</p>
      </section>
    </div>
  );
}

function OnePager() {
  return (
    <div className="presentation-content">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600">EchoDeed™ One-Pager</h1>
        <p className="text-lg italic text-gray-600">Character Education, Reimagined</p>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">The Problem</h2>
        <p>Schools struggle to build character culture, measure outcomes, and create belonging - all while managing administrative burden.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">The Solution</h2>
        <p><strong>EchoDeed™</strong> is a mobile-first platform where students share anonymous acts of kindness, earn tokens, and redeem them for real rewards from local businesses.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">How It Works</h2>
        <div className="text-center bg-gray-100 p-4 rounded-lg font-mono">
          Share Kindness → Earn Tokens → Get Rewards
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Key Features</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <th className="p-2">For Students</th>
              <th className="p-2">For Parents</th>
              <th className="p-2">For Teachers</th>
              <th className="p-2">For Leaders</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="p-2 border">Share kind acts anonymously</td>
              <td className="p-2 border">Earn tokens when kids do good</td>
              <td className="p-2 border">One-click verification</td>
              <td className="p-2 border">Real-time Inclusion Score</td>
            </tr>
            <tr>
              <td className="p-2 border">Earn tokens for kindness</td>
              <td className="p-2 border">Track child's progress</td>
              <td className="p-2 border">Character Excellence Awards</td>
              <td className="p-2 border">Behavioral climate data</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-2 border">Redeem real rewards</td>
              <td className="p-2 border">Family leaderboards</td>
              <td className="p-2 border">Reduce paperwork</td>
              <td className="p-2 border">Compliance reporting</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Why Middle School Loves EchoDeed</h2>
        <ul className="grid grid-cols-2 gap-2">
          <li className="flex items-center"><span className="mr-2">✅</span> Optional service (not required hours)</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Fun age-appropriate design</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Safe AI-moderated content</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Anonymous removes social pressure</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Real rewards kids actually want</li>
          <li className="flex items-center"><span className="mr-2">✅</span> FERPA Compliant</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Local Business Partners</h2>
        <p className="text-center text-gray-600">Chick-fil-A | Greensboro Science Center | Biscuitville | Moe's | Target | Scholastic Books | LEGO Education | Amazon Family</p>
      </section>

      <div className="text-center bg-purple-100 p-4 rounded-lg">
        <p className="font-bold text-purple-600">Contact: hello@echodeed.com | Website: echodeed.com</p>
        <p className="text-sm italic mt-2">"Every act of kindness creates ripples that change the world."</p>
      </div>
    </div>
  );
}

function TalkingPoints() {
  return (
    <div className="presentation-content">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600">EchoDeed™ Demo Talking Points</h1>
        <p className="text-lg text-gray-600">For Eastern Guilford Middle School - Principal McNeil</p>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Opening Hook (30 seconds)</h2>
        <blockquote className="bg-purple-50 border-l-4 border-purple-600 p-4 italic">
          "What if I told you that you could measure your school's sense of belonging in real-time, reward students for being kind, AND reduce your character education paperwork - all with one platform?"
        </blockquote>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">The 30-Second Pitch</h2>
        <blockquote className="bg-indigo-50 border-l-4 border-indigo-600 p-4 italic">
          "EchoDeed is where kindness becomes currency. Students anonymously share good deeds, earn tokens, and redeem them for real rewards from places like Chick-fil-A. Meanwhile, YOU get real-time data on how supported your students feel. It's character education that kids actually WANT to do."
        </blockquote>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Key Phrases to Use</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <h4 className="font-bold mb-2">For the "Why" Question</h4>
            <ul className="space-y-1">
              <li>"Make character education feel like a game, not homework"</li>
              <li>"Measure what matters - belonging, not just behavior"</li>
              <li>"Turn invisible kindness into visible culture"</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-bold mb-2">For the "How" Question</h4>
            <ul className="space-y-1">
              <li>"Students share → Earn tokens → Get rewards"</li>
              <li>"Anonymous posting removes social pressure"</li>
              <li>"AI keeps everything safe and appropriate"</li>
            </ul>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <h4 className="font-bold mb-2">For the "What's Different" Question</h4>
            <ul className="space-y-1">
              <li>"The only platform with dual rewards - students AND parents earn"</li>
              <li>"Real local business partners, not just digital badges"</li>
              <li>"Built for middle school - optional service, not required hours"</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Objection Handlers</h2>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-bold">"We already do character education"</p>
            <p className="italic text-gray-600">"Great! EchoDeed amplifies what you're doing. It makes the invisible kindness in your building visible and measurable."</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-bold">"Students might abuse the system"</p>
            <p className="italic text-gray-600">"Everything is AI-moderated. Inappropriate content is automatically flagged for human review."</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-bold">"We don't have time to implement something new"</p>
            <p className="italic text-gray-600">"Implementation takes just 1-2 weeks. Teachers get pre-built tools that REDUCE their workload."</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Questions to Ask Principal McNeil</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>"What's your biggest character education challenge right now?"</li>
          <li>"How do you currently know if students feel like they belong?"</li>
          <li>"What would success look like for you in 6 months?"</li>
          <li>"Who on your team would be the perfect EchoDeed Champion?"</li>
          <li>"What rewards would YOUR students love most?"</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-2">Closing Statement</h2>
        <blockquote className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 p-4 italic">
          "Principal McNeil, imagine walking into school every morning and seeing a real-time score of how supported your students feel. Imagine teachers celebrating character without extra paperwork. Imagine students CHOOSING to be kind because it's fun and rewarding. That's EchoDeed. Ready to bring kindness currency to Eastern Guilford?"
        </blockquote>
      </section>

      <div className="text-center bg-purple-100 p-4 rounded-lg">
        <p className="font-bold">Good luck with the demo! You've got this!</p>
      </div>
    </div>
  );
}

export default function PresentationDownloads() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handlePrint = (id: string) => {
    setExpandedId(id);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)',
      overflow: 'auto',
      padding: '2rem',
      zIndex: 50
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .presentation-content, .presentation-content * {
            visibility: visible;
          }
          .presentation-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 no-print">
          <h1 className="text-4xl font-bold text-white mb-2">EchoDeed™ Presentation Materials</h1>
          <p className="text-white/80 text-lg">For Eastern Guilford Middle School Demo</p>
          <p className="text-white/60 mt-2">Click "Print to PDF" to download any document</p>
        </div>

        <div className="space-y-4 no-print">
          {presentations.map((pres) => (
            <Card key={pres.id} className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="cursor-pointer" onClick={() => toggleExpand(pres.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{pres.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{pres.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{pres.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(pres.id);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print to PDF
                    </Button>
                    {expandedId === pres.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedId === pres.id && (
                <CardContent className="border-t">
                  <div className="bg-white p-6 rounded-lg max-h-96 overflow-y-auto">
                    {pres.id === 'full-presentation' && <FullPresentation />}
                    {pres.id === 'one-pager' && <OnePager />}
                    {pres.id === 'talking-points' && <TalkingPoints />}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {expandedId && (
          <div className="hidden print:block">
            {expandedId === 'full-presentation' && <FullPresentation />}
            {expandedId === 'one-pager' && <OnePager />}
            {expandedId === 'talking-points' && <TalkingPoints />}
          </div>
        )}

        <div className="text-center mt-8 no-print">
          <a href="/app" className="text-white/80 hover:text-white underline">
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
