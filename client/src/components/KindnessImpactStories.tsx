import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ImpactStory {
  id: string;
  title: string;
  story: string;
  metrics: {
    rippleReach: number;
    countriesReached: number;
    peopleInspired: number;
    wellnessIncrease: number;
    chainReactionDays: number;
  };
  timeframe: 'week' | 'month' | 'year' | 'allTime';
  generatedAt: Date;
  shareableHighlight: string;
}

export function KindnessImpactStories() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year' | 'allTime'>('week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Fetch or generate impact story
  const { data: stories = [], isLoading, refetch } = useQuery<ImpactStory[]>({
    queryKey: ['/api/ai/impact-stories', selectedTimeframe],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currentStory = stories[currentStoryIndex];

  // Generate new story
  const generateNewStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-impact-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: selectedTimeframe })
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to generate story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share story
  const shareStory = (story: ImpactStory) => {
    const shareText = `${story.shareableHighlight} 

✨ ${story.title}

🌊 Reached ${story.metrics.countriesReached} countries
👥 Inspired ${story.metrics.peopleInspired} people  
📈 ${story.metrics.wellnessIncrease}% wellness increase
⚡ Chain reaction: ${story.metrics.chainReactionDays} days

Your kindness creates ripples that change the world! 💜

#KindnessMatters #EchoDeed #SpreadLove`;

    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // Could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(236,72,153,0.2)',
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✨</span>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Crafting Your Impact Story
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            AI is analyzing your kindness ripples across the globe...
          </p>
        </div>
        
        <div style={{
          width: '60px',
          height: '6px',
          background: '#f3f4f6',
          borderRadius: '3px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '30px',
            height: '100%',
            background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
            borderRadius: '3px',
            animation: 'slide 2s ease-in-out infinite'
          }} />
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}} />
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(236,72,153,0.2)',
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📖</span>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          color: '#374151'
        }}>
          Ready to See Your Impact?
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
          Generate a beautiful story about how your kindness is changing the world
        </p>
        
        <button
          onClick={generateNewStory}
          disabled={isGenerating}
          style={{
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(236,72,153,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(236,72,153,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(236,72,153,0.3)';
          }}
        >
          <span>✨</span>
          {isGenerating ? 'Generating Magic...' : 'Generate My Impact Story'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%)',
      border: '1px solid rgba(236,72,153,0.2)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>📖</span>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Your Kindness Impact Story
          </h3>
          <span style={{ fontSize: '28px' }}>✨</span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0,
          marginBottom: '16px'
        }}>
          See how your kindness creates ripples that change the world
        </p>

        {/* Timeframe Selector */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px',
          justifyContent: 'center',
          maxWidth: '320px',
          margin: '0 auto'
        }}>
          {[
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'year', label: 'This Year' },
            { key: 'allTime', label: 'All Time' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedTimeframe(key as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedTimeframe === key ? '#EC4899' : 'transparent',
                color: selectedTimeframe === key ? 'white' : '#6b7280',
                whiteSpace: 'nowrap'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Story Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(236,72,153,0.2)',
        boxShadow: '0 8px 32px rgba(236,72,153,0.1)',
        marginBottom: '20px'
      }}>
        {/* Story Title */}
        <h4 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          {currentStory.title}
        </h4>

        {/* Metrics Highlights */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(236,72,153,0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#EC4899' }}>
              {currentStory.metrics.countriesReached}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Countries Reached</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(139,92,246,0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>
              {currentStory.metrics.peopleInspired}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>People Inspired</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
              +{currentStory.metrics.wellnessIncrease}%
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Wellness Boost</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
              {currentStory.metrics.chainReactionDays}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Days of Ripples</div>
          </div>
        </div>

        {/* Story Text */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(236,72,153,0.1)',
          marginBottom: '16px'
        }}>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#374151',
            margin: 0,
            fontStyle: 'italic'
          }}>
            "{currentStory.story}"
          </p>
        </div>

        {/* Shareable Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            ✨ Your Kindness Superpower ✨
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {currentStory.shareableHighlight}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => shareStory(currentStory)}
          style={{
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 6px 20px rgba(236,72,153,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(236,72,153,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(236,72,153,0.3)';
          }}
        >
          <span>📱</span>
          Share My Story
        </button>
        
        <button
          onClick={generateNewStory}
          disabled={isGenerating}
          style={{
            background: 'rgba(139,92,246,0.1)',
            color: '#8B5CF6',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '20px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
          }}
        >
          <span>🔄</span>
          {isGenerating ? 'Creating...' : 'New Story'}
        </button>
      </div>

      {/* Story Navigation */}
      {stories.length > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <button
            onClick={() => setCurrentStoryIndex(Math.max(0, currentStoryIndex - 1))}
            disabled={currentStoryIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: currentStoryIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStoryIndex === 0 ? 0.3 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            ←
          </button>
          
          <div style={{ 
            display: 'flex', 
            gap: '4px'
          }}>
            {stories.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentStoryIndex ? '#EC4899' : '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setCurrentStoryIndex(index)}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentStoryIndex(Math.min(stories.length - 1, currentStoryIndex + 1))}
            disabled={currentStoryIndex === stories.length - 1}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: currentStoryIndex === stories.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStoryIndex === stories.length - 1 ? 0.3 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            →
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '80px' }}>
        <span style={{
          background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
        }}>
          <span>🧠</span>
          Powered by GPT-5 Storytelling
        </span>
      </div>
    </div>
  );
}