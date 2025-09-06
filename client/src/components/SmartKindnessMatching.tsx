import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Clock, MapPin, Star, Users, Zap, Target, CheckCircle } from 'lucide-react';

interface KindnessOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  timeRequired: string;
  location: string;
  skillsNeeded: string[];
  impactScore: number;
  urgency: 'low' | 'medium' | 'high';
  matchScore: number;
  participants: number;
  maxParticipants: number;
  deadline: string;
  organizer: string;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isRemote: boolean;
  tags: string[];
}

interface UserPreferences {
  preferredCategories: string[];
  availableHours: number;
  skillSet: string[];
  maxTravelDistance: number;
  preferredTimeSlots: string[];
  impactFocus: string[];
}

interface MatchingStats {
  totalOpportunities: number;
  perfectMatches: number;
  thisWeekMatches: number;
  averageImpactScore: number;
  userRating: number;
}

export function SmartKindnessMatching() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const queryClient = useQueryClient();

  // Fetch kindness opportunities
  const { data: opportunities, isLoading } = useQuery<KindnessOpportunity[]>({
    queryKey: ['/api/kindness/matches', selectedCategory],
    refetchInterval: 30000, // Update every 30 seconds for real-time matching
  });

  // Fetch matching stats
  const { data: stats } = useQuery<MatchingStats>({
    queryKey: ['/api/kindness/matching-stats'],
    refetchInterval: 60000,
  });

  // Join opportunity mutation
  const joinOpportunity = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await fetch(`/api/kindness/opportunities/${opportunityId}/join`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to join opportunity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kindness/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kindness/matching-stats'] });
    }
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,113,133,0.1) 0%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(251,113,133,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Finding Your Perfect Kindness Matches...</span>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      default: return '✅';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return '#8B5CF6';
      case 'intermediate': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const categories = [
    { id: 'all', name: 'All Opportunities', icon: '🌟' },
    { id: 'community', name: 'Community Support', icon: '🏘️' },
    { id: 'elderly', name: 'Elder Care', icon: '👴' },
    { id: 'environment', name: 'Environmental', icon: '🌱' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'health', name: 'Health & Wellness', icon: '🏥' },
    { id: 'animals', name: 'Animal Care', icon: '🐾' },
    { id: 'technology', name: 'Tech for Good', icon: '💻' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(251,113,133,0.05) 0%, rgba(168,85,247,0.05) 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(251,113,133,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>🎯</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#EC4899' }}>
              Smart Kindness Matching
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              AI-powered personalized kindness opportunities based on your skills & preferences
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#EC4899' }}>
                {stats.totalOpportunities}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Matches</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                {stats.perfectMatches}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Perfect Matches</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>
                {stats.averageImpactScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg Impact</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                {stats.userRating.toFixed(1)}★
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Your Rating</div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedCategory === category.id ? '#EC4899' : 'white',
                color: selectedCategory === category.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              data-testid={`category-${category.id}`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: '#f9fafb', 
          padding: '16px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={16} style={{ color: '#EC4899' }} />
            Personalized Matches for You
          </div>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            data-testid="preferences-button"
          >
            <Target size={14} />
            Preferences
          </button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {opportunities && opportunities.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    transition: 'all 0.2s ease',
                    background: opportunity.matchScore >= 90 ? '#fef7ff' : 'white',
                    borderColor: opportunity.matchScore >= 90 ? '#EC4899' : '#e5e7eb'
                  }}
                  data-testid={`opportunity-${opportunity.id}`}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                          {opportunity.title}
                        </h3>
                        {opportunity.matchScore >= 95 && (
                          <span style={{
                            background: '#EC4899',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            PERFECT MATCH
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                        {opportunity.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: getUrgencyIcon(opportunity.urgency) === '🚨' ? '16px' : '14px' }}>
                        {getUrgencyIcon(opportunity.urgency)}
                      </span>
                      <div style={{
                        backgroundColor: '#f0f9ff',
                        color: '#3B82F6',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {opportunity.matchScore}% Match
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{opportunity.timeRequired}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {opportunity.isRemote ? 'Remote' : opportunity.location}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {opportunity.participants}/{opportunity.maxParticipants} joined
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} style={{ color: '#F59E0B' }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Impact: {opportunity.impactScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Skills & Tags */}
                  {(opportunity.skillsNeeded.length > 0 || opportunity.tags.length > 0) && (
                    <div style={{ marginBottom: '16px' }}>
                      {opportunity.skillsNeeded.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginRight: '8px' }}>
                            Skills:
                          </span>
                          {opportunity.skillsNeeded.map((skill, index) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: getDifficultyColor(opportunity.difficulty),
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: '600',
                                marginRight: '4px'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {opportunity.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {opportunity.tags.map((tag, index) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: '500'
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Benefits */}
                  {opportunity.benefits.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        What you'll gain:
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                        {opportunity.benefits.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => joinOpportunity.mutate(opportunity.id)}
                      disabled={joinOpportunity.isPending || opportunity.participants >= opportunity.maxParticipants}
                      style={{
                        background: opportunity.participants >= opportunity.maxParticipants ? '#9CA3AF' : '#EC4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: opportunity.participants >= opportunity.maxParticipants ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      data-testid={`join-${opportunity.id}`}
                    >
                      {joinOpportunity.isPending ? (
                        <>
                          <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Joining...
                        </>
                      ) : opportunity.participants >= opportunity.maxParticipants ? (
                        <>
                          <CheckCircle size={14} />
                          Full
                        </>
                      ) : (
                        <>
                          <Heart size={14} />
                          Join & Help
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🎯</span>
              <p>No kindness opportunities found matching your preferences.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Try adjusting your category filter or update your preferences for better matches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time indicator */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#EC4899',
          animation: 'pulse 2s infinite'
        }}></div>
        Smart matching • Updates every 30 seconds
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}