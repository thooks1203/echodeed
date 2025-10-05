import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';

interface ServiceOpportunity {
  id: string;
  organizationName: string;
  category: string;
  description: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  hoursOffered: number;
  ageRestriction: string;
  scheduleDetails: string;
  website: string;
  isActive: boolean;
  spotsAvailable: number;
  spotsTotal: number;
}

interface KindnessConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KindnessConnectModal({ isOpen, onClose }: KindnessConnectModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<ServiceOpportunity | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock scroll on body and html
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent scroll events
      const preventScroll = (e: WheelEvent | TouchEvent) => {
        if (!(e.target as HTMLElement).closest('[data-radix-scroll-area-viewport]')) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      // Focus the scroll area so arrow keys work within it
      setTimeout(() => {
        scrollAreaRef.current?.focus();
      }, 100);
      
      return () => {
        // Restore scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, scrollY);
        
        // Remove event listeners
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isOpen]);

  // Fetch all service opportunities
  const { data: opportunities, isLoading } = useQuery<ServiceOpportunity[]>({
    queryKey: ['/api/service-opportunities'],
    enabled: isOpen,
  });

  // Fetch user's signups
  const { data: mySignups } = useQuery<any[]>({
    queryKey: ['/api/service-opportunities/my-signups'],
    enabled: isOpen && !!user,
  });

  // Sign up mutation
  const signupMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await apiRequest('POST', '/api/service-opportunities/signup', {
        opportunityId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '🎉 Signed Up Successfully!',
        description: 'The organization will contact you with next steps.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-opportunities/my-signups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-opportunities'] });
      setSelectedOpportunity(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up for opportunity.',
        variant: 'destructive',
      });
    },
  });

  // Cancel signup mutation
  const cancelMutation = useMutation({
    mutationFn: async (signupId: string) => {
      const response = await apiRequest('DELETE', `/api/service-opportunities/signup/${signupId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Signup Cancelled',
        description: 'You have been removed from this opportunity.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-opportunities/my-signups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-opportunities'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel signup.',
        variant: 'destructive',
      });
    },
  });

  // Filter opportunities by category
  const categories = ['all', 'environment', 'animals', 'community', 'education', 'health'];
  const filteredOpportunities = opportunities?.filter(opp => 
    selectedCategory === 'all' || opp.category === selectedCategory
  ) || [];

  // Check if user is already signed up
  const isSignedUp = (opportunityId: string) => {
    return mySignups?.some(signup => signup.opportunityId === opportunityId && signup.status !== 'cancelled');
  };

  const getSignupId = (opportunityId: string) => {
    return mySignups?.find(signup => signup.opportunityId === opportunityId && signup.status !== 'cancelled')?.id;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environment': return '🌱';
      case 'animals': return '🐾';
      case 'community': return '🤝';
      case 'education': return '📚';
      case 'health': return '❤️';
      default: return '✨';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment': return '#10B981';
      case 'animals': return '#F59E0B';
      case 'community': return '#06B6D4';
      case 'education': return '#8B5CF6';
      case 'health': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] p-0"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Heart className="w-7 h-7 text-rose-500" />
            <span>Kindness Connect</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Discover real volunteer opportunities in Guilford County
          </p>
        </DialogHeader>

        {/* Category Filters */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category}`}
                className="capitalize"
              >
                {getCategoryIcon(category)} {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Opportunities List */}
        <ScrollArea 
          className="h-[400px] px-6"
          ref={scrollAreaRef}
          tabIndex={0}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">Loading opportunities...</div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No opportunities found in this category
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {filteredOpportunities.map(opportunity => {
                const signedUp = isSignedUp(opportunity.id);
                const signupId = getSignupId(opportunity.id);

                return (
                  <div
                    key={opportunity.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`opportunity-${opportunity.id}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {opportunity.organizationName}
                        </h3>
                        <Badge 
                          style={{ 
                            backgroundColor: getCategoryColor(opportunity.category),
                            color: 'white'
                          }}
                          className="capitalize"
                        >
                          {getCategoryIcon(opportunity.category)} {opportunity.category}
                        </Badge>
                      </div>
                      {signedUp && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Signed Up
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {opportunity.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{opportunity.hoursOffered}+ hours available</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>Ages: {opportunity.ageRestriction}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{opportunity.scheduleDetails}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {/* Only students can sign up - others can view only */}
                      {user?.schoolRole === 'student' ? (
                        <>
                          {signedUp ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => signupId && cancelMutation.mutate(signupId)}
                              disabled={cancelMutation.isPending}
                              data-testid={`button-cancel-${opportunity.id}`}
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel Signup
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => signupMutation.mutate(opportunity.id)}
                              disabled={signupMutation.isPending || opportunity.spotsAvailable === 0}
                              data-testid={`button-signup-${opportunity.id}`}
                              className="flex-1"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {opportunity.spotsAvailable === 0 ? 'Full' : 'Sign Up'}
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 text-xs text-muted-foreground text-center">
                          👁️ View Only - Students can sign up
                        </div>
                      )}
                      {opportunity.website && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(opportunity.website, '_blank')}
                          data-testid={`button-website-${opportunity.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-muted/50 border-t">
          <p className="text-xs text-muted-foreground text-center">
            📍 All opportunities are within 15 miles of Eastern Guilford High School
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
