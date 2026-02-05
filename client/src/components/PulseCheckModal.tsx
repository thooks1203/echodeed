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

const SESSION_KEY = 'pulse_check_shown_this_session';

export function PulseCheckModal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [hasAutoShown, setHasAutoShown] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const { data: todayCheck } = useQuery<{ hasCheckedToday: boolean }>({
    queryKey: ['/api/pulse-check/today'],
    enabled: !!user,
  });

  useEffect(() => {
    if (hasBeenDismissed || hasAutoShown) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const pulseCheckTrigger = urlParams.get('pulseCheck');
    
    if (pulseCheckTrigger === 'true' && user && todayCheck && !todayCheck.hasCheckedToday) {
      setIsOpen(true);
      setHasAutoShown(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    
    if (user && todayCheck && !todayCheck.hasCheckedToday) {
      const timer = setTimeout(() => {
        if (!hasBeenDismissed && !hasAutoShown) {
          setIsOpen(true);
          setHasAutoShown(true);
          sessionStorage.setItem(SESSION_KEY, 'true');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, todayCheck, hasBeenDismissed, hasAutoShown]);

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

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setSelectedScore(null);
    setHasBeenDismissed(true);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  if (!user) return null;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-md mx-4" onPointerDownOutside={(e) => e.preventDefault()}>
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

            <div className="grid grid-cols-5 gap-1 mb-6 px-2">
              {PULSE_EMOJIS.map((item) => (
                <button
                  key={item.score}
                  onClick={() => setSelectedScore(item.score)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                    selectedScore === item.score
                      ? 'scale-105 ring-2 ring-offset-1'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedScore === item.score ? `${item.color}20` : 'transparent',
                    borderColor: selectedScore === item.score ? item.color : 'transparent',
                  }}
                  data-testid={`pulse-score-${item.score}`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                className="text-sm h-9 px-6 min-w-[120px]"
                onClick={handleClose}
                data-testid="button-skip-pulse"
              >
                Skip for now
              </Button>
              <Button
                className="text-sm h-9 px-6 min-w-[120px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
