import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, GraduationCap, Sparkles, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherKudosFeedProps {
  teacherId: string;
}

export function TeacherKudosFeed({ teacherId }: TeacherKudosFeedProps) {
  // Fetch kudos posts for this teacher
  const { data: kudosPosts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher-kudos', teacherId],
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading your appreciation messages...</div>
      </div>
    );
  }

  if (!kudosPosts || kudosPosts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
        <CardContent className="pt-12 pb-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Student Appreciation Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Students can tag you when sharing their kindness acts. When they do, you'll see their appreciation messages here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="text-pink-500" size={24} />
            Your Student Appreciation
          </h2>
          <p className="text-muted-foreground mt-1">
            Students have tagged you in {kudosPosts.length} kindness {kudosPosts.length === 1 ? 'act' : 'acts'}
          </p>
        </div>
        <Badge className="bg-pink-500 text-white px-4 py-2">
          <Sparkles className="mr-1" size={14} />
          {kudosPosts.length} {kudosPosts.length === 1 ? 'Kudos' : 'Kudos'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {kudosPosts.map((post) => (
          <Card key={post.id} className="border-l-4 border-l-pink-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="text-pink-500" size={18} />
                    Student Appreciation
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar size={14} />
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-base leading-relaxed">
                "{post.content}"
              </p>
              {post.location && (
                <p className="text-sm text-muted-foreground mt-2">
                  📍 {post.location}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="text-blue-500 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              💝 Teacher Uplift Pulse
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              These messages show how your teaching has inspired students to act with kindness. 
              Your positive impact extends far beyond the classroom!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
