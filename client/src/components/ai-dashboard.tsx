import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Heart, Users, BarChart3, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface WellnessInsights {
  overallWellness: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  dominantCategories: string[];
  totalAnalyzed: number;
  avgSentiment: number;
  avgImpact: number;
}

export function AIDashboard() {
  const { data: insights, isLoading } = useQuery<WellnessInsights>({
    queryKey: ['/api/ai/wellness-insights'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/40 dark:to-indigo-900/40 border-purple-200/50 dark:border-purple-700/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 animate-pulse text-purple-600 dark:text-purple-300" />
            <span className="text-lg font-medium">Loading AI Insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500 rotate-90" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-300" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Impact Analysis
          </h2>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time sentiment analysis and wellness prediction
        </p>
      </div>

      {/* Wellness Overview */}
      <Card className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/40 dark:to-indigo-900/40 border-purple-200/50 dark:border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            Community Wellness Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {insights.overallWellness}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">out of 100</div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(insights.trendDirection)}
              <span className={`text-sm font-medium ${getTrendColor(insights.trendDirection)}`}>
                {insights.trendDirection}
              </span>
            </div>
          </div>
          <Progress value={insights.overallWellness} className="h-3" />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sentiment Score */}
        <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/40 dark:to-emerald-900/40 border-green-200/50 dark:border-green-700/50">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-300" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {insights.avgSentiment}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Sentiment</div>
          </CardContent>
        </Card>

        {/* Impact Score */}
        <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/40 dark:to-cyan-900/40 border-blue-200/50 dark:border-blue-700/50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-300" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {insights.avgImpact}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Impact</div>
          </CardContent>
        </Card>

        {/* Analyzed Posts */}
        <Card className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-200/50 dark:border-indigo-700/50">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-300" />
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
              {insights.totalAnalyzed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Posts Analyzed</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/40 dark:to-orange-900/40 border-amber-200/50 dark:border-amber-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Sparkles className="w-5 h-5" />
            Trending Kindness Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights.dominantCategories.map((category, index) => (
              <Badge 
                key={category} 
                className={`${
                  index === 0 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : index === 1
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                    : 'bg-gradient-to-r from-amber-300 to-orange-300 text-gray-700'
                }`}
              >
                #{index + 1} {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Powered Badge */}
      <div className="text-center">
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
          <Brain className="w-4 h-4 mr-1" />
          Powered by GPT-5 AI
        </Badge>
      </div>
    </div>
  );
}