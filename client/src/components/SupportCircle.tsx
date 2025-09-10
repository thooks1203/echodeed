import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SupportPost, InsertSupportPost } from '@shared/schema';
import { Heart, AlertTriangle, Send, BookOpen, Users, Home, Brain, Shield, Search } from 'lucide-react';

export function SupportCircle() {
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('emotional');
  const [schoolId, setSchoolId] = useState(''); // Selected school ID
  const [schoolName, setSchoolName] = useState(''); // Selected school name
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // School search functionality
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/schools/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const response = await fetch(`/api/schools/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search schools');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Fetch support posts for this school
  const { data: supportPosts = [], isLoading } = useQuery<SupportPost[]>({
    queryKey: ['/api/support-posts', schoolId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (schoolId) params.append('schoolId', schoolId);
      
      const response = await fetch(`/api/support-posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch support posts');
      return response.json();
    },
    enabled: !!schoolId,
  });

  // Post new support request
  const postMutation = useMutation({
    mutationFn: async (postData: InsertSupportPost) => {
      const response = await fetch('/api/support-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to post support request');
      return response.json();
    },
    onSuccess: () => {
      setNewPost('');
      queryClient.invalidateQueries({ queryKey: ['/api/support-posts'] });
      toast({
        title: "Support request shared",
        description: "Your message has been shared with school counselors who can help.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Heart a support post (show care/support)
  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/support-posts/${postId}/heart`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to heart post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-posts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (!schoolId.trim()) {
      toast({
        title: "School required",
        description: "Please enter your school name to share anonymously with your school community.",
        variant: "destructive",
      });
      return;
    }

    postMutation.mutate({
      content: newPost.trim(),
      category: selectedCategory,
      schoolId: schoolId.trim(),
      gradeLevel: "6-8", // Phase 1: default to 6-8 range
      city: "", // Optional for now
      state: "",
      country: "US",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'social': return Users;
      case 'family': return Home;
      case 'emotional': return Brain;
      case 'physical': return Shield;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'from-blue-400 to-blue-600';
      case 'social': return 'from-green-400 to-green-600';
      case 'family': return 'from-purple-400 to-purple-600';
      case 'emotional': return 'from-pink-400 to-pink-600';
      case 'physical': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Support Circle</h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            A safe space to share what's challenging you and receive support from licensed professionals at your school.
          </p>
        </div>

        {/* School Selection with Search */}
        {!schoolId && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Connect to Your School</h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your school (e.g., Burlington Christian Academy)"
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    onBlur={() => {
                      // Delay hiding results to allow clicks
                      setTimeout(() => setShowSearchResults(false), 200);
                    }}
                    data-testid="input-school-search"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((school: any) => (
                      <button
                        key={school.id}
                        type="button"
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-purple-50 focus:outline-none"
                        onMouseDown={(e) => {
                          // Prevent input blur
                          e.preventDefault();
                        }}
                        onClick={() => {
                          console.log('School selected:', school.name, school.id);
                          setSchoolId(school.id);
                          setSchoolName(school.name);
                          setSearchQuery(school.name);
                          setShowSearchResults(false);
                        }}
                        data-testid={`school-option-${school.id}`}
                      >
                        <div className="font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">{school.domain}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg p-3">
                    <div className="text-gray-500 text-center">
                      No schools found matching "{searchQuery}". Your school may not be registered yet.
                    </div>
                  </div>
                )}

                {/* Click outside to close dropdown */}
                {showSearchResults && (
                  <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowSearchResults(false)}
                  />
                )}
              </div>
              
              <p className="text-sm text-gray-500">
                💡 Your posts will only be visible to counselors at your school
              </p>
            </div>
          </div>
        )}

        {/* Connected School Display */}
        {schoolId && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">Connected to {schoolName}</span>
              <button
                onClick={() => {
                  setSchoolId('');
                  setSchoolName('');
                  setSearchQuery('');
                }}
                className="ml-auto text-green-600 hover:text-green-800 text-sm underline"
              >
                Change school
              </button>
            </div>
          </div>
        )}

        {schoolId && (
          <>
            {/* Post Form */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Share What's on Your Mind</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What kind of challenge is this?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'academic', label: 'School/Grades', icon: BookOpen },
                      { value: 'social', label: 'Friends/Social', icon: Users },
                      { value: 'family', label: 'Family', icon: Home },
                      { value: 'emotional', label: 'Feelings', icon: Brain },
                      { value: 'physical', label: 'Health/Safety', icon: Shield },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedCategory(value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedCategory === value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid={`category-${value}`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's been challenging you? (Anonymous)
                  </label>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share what's on your mind... Remember, this is anonymous and only school counselors will see it."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                    data-testid="textarea-support-post"
                  />
                  <div className="text-right text-sm text-gray-400 mt-1">
                    {newPost.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newPost.trim() || postMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                  data-testid="button-submit-support"
                >
                  <Send className="w-4 h-4" />
                  {postMutation.isPending ? 'Sharing...' : 'Share Anonymously'}
                </button>
              </form>
            </div>

            {/* Support Posts Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Recent Support Requests</h3>
                <div className="text-sm text-gray-500">
                  {schoolId} • Anonymous
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading support requests...</p>
                </div>
              ) : supportPosts.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No requests yet</h3>
                  <p className="text-gray-500">Be the first to share and start building a supportive community!</p>
                </div>
              ) : (
                supportPosts.map((post) => {
                  const IconComponent = getCategoryIcon(post.category);
                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {post.category}
                            </span>
                            {post.isCrisis ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Priority Support
                              </div>
                            ) : null}
                            <span className="text-sm text-gray-400">
                              {formatTimeAgo(post.createdAt.toString())}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-3">{post.content}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => heartMutation.mutate(post.id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                              data-testid={`button-heart-${post.id}`}
                            >
                              <Heart className="w-4 h-4" />
                              {post.heartsCount || 0}
                            </button>
                            {post.hasResponse ? (
                              <div className="text-sm text-green-600 font-medium">
                                ✓ Counselor responded
                              </div>
                            ) : (
                              <div className="text-sm text-blue-600">
                                Waiting for counselor response
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Safety Resources */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Need Immediate Help?</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Crisis Text Line:</strong> Text HOME to 741741
                </div>
                <div>
                  <strong>National Suicide Prevention Lifeline:</strong> 988
                </div>
                <div>
                  <strong>Teen Line:</strong> Text TEEN to 839863
                </div>
                <p className="text-gray-600 mt-3">
                  If you're in immediate danger, please call 911 or go to your nearest emergency room.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}