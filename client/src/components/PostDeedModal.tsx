import { useState, useMemo } from 'react';
import { X, Heart, MapPin, HandHeart, Users, Smile, Lightbulb, Sparkles, BookOpen, TreePine, Smartphone, Crown, UserPlus } from 'lucide-react';
// import electricLogoUrl from '../assets/echodeed_electric_logo.png';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { pushNotifications } from '../services/pushNotifications';
import { useToast } from '@/hooks/use-toast';
import { LocationData } from '@/lib/types';

interface PostDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
  onPostSuccess?: () => void;
}

interface PostData {
  content: string;
  category: string;
  location: string;
  city: string;
  state: string;
  country: string;
}

export function PostDeedModal({ isOpen, onClose, location, onPostSuccess }: PostDeedModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Helping Others');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Intelligent kindness suggestions for grades 6-12
  const kindnessSuggestions = useMemo(() => {
    const suggestions = {
      'Helping Others': [
        "I helped a classmate understand their homework in math class",
        "I carried groceries for an elderly neighbor after school", 
        "I tutored a younger student who was struggling in science",
        "I offered my seat to someone on the bus who looked tired",
        "I helped my teacher organize classroom materials during lunch",
        "I walked a friend's dog when they were sick",
        "I helped my sibling with their project even though I was busy",
        "I volunteered to help clean up after the school assembly"
      ],
      'Academic Support': [
        "I created a study group for students struggling with chemistry",
        "I tutored middle schoolers in reading during my free period",
        "I shared my organized notes with classmates before the big test",
        "I helped a new student navigate the school's online learning portal",
        "I volunteered as a peer mentor for incoming freshmen",
        "I stayed after school to help classmates with college applications",
        "I created flashcards and shared them with my entire class",
        "I partnered with a struggling student for our group project"
      ],
      'Environmental Action': [
        "I started a school-wide campaign to reduce plastic waste",
        "I organized a creek cleanup with my environmental club",
        "I created a community garden at our school",
        "I convinced our cafeteria to start composting food scraps",
        "I led a team to plant trees in our neighborhood",
        "I organized a clothing swap to reduce textile waste",
        "I started a bike-to-school initiative to reduce emissions",
        "I created educational posters about sustainable living"
      ],
      'Digital Kindness': [
        "I stood up for someone being bullied online and reported it",
        "I shared positive comments on my classmates' social media posts",
        "I created a supportive group chat for students feeling anxious",
        "I used technology to help elderly neighbors video call family",
        "I shared helpful study resources in our class Discord server",
        "I started an online kindness challenge that went viral at school",
        "I helped a teacher learn new technology for virtual teaching",
        "I created an app to help students find study partners"
      ],
      'Leadership & Mentoring': [
        "I organized a school spirit week to bring everyone together",
        "I started a peer mediation program to resolve conflicts",
        "I led a team of volunteers for our school's food drive",
        "I mentored a younger student who was having trouble making friends",
        "I created and ran a workshop on study skills for freshmen",
        "I organized a talent show to showcase our school's diversity",
        "I led my debate team to help shy students find their voice",
        "I coordinated with teachers to start an anti-bullying campaign"
      ],
      'Inclusion & Belonging': [
        "I invited a lonely student to join our lunch table",
        "I learned sign language to communicate with a deaf classmate",
        "I organized a cultural celebration to honor our school's diversity",
        "I made sure the new exchange student felt welcome in our class",
        "I stood up for a student being excluded from group activities",
        "I started a club for students who felt like they didn't fit in anywhere",
        "I helped translate for a non-English speaking parent at school events",
        "I created a buddy system for students with special needs"
      ],
      'Community Action': [
        "I organized a book drive for the local elementary school",
        "I started a recycling initiative in our school cafeteria",
        "I created posters to promote kindness week at school",
        "I volunteered at the community food bank on Saturday",
        "I picked up litter around our school parking lot",
        "I helped plant flowers in the community garden",
        "I organized a coat drive for families in need",
        "I started a peer mentoring group for new students"
      ],
      'Spreading Positivity': [
        "I complimented a classmate on their presentation today",
        "I wrote encouraging notes and left them in random lockers",
        "I smiled and said good morning to everyone I passed in the hallway",
        "I cheered up a friend who was having a rough day",
        "I congratulated someone on their achievement in sports",
        "I thanked our custodian for keeping our school clean",
        "I sent a positive message to someone who seemed lonely",
        "I celebrated a teammate's improvement even though they're still learning"
      ]
    };
    return suggestions[category as keyof typeof suggestions] || suggestions['Helping Others'];
  }, [category]);

  const handleSuggestionClick = (suggestion: string) => {
    setContent(suggestion);
    setShowSuggestions(false);
  };

  const postMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Thank you for sharing!',
        description: 'Your act of kindness has been added to the feed.',
      });
      
      // Send motivational notification for milestone posts
      const postCount = Math.floor(Math.random() * 20) + 1; // Simulated post count
      if (postCount === 5 || postCount === 10 || postCount === 25) {
        pushNotifications.sendNotification({
          title: `🎉 ${postCount} Acts of Kindness!`,
          body: 'You\'re making a real difference! Keep spreading positivity.',
          tag: 'milestone',
          data: { type: 'achievement', url: '/feed' }
        });
      }
      
      // Occasionally send feed update notifications (5% chance)
      if (Math.random() < 0.05) {
        pushNotifications.sendFeedUpdateNotification({
          type: 'trending',
          message: 'Your kindness post is inspiring others! Check the feed to see the ripple effect.',
          count: Math.floor(Math.random() * 10) + 3
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
      setContent('');
      setCategory('Helping Others');
      
      // Trigger the sparks animation!
      onPostSuccess?.();
      
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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl transform transition-transform max-h-[90vh] overflow-y-auto my-auto">
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
              onChange={(e) => {
                setContent(e.target.value);
                setShowSuggestions(e.target.value.length === 0);
              }}
              onFocus={() => setShowSuggestions(content.length === 0)}
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

            {/* Kindness Suggestions */}
            {showSuggestions && content.length === 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-blue-600 dark:text-blue-400" size={16} />
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Need inspiration? Try these kindness ideas:
                  </h4>
                  <Sparkles className="text-purple-500" size={14} />
                </div>
                <div className="grid gap-2 max-h-32 overflow-y-auto">
                  {kindnessSuggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-2 text-sm bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-gray-700 dark:text-gray-300"
                      data-testid={`suggestion-${index}`}
                    >
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                  💡 Click any idea to use it, or write your own unique act of kindness!
                </p>
              </div>
            )}
            
            {/* Category Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Helping Others', icon: HandHeart, label: 'Helping Others' },
                  { value: 'Academic Support', icon: BookOpen, label: 'Academic Support' },
                  { value: 'Environmental Action', icon: TreePine, label: 'Environmental Action' },
                  { value: 'Digital Kindness', icon: Smartphone, label: 'Digital Kindness' },
                  { value: 'Leadership & Mentoring', icon: Crown, label: 'Leadership & Mentoring' },
                  { value: 'Inclusion & Belonging', icon: UserPlus, label: 'Inclusion & Belonging' },
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
              <span className="inline mr-2 w-4 h-4 flex items-center justify-center text-sm" key="electric-modal">⚡</span>
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
