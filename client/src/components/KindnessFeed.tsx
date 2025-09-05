import { Heart, MapPin, Loader2 } from 'lucide-react';
import { KindnessPost } from '@shared/schema';
import { formatDistance } from 'date-fns';

interface KindnessFeedProps {
  posts: KindnessPost[];
  isLoading: boolean;
}

export function KindnessFeed({ posts, isLoading }: KindnessFeedProps) {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Helping Others':
        return 'text-primary';
      case 'Spreading Positivity':
        return 'text-accent';
      case 'Community Action':
        return 'text-primary';
      default:
        return 'text-primary';
    }
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
    <main className="pb-20">
      {posts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">No acts of kindness found</h3>
          <p className="text-muted-foreground">Be the first to share a kind deed in this area!</p>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={post.id} className="px-4 py-3 border-b border-border bg-card">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Heart className={`${getCategoryStyle(post.category)}`} size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-relaxed" data-testid={`text-post-content-${index}`}>
                  {post.content}
                </p>
                <div className="flex items-center mt-3 text-xs text-muted-foreground">
                  <MapPin size={10} className="mr-1" />
                  <span data-testid={`text-post-location-${index}`}>{post.location}</span>
                  <span className="mx-2">•</span>
                  <span data-testid={`text-post-time-${index}`}>
                    {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                  </span>
                  <span className="mx-2">•</span>
                  <span 
                    className="px-2 py-1 bg-muted rounded-full text-xs"
                    data-testid={`text-post-category-${index}`}
                  >
                    {post.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
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
