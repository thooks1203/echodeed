import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Flame, Sparkles } from 'lucide-react';

interface DailyLog {
  id: string;
  userId: string;
  date: string;
  moodScore: number;
  positiveInteraction: boolean;
  tomorrowGoal: string | null;
}

const MOOD_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Struggling', color: '#EF4444' },
  { score: 2, emoji: '😔', label: 'Down', color: '#F97316' },
  { score: 3, emoji: '😐', label: 'Okay', color: '#EAB308' },
  { score: 4, emoji: '🙂', label: 'Good', color: '#22C55E' },
  { score: 5, emoji: '😊', label: 'Great', color: '#10B981' },
];

interface DailyCheckInProps {
  userName?: string;
  currentStreak?: number;
  isMiddleSchool?: boolean;
}

export function DailyCheckIn({ userName, currentStreak = 0, isMiddleSchool = false }: DailyCheckInProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [positiveInteraction, setPositiveInteraction] = useState(false);
  const [tomorrowGoal, setTomorrowGoal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: todayLog, isLoading } = useQuery<DailyLog | null>({
    queryKey: ['/api/daily-logs/today'],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { moodScore: number; positiveInteraction: boolean; tomorrowGoal: string }) => {
      return apiRequest('POST', '/api/daily-logs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-logs/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-logs/streak'] });
      toast({
        title: 'Check-in complete!',
        description: 'Great job reflecting on your day! Keep up the streak!',
      });
      setIsExpanded(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save your check-in. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (selectedMood === null) {
      toast({
        title: 'Select your mood',
        description: 'Please select how you\'re feeling today.',
        variant: 'destructive',
      });
      return;
    }
    submitMutation.mutate({
      moodScore: selectedMood,
      positiveInteraction,
      tomorrowGoal,
    });
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white',
        textAlign: 'center',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (todayLog) {
    const moodInfo = MOOD_EMOJIS.find(m => m.score === todayLog.moodScore);
    return (
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={28} style={{ color: '#FDE68A' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                Today's Check-In Complete!
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                You logged: {moodInfo?.emoji} {moodInfo?.label}
              </p>
            </div>
          </div>
          {currentStreak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '8px 14px',
            }}>
              <Flame size={20} style={{ color: '#FDE68A' }} />
              <span style={{ fontWeight: '700', fontSize: '16px' }}>{currentStreak}</span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>day streak</span>
            </div>
          )}
        </div>
        {todayLog.tomorrowGoal && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <p style={{ margin: 0, fontSize: '13px' }}>
              <strong>Tomorrow's goal:</strong> {todayLog.tomorrowGoal}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: isMiddleSchool 
        ? 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)'
        : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      color: 'white',
      boxShadow: isMiddleSchool 
        ? '0 4px 20px rgba(236, 72, 153, 0.3)'
        : '0 4px 20px rgba(139, 92, 246, 0.3)',
    }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={28} style={{ color: '#FDE68A' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
              {isMiddleSchool ? '🌈 Daily Check-In' : 'Daily Mood Check-In'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {userName ? `Hey ${userName.split(' ')[0]}! ` : ''}How are you feeling today?
            </p>
          </div>
        </div>
        {currentStreak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 14px',
          }}>
            <Flame size={20} style={{ color: '#FDE68A' }} />
            <span style={{ fontWeight: '700' }}>{currentStreak}</span>
          </div>
        )}
      </div>

      {!isExpanded ? (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood.score}
                onClick={() => {
                  setSelectedMood(mood.score);
                  setIsExpanded(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '28px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'scale(1.15)';
                  (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                  (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                style={{
                  background: selectedMood === mood.score 
                    ? 'rgba(255, 255, 255, 0.4)' 
                    : 'rgba(255, 255, 255, 0.15)',
                  border: selectedMood === mood.score 
                    ? '3px solid white' 
                    : '3px solid transparent',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {mood.emoji}
              </button>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '12px',
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              fontSize: '14px',
            }}>
              <input
                type="checkbox"
                checked={positiveInteraction}
                onChange={(e) => setPositiveInteraction(e.target.checked)}
                style={{ 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#10B981',
                }}
              />
              <span>I had a positive interaction with someone today! 💜</span>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '600',
            }}>
              What's one goal for tomorrow? (optional)
            </label>
            <Textarea
              value={tomorrowGoal}
              onChange={(e) => setTomorrowGoal(e.target.value)}
              placeholder={isMiddleSchool 
                ? "I want to help a friend with their homework..." 
                : "I want to volunteer at the food bank..."}
              maxLength={200}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#1f2937',
                resize: 'none',
                height: '60px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="outline"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || selectedMood === null}
              style={{
                flex: 2,
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                border: 'none',
                color: 'white',
                fontWeight: '700',
              }}
            >
              {submitMutation.isPending ? 'Saving...' : 'Complete Check-In ✓'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
