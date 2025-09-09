import { Heart, MapPin, Loader2, HandHeart, Users, Smile, Coffee, TreePine, Zap, TrendingUp, Star } from 'lucide-react';
import { KindnessPost } from '@shared/schema';
import { formatDistance } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface KindnessFeedProps {
  posts: KindnessPost[];
  isLoading: boolean;
}

export function KindnessFeed({ posts, isLoading }: KindnessFeedProps) {
  const queryClient = useQueryClient();
  const [clickedPosts, setClickedPosts] = useState<Set<string>>(new Set());

  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to heart post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const echoMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/echo`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to echo post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const handleHeart = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedPosts(prev => new Set(prev).add(postId));
    heartMutation.mutate(postId);
    setTimeout(() => {
      setClickedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }, 1000);
  };

  const handleEcho = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedPosts(prev => new Set(prev).add(postId));
    echoMutation.mutate(postId);
    setTimeout(() => {
      setClickedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }, 1000);
  };
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Helping Others':
        return HandHeart;
      case 'Spreading Positivity':
        return Smile;
      case 'Community Action':
        return Users;
      case 'Environmental':
        return TreePine;
      case 'Random Acts':
        return Coffee;
      default:
        return Zap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Helping Others':
        return 'from-emerald-400 to-teal-500';
      case 'Spreading Positivity':
        return 'from-yellow-400 to-orange-500';
      case 'Community Action':
        return 'from-blue-400 to-indigo-500';
      case 'Environmental':
        return 'from-green-400 to-emerald-500';
      case 'Random Acts':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-primary to-accent';
    }
  };

  const getImpactLevel = (post: KindnessPost) => {
    const engagement = (post.heartsCount || 0) + ((post.echoesCount || 0) * 2);
    const impact = post.impactScore || 0;
    const combined = engagement + (impact * 0.5);
    
    if (combined > 20) return 'high';
    if (combined > 10) return 'medium';
    return 'low';
  };

  if (isLoading) {
    return (
      <main className="pb-20 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading acts of kindness...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 bg-background">
      {posts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-72 h-72 mx-auto mb-4" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-grad-feed' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-grad-feed)'/%3E%3C/svg%3E")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
          <h3 className="text-lg font-medium text-foreground mb-2">No acts of kindness found</h3>
          <p className="text-muted-foreground">Be the first to share a kind deed in this area!</p>
        </div>
      ) : (
        posts.map((post, index) => {
          const IconComponent = getCategoryIcon(post.category);
          const impactLevel = getImpactLevel(post);
          const isHighImpact = impactLevel === 'high';
          const isTrending = (post.heartsCount || 0) > 5;
          
          return (
            <div 
              key={post.id} 
              className={`px-4 py-4 border-b border-border relative transition-all duration-300 hover:shadow-md hover:bg-primary/5 hover:scale-[1.01] cursor-pointer group ${
                isHighImpact ? 'bg-gradient-to-r from-background to-primary/5 shadow-sm' : 'bg-card'
              }`}
              style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Trending indicator */}
              {isTrending && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-orange-500">
                  <TrendingUp size={10} />
                  <span className="font-medium">Trending</span>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                {/* Dynamic category icon with gradient */}
                <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(post.category)} rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md`}>
                  <IconComponent size={18} className="text-white transition-transform duration-200 group-hover:rotate-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-foreground leading-relaxed text-[15px]" data-testid={`text-post-content-${index}`}>
                    {post.content}
                  </p>
                  
                  {/* Engagement indicators */}
                  <div className="flex items-center gap-6 mt-3 mb-2">
                    <button
                      onClick={(e) => handleHeart(post.id, e)}
                      className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-110 active:scale-95 ${
                        clickedPosts.has(post.id) ? 'animate-pulse' : ''
                      } ${(post.heartsCount || 0) > 0 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      data-testid={`button-heart-${post.id}`}
                    >
                      <Heart 
                        size={20} 
                        fill={(post.heartsCount || 0) > 0 ? "currentColor" : "none"}
                        className="transition-all duration-200 hover:drop-shadow-sm"
                      />
                      <span className="text-sm font-medium">{post.heartsCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleEcho(post.id, e)}
                      className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-110 active:scale-95 ${
                        clickedPosts.has(post.id) ? 'animate-pulse' : ''
                      } ${(post.echoesCount || 0) > 0 ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                      data-testid={`button-echo-${post.id}`}
                    >
                      <Zap 
                        size={20}
                        fill={(post.echoesCount || 0) > 0 ? "currentColor" : "none"}
                        className="transition-all duration-200 hover:drop-shadow-sm"
                      />
                      <span className="text-sm font-medium">{post.echoesCount || 0}</span>
                    </button>
                    
                    {(post.impactScore || 0) > 75 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-xs font-medium">High Impact</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <MapPin size={10} className="mr-1" />
                    <span data-testid={`text-post-location-${index}`}>{post.location}</span>
                    <span className="mx-2">•</span>
                    <span data-testid={`text-post-time-${index}`}>
                      {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                    </span>
                    <span className="mx-2">•</span>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white shadow-sm`}
                      data-testid={`text-post-category-${index}`}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {posts.length > 0 && (
        <div className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Loading more acts of kindness...</p>
        </div>
      )}
    </main>
  );
}
