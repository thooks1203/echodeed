import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

const PULSE_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Not at all', color: '#ef4444' },
  { score: 2, emoji: '😔', label: 'A little', color: '#f97316' },
  { score: 3, emoji: '😐', label: 'Somewhat', color: '#eab308' },
  { score: 4, emoji: '🙂', label: 'Mostly', color: '#22c55e' },
  { score: 5, emoji: '😊', label: 'Very supported', color: '#10b981' },
];

export function PulseCheckModal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: todayCheck } = useQuery<{ hasCheckedToday: boolean }>({
    queryKey: ['/api/pulse-check/today'],
    enabled: !!user,
  });

  useEffect(() => {
    if (user && todayCheck && !todayCheck.hasCheckedToday) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, todayCheck]);

  const submitMutation = useMutation({
    mutationFn: async (score: number) => {
      const response = await apiRequest('POST', '/api/pulse-check', {
        supportScore: score,
        isAnonymous: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/pulse-check/today'] });
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setSelectedScore(null);
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (selectedScore !== null) {
      submitMutation.mutate(selectedScore);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {submitted ? '💜 Thank You!' : '💜 Daily Pulse Check'}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-gray-600 dark:text-gray-300">
              Your voice matters. We're here for you.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              How supported do you feel in your school community today?
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {PULSE_EMOJIS.map((item) => (
                <button
                  key={item.score}
                  onClick={() => setSelectedScore(item.score)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                    selectedScore === item.score
                      ? 'scale-110 ring-2 ring-offset-2'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedScore === item.score ? `${item.color}20` : 'transparent',
                    borderColor: selectedScore === item.score ? item.color : 'transparent',
                  }}
                  data-testid={`pulse-score-${item.score}`}
                >
                  <span className="text-3xl mb-1">{item.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
                data-testid="button-skip-pulse"
              >
                Skip for now
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={handleSubmit}
                disabled={selectedScore === null || submitMutation.isPending}
                data-testid="button-submit-pulse"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              Your response is anonymous and helps us support you better.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
