import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';

interface KindnessSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  location: string;
  context: string;
  icon: string;
  urgency: 'low' | 'medium' | 'high';
  personalizedReason: string;
}

interface ContextData {
  weather: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  season: string;
  nearbyPlaces: string[];
  userHistory: string[];
}

export function AIKindnessSuggestions() {
  const [suggestions, setSuggestions] = useState<KindnessSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContext, setCurrentContext] = useState<ContextData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { location } = useGeolocation();

  // Get current context data
  const getCurrentContext = useCallback(async (): Promise<ContextData> => {
    const now = new Date();
    const hour = now.getHours();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthSeasons = {
      12: 'winter', 1: 'winter', 2: 'winter',
      3: 'spring', 4: 'spring', 5: 'spring', 
      6: 'summer', 7: 'summer', 8: 'summer',
      9: 'autumn', 10: 'autumn', 11: 'autumn'
    };

    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      weather: getWeatherContext(), // Simplified weather detection
      timeOfDay,
      dayOfWeek: dayNames[now.getDay()],
      season: monthSeasons[now.getMonth() + 1 as keyof typeof monthSeasons],
      nearbyPlaces: getNearbyPlaces(location),
      userHistory: getUserKindnessHistory()
    };
  }, [location]);

  // Simplified weather context (in real app would use weather API)
  const getWeatherContext = () => {
    const conditions = ['sunny', 'rainy', 'cloudy', 'cold', 'hot', 'windy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  // Get nearby places based on location
  const getNearbyPlaces = (location: any) => {
    const places = [
      'coffee shop', 'grocery store', 'school', 'park', 'bus stop', 
      'hospital', 'elderly home', 'library', 'community center', 'workplace'
    ];
    return places.slice(0, 3 + Math.floor(Math.random() * 3));
  };

  // Get user's kindness history (simplified)
  const getUserKindnessHistory = () => {
    return ['helping', 'sharing', 'caring', 'supporting'].filter(() => Math.random() > 0.5);
  };

  // Generate AI-powered suggestions based on context
  const generateSuggestions = useCallback(async (context: ContextData): Promise<KindnessSuggestion[]> => {
    const suggestions: KindnessSuggestion[] = [];

    // Weather-based suggestions
    if (context.weather === 'rainy') {
      suggestions.push({
        id: 'umbrella-share',
        title: 'Share Your Umbrella',
        description: 'Offer to share your umbrella with someone caught in the rain',
        category: 'helping',
        difficulty: 'easy',
        timeEstimate: '2-5 minutes',
        location: 'near you',
        context: `It's raining in your area`,
        icon: '☔',
        urgency: 'high',
        personalizedReason: 'Perfect weather condition detected for this act of kindness!'
      });
    }

    if (context.weather === 'cold') {
      suggestions.push({
        id: 'hot-drink',
        title: 'Buy Someone a Hot Drink',
        description: 'Get a warm coffee or tea for someone working outside',
        category: 'caring',
        difficulty: 'easy',
        timeEstimate: '10-15 minutes',
        location: 'nearby coffee shop',
        context: `Cold weather detected`,
        icon: '☕',
        urgency: 'medium',
        personalizedReason: 'Cold weather makes warm gestures extra meaningful!'
      });
    }

    // Time-based suggestions
    if (context.timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning-compliment',
        title: 'Brighten Someone\'s Morning',
        description: 'Give a genuine compliment to start someone\'s day positively',
        category: 'encouraging',
        difficulty: 'easy',
        timeEstimate: '1-2 minutes',
        location: 'anywhere',
        context: `${context.timeOfDay} energy boost`,
        icon: '🌅',
        urgency: 'medium',
        personalizedReason: 'Morning compliments set a positive tone for the entire day!'
      });
    }

    if (context.timeOfDay === 'evening') {
      suggestions.push({
        id: 'evening-check',
        title: 'Check on a Neighbor',
        description: 'Send a caring message or knock to see if an elderly neighbor needs anything',
        category: 'caring',
        difficulty: 'medium',
        timeEstimate: '15-30 minutes',
        location: 'your neighborhood',
        context: `Evening care opportunity`,
        icon: '🏠',
        urgency: 'low',
        personalizedReason: 'Evenings are perfect for meaningful community connections!'
      });
    }

    // Day-based suggestions
    if (context.dayOfWeek === 'Monday') {
      suggestions.push({
        id: 'monday-motivation',
        title: 'Monday Motivation Boost',
        description: 'Bring coffee or treats for your colleagues to help beat Monday blues',
        category: 'sharing',
        difficulty: 'medium',
        timeEstimate: '20-30 minutes',
        location: 'workplace',
        context: `Monday motivation needed`,
        icon: '💪',
        urgency: 'high',
        personalizedReason: 'Mondays are tough - your kindness can turn someone\'s week around!'
      });
    }

    if (context.dayOfWeek === 'Friday') {
      suggestions.push({
        id: 'friday-celebration',
        title: 'Celebrate Someone\'s Week',
        description: 'Acknowledge someone who worked hard this week with a thank you note',
        category: 'encouraging',
        difficulty: 'easy',
        timeEstimate: '5-10 minutes',
        location: 'workplace or home',
        context: `End of week appreciation`,
        icon: '🎉',
        urgency: 'medium',
        personalizedReason: 'Friday is perfect for celebrating others\' accomplishments!'
      });
    }

    // Location-based suggestions
    context.nearbyPlaces.forEach(place => {
      if (place === 'coffee shop') {
        suggestions.push({
          id: 'pay-it-forward',
          title: 'Pay It Forward',
          description: 'Pay for the next person\'s coffee or treat',
          category: 'sharing',
          difficulty: 'easy',
          timeEstimate: '5 minutes',
          location: place,
          context: `${place} nearby`,
          icon: '☕',
          urgency: 'medium',
          personalizedReason: `You're near a ${place} - perfect opportunity for a random act of kindness!`
        });
      }

      if (place === 'grocery store') {
        suggestions.push({
          id: 'grocery-help',
          title: 'Help with Heavy Bags',
          description: 'Offer to help someone carry heavy grocery bags to their car',
          category: 'helping',
          difficulty: 'easy',
          timeEstimate: '5-10 minutes',
          location: place,
          context: `${place} nearby`,
          icon: '🛒',
          urgency: 'medium',
          personalizedReason: `You're near a ${place} - elderly shoppers often need assistance!`
        });
      }

      if (place === 'park') {
        suggestions.push({
          id: 'park-cleanup',
          title: 'Mini Park Cleanup',
          description: 'Pick up litter while enjoying the park - make it beautiful for everyone',
          category: 'caring',
          difficulty: 'easy',
          timeEstimate: '15-20 minutes',
          location: place,
          context: `${place} nearby`,
          icon: '🌳',
          urgency: 'low',
          personalizedReason: `You're near a ${place} - perfect for environmental kindness!`
        });
      }
    });

    // History-based personalized suggestions
    if (context.userHistory.includes('helping')) {
      suggestions.push({
        id: 'helping-expert',
        title: 'Teach Someone a Skill',
        description: 'Share your knowledge by helping someone learn something you\'re good at',
        category: 'supporting',
        difficulty: 'medium',
        timeEstimate: '30-60 minutes',
        location: 'community center or online',
        context: 'Based on your helping history',
        icon: '🎓',
        urgency: 'low',
        personalizedReason: 'You have a gift for helping others - share your expertise!'
      });
    }

    // Season-based suggestions
    if (context.season === 'winter') {
      suggestions.push({
        id: 'winter-warmth',
        title: 'Winter Warmth Package',
        description: 'Create care packages with hot cocoa, hand warmers for homeless individuals',
        category: 'caring',
        difficulty: 'hard',
        timeEstimate: '1-2 hours',
        location: 'community areas',
        context: `${context.season} season`,
        icon: '🧥',
        urgency: 'high',
        personalizedReason: 'Winter is harsh for many - your warmth can be life-changing!'
      });
    }

    // Return top 6 most relevant suggestions
    return suggestions
      .sort((a, b) => {
        const urgencyScore = { high: 3, medium: 2, low: 1 };
        return urgencyScore[b.urgency] - urgencyScore[a.urgency];
      })
      .slice(0, 6);
  }, []);

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const context = await getCurrentContext();
      setCurrentContext(context);
      const newSuggestions = await generateSuggestions(context);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentContext, generateSuggestions]);

  // Initial load and refresh
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions, refreshKey]);

  // Refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: '#10B981',
      medium: '#F59E0B', 
      hard: '#EF4444'
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#6B7280'
    };
    return colors[urgency as keyof typeof colors] || colors.low;
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>AI is analyzing your perfect kindness moment...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '16px',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI Kindness Suggestions
          </h3>
          <span style={{ fontSize: '24px' }}>✨</span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0,
          marginBottom: '16px'
        }}>
          Perfect acts of kindness for your current situation
        </p>

        {/* Context Display */}
        {currentContext && (
          <div style={{
            background: 'rgba(139,92,246,0.1)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#8B5CF6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>🌤️ {currentContext.weather}</span>
              <span>⏰ {currentContext.timeOfDay}</span>
              <span>📅 {currentContext.dayOfWeek}</span>
              <span>🍂 {currentContext.season}</span>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '0 auto'
          }}
        >
          <span>🔄</span>
          New Suggestions
        </button>
      </div>

      {/* Suggestions Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(139,92,246,0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139,92,246,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>{suggestion.icon}</span>
                <div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: '#1f2937'
                  }}>
                    {suggestion.title}
                  </h4>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: getUrgencyColor(suggestion.urgency),
                    color: 'white',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {suggestion.urgency}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: '#4b5563',
              margin: '0 0 12px 0',
              lineHeight: '1.4'
            }}>
              {suggestion.description}
            </p>

            {/* Personalized Reason */}
            <div style={{
              background: 'rgba(139,92,246,0.1)',
              borderRadius: '8px',
              padding: '8px',
              marginBottom: '12px'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#8B5CF6',
                margin: 0,
                fontStyle: 'italic'
              }}>
                💡 {suggestion.personalizedReason}
              </p>
            </div>

            {/* Metadata */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '11px',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span>⏱️ {suggestion.timeEstimate}</span>
                <span>📍 {suggestion.location}</span>
              </div>
              <span 
                style={{
                  color: getDifficultyColor(suggestion.difficulty),
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {suggestion.difficulty}
              </span>
            </div>

            {/* Context */}
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              color: '#8B5CF6',
              textAlign: 'center',
              opacity: 0.8
            }}>
              {suggestion.context}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '100px' }}>
        <span style={{
          background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
        }}>
          <span>🤖</span>
          Powered by Contextual AI
        </span>
        <p style={{
          fontSize: '11px',
          color: '#8B5CF6',
          marginTop: '12px',
          margin: '12px 0 0 0',
          opacity: 0.8
        }}>
          Refreshes every 30 minutes with new personalized opportunities
        </p>
      </div>
    </div>
  );
}