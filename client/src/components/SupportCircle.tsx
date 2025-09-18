import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SupportPost, InsertSupportPost } from '@shared/schema';
import { Heart, AlertTriangle, Send, BookOpen, Users, Home, Brain, Shield, Search, Lock, MessageSquare, Zap, Info, HelpCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { CrisisInterventionModal } from '@/components/CrisisInterventionModal';
import { SafetyDisclosureModal } from '@/components/SafetyDisclosureModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';

interface SupportCircleProps {
  onBack?: () => void;
}

export function SupportCircle({ onBack }: SupportCircleProps) {
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('emotional');
  // Load school connection from localStorage on component mount
  const [schoolId, setSchoolId] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('supportCircle_schoolId') || '' : ''
  );
  const [schoolName, setSchoolName] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('supportCircle_schoolName') || '' : ''
  );
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Safety and Crisis Detection State
  const [showSafetyDisclosure, setShowSafetyDisclosure] = useState(false);
  const [showCrisisIntervention, setShowCrisisIntervention] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSafetyDisclosureAccepted, setHasSafetyDisclosureAccepted] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('safety_disclosure_accepted') === 'true' : false
  );
  const [hasSupportSafetyAcknowledged, setHasSupportSafetyAcknowledged] = useState(() => 
    false // Always require safety acknowledgment for testing - change to localStorage in production
  );
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  
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

  // Real-time safety analysis as user types
  const analyzeContentSafety = useCallback(async (content: string) => {
    if (!content.trim() || content.length < 10) {
      setSafetyAnalysis(null);
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await apiRequest('POST', '/api/support-posts/analyze-safety', { content });
      setSafetyAnalysis(response);
    } catch (error) {
      console.error('Safety analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Debounced safety analysis
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newPost.trim()) {
        analyzeContentSafety(newPost);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [newPost, analyzeContentSafety]);

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

    // Check if safety disclosure is required
    if (!hasSafetyDisclosureAccepted) {
      setShowSafetyDisclosure(true);
      return;
    }

    // Handle crisis intervention if needed
    if (safetyAnalysis && (safetyAnalysis.safetyLevel === 'Crisis' || safetyAnalysis.requiresIntervention)) {
      setShowCrisisIntervention(true);
      return;
    }

    // Proceed with posting
    proceedWithPost();
  };

  const proceedWithPost = () => {
    const postData: InsertSupportPost = {
      content: newPost.trim(),
      category: selectedCategory,
      schoolId: schoolId.trim(),
      gradeLevel: "6-8", // Phase 1: default to 6-8 range
      city: "", // Optional for now
      state: "",
      country: "US",
      // Add emergency contact if crisis situation
      ...(emergencyContact && {
        emergencyContactName: emergencyContact.name,
        emergencyContactPhone: emergencyContact.phone,
        emergencyContactRelation: emergencyContact.relation,
      }),
      safetyDisclosureAccepted: hasSafetyDisclosureAccepted ? 1 : 0,
    };

    postMutation.mutate(postData);
  };

  const handleSafetyDisclosureAccept = () => {
    setHasSafetyDisclosureAccepted(true);
    localStorage.setItem('safety_disclosure_accepted', 'true');
    
    // Also mark Support safety as acknowledged if this is from Support posting
    setHasSupportSafetyAcknowledged(true);
    localStorage.setItem('support_safety_acknowledged', 'true');
    
    setShowSafetyDisclosure(false);
    
    // If crisis intervention is needed, show that next
    if (safetyAnalysis && (safetyAnalysis.safetyLevel === 'Crisis' || safetyAnalysis.requiresIntervention)) {
      setShowCrisisIntervention(true);
    } else {
      // Otherwise, proceed with posting
      proceedWithPost();
    }
  };

  const handleSupportSafetyAcknowledgment = () => {
    setShowSafetyDisclosure(true);
  };

  const handleEmergencyContactSubmit = (contact: any) => {
    setEmergencyContact(contact);
    setShowCrisisIntervention(false);
    proceedWithPost();
  };

  const getSafetyIndicator = () => {
    if (!safetyAnalysis) return null;
    
    switch (safetyAnalysis.safetyLevel) {
      case 'Crisis':
        return {
          color: 'red',
          icon: AlertTriangle,
          message: 'Crisis detected - immediate help available',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'High_Risk':
        return {
          color: 'orange',
          icon: Shield,
          message: 'High risk content - support resources available',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800'
        };
      case 'Sensitive':
        return {
          color: 'yellow',
          icon: Heart,
          message: 'Sensitive content - wellness resources included',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          color: 'green',
          icon: Heart,
          message: 'Content reviewed - ready to share',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
    }
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
        {/* Header with Back Button */}
        <div className="text-center mb-6 relative">
          <div className="absolute left-0 top-0">
            <BackButton 
              onClick={() => {
                if (onBack) {
                  onBack();
                }
              }}
              variant="minimal"
              style={{ color: '#6b7280' }}
            />
          </div>
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
                          setSchoolId(school.id);
                          setSchoolName(school.name);
                          setSearchQuery(school.name);
                          setShowSearchResults(false);
                          // Save to localStorage for persistence across tabs and sessions
                          localStorage.setItem('supportCircle_schoolId', school.id);
                          localStorage.setItem('supportCircle_schoolName', school.name);
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
                  // Clear localStorage when disconnecting
                  localStorage.removeItem('supportCircle_schoolId');
                  localStorage.removeItem('supportCircle_schoolName');
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
            {/* Safety Acknowledgment Requirement OR Post Form */}
            {!hasSupportSafetyAcknowledged ? (
              /* Safety Acknowledgment Required */
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-orange-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-red-600 mb-2">🛑 STOP: Safety Review Required</h3>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium text-center">
                      ⚠️ YOU MUST VIEW SAFETY RULES BEFORE POSTING ⚠️
                    </p>
                  </div>
                  
                  <p className="text-gray-700 mb-4 max-w-md mx-auto">
                    Before you can post in Support Circle, you are required to review our safety guidelines to understand how we protect students while providing help.
                  </p>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-orange-800 font-medium mb-2">Important Safety Information:</p>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Your posts are anonymous to protect your privacy</li>
                          <li>• If you're in danger, we may contact you to keep you safe</li>
                          <li>• Licensed counselors at your school will see your posts</li>
                          <li>• Crisis support is available 24/7 if you need immediate help</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSupportSafetyAcknowledgment}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2 mx-auto"
                    data-testid="button-review-safety-rules"
                  >
                    <BookOpen className="w-4 h-4" />
                    Review Complete Safety Guidelines
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    You only need to do this once per device
                  </p>
                </div>
              </div>
            ) : (
              /* Post Form */
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

                {/* Message Input with Real-time Safety Analysis */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      What's been challenging you? (Anonymous with safety exceptions)
                    </label>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200"
                      onClick={() => setShowSafetyDisclosure(true)}
                      data-testid="safety-info-button"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Why?
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share what's on your mind... This is anonymous except if someone's in danger (self-harm, abuse, or required by law)."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                      data-testid="textarea-support-post"
                    />
                    {isAnalyzing && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-500">
                        <Zap className="w-3 h-3 animate-pulse" />
                        Analyzing...
                      </div>
                    )}
                  </div>
                  
                  {/* Character count and safety indicator */}
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-400">
                      {newPost.length}/500
                    </div>
                    {!hasSafetyDisclosureAccepted && newPost.trim() && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Lock className="w-3 h-3" />
                        Safety review required
                      </div>
                    )}
                  </div>

                  {/* Risk-Aware Safety Banner for High-Risk Posts */}
                  {safetyAnalysis && (safetyAnalysis.safetyLevel === 'High_Risk' || safetyAnalysis.safetyLevel === 'Crisis') && (
                    <Alert className="mt-3 border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Safety Notice:</strong> If your post suggests danger, counselors may contact you to keep you safe.
                        <div className="mt-1 text-xs">
                          Crisis support: 988 (Suicide & Crisis Lifeline) • 741741 (Crisis Text Line)
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Real-time Safety Analysis Display */}
                  {safetyAnalysis && getSafetyIndicator() && (() => {
                    const indicator = getSafetyIndicator();
                    const IconComponent = indicator?.icon;
                    return (
                      <Alert className={`mt-3 ${indicator?.bgColor} ${indicator?.borderColor}`}>
                        {IconComponent && <IconComponent className={`h-4 w-4 text-${indicator?.color}-600`} />}
                        <AlertDescription className={indicator?.textColor}>
                          <strong>Safety Check:</strong> {indicator?.message}
                          {safetyAnalysis.safetyLevel === 'Crisis' && (
                            <div className="mt-2">
                              <span className="font-medium">Immediate help is available. You don't have to face this alone.</span>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    );
                  })()}
                </div>

                {/* Safety reminder for submit button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <Info className="w-4 h-4 inline mr-1" />
                    Safety exceptions apply for your protection
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSafetyDisclosure(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200"
                    data-testid="view-safety-rules"
                  >
                    📋 View safety rules
                  </button>
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
            )}

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

      {/* Safety Disclosure Modal */}
      <SafetyDisclosureModal
        isOpen={showSafetyDisclosure}
        onAccept={handleSafetyDisclosureAccept}
        onDecline={() => setShowSafetyDisclosure(false)}
      />

      {/* Crisis Intervention Modal */}
      <CrisisInterventionModal
        isOpen={showCrisisIntervention}
        onClose={() => setShowCrisisIntervention(false)}
        safetyLevel={safetyAnalysis?.safetyLevel || 'Safe'}
        emergencyResources={safetyAnalysis?.emergencyResources || []}
        showEmergencyContactForm={safetyAnalysis?.safetyLevel === 'Crisis'}
        onEmergencyContactSubmit={handleEmergencyContactSubmit}
      />
    </div>
  );
}