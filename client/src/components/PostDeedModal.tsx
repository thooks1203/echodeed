import { useState } from 'react';
import { X, Heart, MapPin, HandHeart, Users, Smile } from 'lucide-react';
import electricLogoUrl from '@assets/echodeed_electric_logo.png';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LocationData } from '@/lib/types';

interface PostDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
}

interface PostData {
  content: string;
  category: string;
  location: string;
  city: string;
  state: string;
  country: string;
}

export function PostDeedModal({ isOpen, onClose, location }: PostDeedModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Helping Others');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Thank you for sharing!',
        description: 'Your act of kindness has been added to the feed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
      setContent('');
      setCategory('Helping Others');
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post your deed. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please describe your act of kindness.',
        variant: 'destructive',
      });
      return;
    }

    const postData: PostData = {
      content: content.trim(),
      category,
      location: location?.fullLocation || 'Unknown Location',
      city: location?.city || 'Unknown',
      state: location?.state || 'Unknown',
      country: location?.country || 'Unknown',
    };

    postMutation.mutate(postData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg mx-4 mb-4 rounded-t-2xl shadow-2xl transform transition-transform">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Share Your Deed</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-testid="button-close-modal"
          >
            <X className="text-muted-foreground" size={16} />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What kind act did you do today? Be specific and inspiring..."
              className="w-full p-4 border border-input rounded-lg resize-none bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              maxLength={280}
              data-testid="input-deed-content"
            />
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <span>Characters: <span data-testid="text-char-count">{content.length}</span>/280</span>
              <div className="flex items-center space-x-2">
                <MapPin size={12} />
                <span data-testid="text-current-location">{location?.fullLocation || 'Location not available'}</span>
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'Helping Others', icon: HandHeart, label: 'Helping Others' },
                  { value: 'Community Action', icon: Users, label: 'Community Action' },
                  { value: 'Spreading Positivity', icon: Smile, label: 'Spreading Positivity' },
                ].map(({ value, icon: Icon, label }) => (
                  <label key={value} className="flex items-center">
                    <input 
                      type="radio" 
                      name="category" 
                      value={value}
                      checked={category === value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only" 
                      data-testid={`radio-category-${value.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <span className={`category-option ${category === value ? 'active' : ''}`}>
                      <Icon size={14} className="mr-1" />
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={postMutation.isPending}
              className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              data-testid="button-submit-deed"
            >
              <img src={electricLogoUrl} alt="EchoDeed" className="inline mr-2 w-4 h-4 object-contain" />
              {postMutation.isPending ? 'Sharing...' : 'Share Your Deed'}
            </button>
            
            <p className="mt-3 text-xs text-center text-muted-foreground leading-relaxed">
              Your post will be completely anonymous. <br />
              <strong>Your Kindness, Amplified.</strong>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
