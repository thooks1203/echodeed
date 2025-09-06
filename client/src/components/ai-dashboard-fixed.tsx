import { useQuery } from "@tanstack/react-query";
import { PredictiveWellnessDashboard } from "./predictive-wellness-dashboard";
import { AIPredictionEngine } from "./AIPredictionEngine";
import { GlobalWellnessHeatmap } from "./GlobalWellnessHeatmap";
import { SmartKindnessMatching } from "./SmartKindnessMatching";
import { ESGImpactReporting } from "./ESGImpactReporting";
import { KindnessImpactCertificates } from "./KindnessImpactCertificates";
import { TimeLockedWellnessMessages } from "./TimeLockedWellnessMessages";
import AISentimentAnalyzer from "./AISentimentAnalyzer";
import { useState } from "react";
import { GlobalKindnessRippleMap } from "./GlobalKindnessRippleMap";
import { AIKindnessSuggestions } from "./AIKindnessSuggestions";
import { KindnessImpactStories } from "./KindnessImpactStories";

interface WellnessInsights {
  overallWellness: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  dominantCategories: string[];
  totalAnalyzed: number;
  avgSentiment: number;
  avgImpact: number;
}

export function AIDashboard() {
  const [activeView, setActiveView] = useState<'analytics' | 'predictive' | 'predictions' | 'heatmap' | 'matching' | 'esg' | 'certificates' | 'messages' | 'sentiment' | 'ripples' | 'suggestions' | 'stories'>('stories');

  const { data: insights, isLoading } = useQuery<WellnessInsights>({
    queryKey: ['/api/ai/wellness-insights'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Loading AI Insights...</span>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#6b7280'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}>🧠</span>
        <p>No AI insights available yet.</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Post some kindness to see AI analytics!</p>
      </div>
    );
  }

  const getTrendEmoji = (direction: string) => {
    switch (direction) {
      case 'rising': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising': return '#10B981';
      case 'declining': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>🧠</span>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            AI Impact Analysis
          </h2>
          <span style={{ fontSize: '24px' }}>✨</span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0,
          marginBottom: '16px'
        }}>
          Real-time sentiment analysis and wellness prediction
        </p>
        
        {/* View Toggle - New Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
          gap: '4px',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          {/* Priority buttons - most important ones first */}
          <button
            onClick={() => setActiveView('stories')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'stories' ? '#EC4899' : 'transparent',
              color: activeView === 'stories' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
            data-testid="tab-impact-stories"
          >
            📖 Stories
          </button>
          <button
            onClick={() => setActiveView('ripples')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'ripples' ? '#06B6D4' : 'transparent',
              color: activeView === 'ripples' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
            data-testid="tab-ripple-map"
          >
            🌊 Ripples
          </button>
          <button
            onClick={() => setActiveView('suggestions')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'suggestions' ? '#F59E0B' : 'transparent',
              color: activeView === 'suggestions' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
            data-testid="tab-ai-suggestions"
          >
            🎯 Suggestions
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'analytics' ? '#8B5CF6' : 'transparent',
              color: activeView === 'analytics' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveView('predictive')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'predictive' ? '#DC2626' : 'transparent',
              color: activeView === 'predictive' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
          >
            🔮 Predictive
          </button>
          <button
            onClick={() => setActiveView('predictions')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'predictions' ? '#667eea' : 'transparent',
              color: activeView === 'predictions' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
            data-testid="tab-ai-predictions"
          >
            🧠 Predictions
          </button>
          <button
            onClick={() => setActiveView('heatmap')}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeView === 'heatmap' ? '#10B981' : 'transparent',
              color: activeView === 'heatmap' ? 'white' : '#6b7280',
              whiteSpace: 'nowrap'
            }}
            data-testid="tab-wellness-heatmap"
          >
            🗺️ Heatmap
          </button>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'predictive' ? (
        <PredictiveWellnessDashboard />
      ) : activeView === 'predictions' ? (
        <AIPredictionEngine />
      ) : activeView === 'heatmap' ? (
        <GlobalWellnessHeatmap />
      ) : activeView === 'matching' ? (
        <SmartKindnessMatching />
      ) : activeView === 'esg' ? (
        <ESGImpactReporting />
      ) : activeView === 'certificates' ? (
        <KindnessImpactCertificates />
      ) : activeView === 'messages' ? (
        <TimeLockedWellnessMessages />
      ) : activeView === 'ripples' ? (
        <GlobalKindnessRippleMap />
      ) : activeView === 'suggestions' ? (
        <AIKindnessSuggestions />
      ) : activeView === 'stories' ? (
        <KindnessImpactStories />
      ) : (
        <>
          {/* Wellness Overview */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>💜</span>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#8B5CF6' }}>
                Community Wellness Score
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '700', 
                  color: '#8B5CF6',
                  lineHeight: 1
                }}>
                  {insights.overallWellness}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>out of 100</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getTrendEmoji(insights.trendDirection)}</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: getTrendColor(insights.trendDirection)
                }}>
                  {insights.trendDirection}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              marginTop: '16px',
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${insights.overallWellness}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Sentiment Score */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>💚</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                {insights.avgSentiment}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Avg Sentiment</div>
            </div>

            {/* Impact Score */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.1) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📊</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>
                {insights.avgImpact}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Avg Impact</div>
            </div>

            {/* Analyzed Posts */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🧮</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366F1' }}>
                {insights.totalAnalyzed}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Posts Analyzed</div>
            </div>
          </div>

          {/* Top Categories */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#D97706' }}>
                Trending Kindness Categories
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {insights.dominantCategories.map((category, index) => (
                <span 
                  key={category}
                  style={{
                    background: index === 0 
                      ? 'linear-gradient(90deg, #F59E0B, #D97706)' 
                      : index === 1
                      ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                      : 'linear-gradient(90deg, #FCD34D, #FBBF24)',
                    color: index === 2 ? '#92400e' : 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  #{index + 1} {category}
                </span>
              ))}
            </div>
          </div>

          {/* AI Powered Badge */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{
              background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🧠</span>
              Powered by GPT-5 AI
            </span>
          </div>
        </>
      )}
    </div>
  );
}