import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Circle, Trophy, GraduationCap, Heart, FileText, Upload, Award, Calendar, Target } from "lucide-react";

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
  { id: 1, title: "The Power of One", description: "Discover how individual actions create ripple effects of positive change", duration: "15 min", content: "Leadership begins with a single person's decision to act. In this module, we explore the 'Ripple Effect'—how one small act of kindness or initiative can inspire others, creating a wave of positive change throughout a school community. You will learn about famous leaders who started with nothing but a vision and the courage to take the first step. Reflection: What is one small change you can make today that might inspire someone else?" },
  { id: 2, title: "Self-Awareness", description: "Understand your strengths, values, and areas for growth as a leader", duration: "20 min", content: "To lead others, you must first know yourself. This module focuses on identifying your core values, character strengths, and areas for development. We use the 'Window of Growth' model to understand how others perceive our leadership. By being honest about our strengths and weaknesses, we build the authenticity required to earn trust. Reflection: Identify three core values that define your leadership style." },
  { id: 3, title: "Effective Communication", description: "Master the art of inspiring and connecting with others", duration: "20 min", content: "Communication is the bridge between a vision and its reality. Leaders must be able to listen actively, speak with clarity, and use empathy to connect with their team. This module teaches the 'L.E.A.D.' communication framework: Listen, Empathize, Ask, and Direct. Good communication is not just about talking; it's about making sure others feel heard. Reflection: Recall a time you successfully resolved a conflict through communication." },
  { id: 4, title: "Team Leadership", description: "Learn to build, motivate, and lead high-performing teams", duration: "25 min", content: "Great leaders don't create followers; they create more leaders. In this module, we look at team dynamics and the importance of psychological safety. You'll learn how to delegate effectively, set clear goals, and celebrate the diverse strengths of your team members. A leader's success is measured by the success of the people they lead. Reflection: How do you handle a situation where a team member is struggling?" },
  { id: 5, title: "Community Impact", description: "Transform your leadership into lasting community change", duration: "25 min", content: "Leadership is ultimately about service. This final module connects your personal growth to the wider community. We explore the 'IPARD' model (Investigation, Preparation, Action, Reflection, Demonstration) and how to design projects that address real-world needs. Your leadership track culminates in a project that leaves a positive legacy. Reflection: What kind of impact do you want to leave on your school before you graduate?" },
];

export function SpringSprint() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState("");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const { data: progress, isLoading } = useQuery<LeadershipProgress>({
    queryKey: ['/api/leadership-track/progress'],
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
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete module", variant: "destructive" });
    },
  });

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

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
        <p style={{ color: '#6b7280' }}>Loading your leadership journey...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '24px',
      minHeight: '100vh'
    }}>
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
                      cursor: isComplete ? 'default' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveModuleId(isActive ? null : module.id)}
                    style={{ cursor: 'pointer' }}
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
                      <div style={{ 
                        marginBottom: '20px', 
                        color: '#374151', 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        borderLeft: '4px solid #6366F1'
                      }}>
                        {module.content || `Complete the "${module.title}" module by reading the content and reflecting on how it applies to your leadership journey.`}
                      </div>
                      {!isComplete && (
                        <Button
                          onClick={() => completeModuleMutation.mutate(module.id)}
                          disabled={completeModuleMutation.isPending}
                          style={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                            color: 'white',
                            fontWeight: '600',
                            width: '100%'
                          }}
                        >
                          {completeModuleMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                        </Button>
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