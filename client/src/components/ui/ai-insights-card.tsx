import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Heart, Zap } from "lucide-react";

interface AIInsightProps {
  post: {
    id: string;
    content: string;
    sentimentScore: number | null;
    impactScore: number | null;
    emotionalUplift: number | null;
    kindnessCategory: string | null;
    rippleEffect: number | null;
    wellnessContribution: number | null;
    aiConfidence: number | null;
    aiTags: string[] | null;
    analyzedAt: string | null;
  };
}

export function AIInsightCard({ post }: AIInsightProps) {
  if (!post.analyzedAt) {
    return (
      <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/30 dark:border-purple-700/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI analysis in progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    sentimentScore,
    impactScore,
    emotionalUplift,
    kindnessCategory,
    rippleEffect,
    wellnessContribution,
    aiConfidence,
    aiTags
  } = post;

  return (
    <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/30 dark:border-purple-700/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
          <Brain className="w-4 h-4" />
          AI Impact Analysis
          {aiConfidence && (
            <Badge variant="secondary" className="ml-auto text-xs bg-purple-100 dark:bg-purple-800">
              {aiConfidence}% confidence
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment & Impact Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
              <Heart className="w-3 h-3" />
              Sentiment
            </div>
            <Progress value={sentimentScore || 0} className="h-2" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{sentimentScore}/100</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              <TrendingUp className="w-3 h-3" />
              Impact
            </div>
            <Progress value={impactScore || 0} className="h-2" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{impactScore}/100</span>
          </div>
        </div>

        {/* Wellness Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-300">
              {emotionalUplift || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Emotional Uplift</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
              {rippleEffect || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Ripple Effect</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
              {wellnessContribution || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Wellness</div>
          </div>
        </div>

        {/* Category & Tags */}
        {(kindnessCategory || aiTags) && (
          <div className="space-y-2">
            {kindnessCategory && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                {kindnessCategory}
              </Badge>
            )}
            {aiTags && aiTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {aiTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}