import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Heart, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SentimentAnalysis {
  overallMood: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotionBreakdown: {
    joy: number;
    gratitude: number;
    compassion: number;
    anxiety: number;
    stress: number;
    burnout: number;
  };
  insights: string[];
  recommendations: string[];
  predictedTrend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
}

interface TeamMoodAnalysis {
  department: string;
  averageSentiment: number;
  participationRate: number;
  moodTrend: 'up' | 'down' | 'stable';
  alertLevel: 'green' | 'yellow' | 'red';
  keyInsights: string[];
}

export default function AISentimentAnalyzer() {
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamMoodAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-analyze sentiment every 30 seconds
    if (autoAnalysisEnabled) {
      const interval = setInterval(() => {
        performSentimentAnalysis();
      }, 30000);
      
      // Initial analysis
      performSentimentAnalysis();
      
      return () => clearInterval(interval);
    }
  }, [autoAnalysisEnabled]);

  const performSentimentAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI sentiment analysis processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockAnalysis: SentimentAnalysis = {
        overallMood: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
        confidence: Math.random() * 0.2 + 0.8, // 80-100%
        emotionBreakdown: {
          joy: Math.random() * 40 + 30,
          gratitude: Math.random() * 30 + 25,
          compassion: Math.random() * 35 + 20,
          anxiety: Math.random() * 20 + 5,
          stress: Math.random() * 25 + 10,
          burnout: Math.random() * 15 + 3
        },
        insights: [
          'Team morale has improved 23% since implementing wellness initiatives',
          'Gratitude expressions increased by 41% in engineering department',
          'Early detection: Sales team showing signs of end-of-quarter stress',
          'Cross-departmental kindness activities showing positive correlation with productivity'
        ],
        recommendations: [
          'Schedule team wellness check-in within 48 hours for high-stress departments',
          'Promote peer recognition program to amplify positive sentiment',
          'Implement breathing exercises during high-stress periods',
          'Create buddy system for employees showing isolation patterns'
        ],
        predictedTrend: Math.random() > 0.6 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'declining',
        riskLevel: Math.random() > 0.7 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high'
      };

      const mockTeamAnalysis: TeamMoodAnalysis[] = [
        {
          department: 'Engineering',
          averageSentiment: Math.random() * 30 + 70,
          participationRate: Math.random() * 20 + 78,
          moodTrend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          alertLevel: Math.random() > 0.7 ? 'green' : Math.random() > 0.4 ? 'yellow' : 'red',
          keyInsights: ['High collaboration score', 'Innovation mood positive', 'Workload balance good']
        },
        {
          department: 'Sales',
          averageSentiment: Math.random() * 25 + 65,
          participationRate: Math.random() * 15 + 82,
          moodTrend: Math.random() > 0.4 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          alertLevel: Math.random() > 0.6 ? 'green' : Math.random() > 0.4 ? 'yellow' : 'red',
          keyInsights: ['Quarter-end pressure detected', 'Team support strong', 'Recognition needs attention']
        },
        {
          department: 'Marketing',
          averageSentiment: Math.random() * 28 + 72,
          participationRate: Math.random() * 18 + 85,
          moodTrend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          alertLevel: Math.random() > 0.8 ? 'green' : Math.random() > 0.5 ? 'yellow' : 'red',
          keyInsights: ['Creative energy high', 'Campaign stress manageable', 'Cross-team collaboration excellent']
        }
      ];

      setAnalysis(mockAnalysis);
      setTeamAnalysis(mockTeamAnalysis);

      // Show alert for high-risk situations
      if (mockAnalysis.riskLevel === 'high' || mockAnalysis.overallMood === 'negative') {
        toast({
          title: \"🚨 Wellness Alert\",
          description: \"AI detected potential team wellness concerns. Immediate intervention recommended.\",
          variant: \"destructive\",
        });
      }

    } catch (error) {
      console.error('Failed to perform sentiment analysis:', error);
      toast({
        title: \"Analysis Error\",
        description: \"Unable to complete sentiment analysis. Please try again.\",
        variant: \"destructive\",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'text-emerald-600 dark:text-emerald-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-amber-600 dark:text-amber-400';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return <TrendingUp className=\"w-5 h-5 text-emerald-500\" />;
      case 'negative': return <TrendingDown className=\"w-5 h-5 text-red-500\" />;
      default: return <Target className=\"w-5 h-5 text-amber-500\" />;
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  if (!analysis) {
    return (
      <Card className=\"w-full\" data-testid=\"sentiment-analyzer-loading\">
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Brain className=\"w-5 h-5\" />
            AI Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Analyzing team mood and wellness patterns...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=\"flex items-center gap-2\">
            <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500\"></div>
            <span className=\"text-sm text-muted-foreground\">Initializing AI analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className=\"space-y-6 w-full\" data-testid=\"sentiment-analyzer-dashboard\">
      {/* Overall Sentiment Analysis */}
      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
          <CardTitle className=\"text-lg font-semibold flex items-center gap-2\">
            <Brain className=\"w-5 h-5 text-blue-500\" />
            AI Sentiment Analysis
          </CardTitle>
          <Badge variant={getRiskBadgeVariant(analysis.riskLevel)} data-testid={`risk-level-${analysis.riskLevel}`}>
            {analysis.riskLevel.toUpperCase()} RISK
          </Badge>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center gap-3\">
              {getMoodIcon(analysis.overallMood)}
              <div>
                <div className={`font-semibold ${getMoodColor(analysis.overallMood)}`}>
                  {analysis.overallMood.charAt(0).toUpperCase() + analysis.overallMood.slice(1)} Mood
                </div>
                <div className=\"text-sm text-muted-foreground\">
                  {(analysis.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
            </div>
            <Button 
              onClick={performSentimentAnalysis}
              disabled={isAnalyzing}
              size=\"sm\"
              data-testid=\"button-refresh-analysis\"
            >
              {isAnalyzing ? (
                <>
                  <div className=\"animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2\"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className=\"w-3 h-3 mr-2\" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>

          {/* Emotion Breakdown */}
          <div className=\"space-y-3\">
            <h4 className=\"font-semibold text-sm\">Emotion Breakdown</h4>
            <div className=\"grid grid-cols-2 gap-4\">
              {Object.entries(analysis.emotionBreakdown).map(([emotion, value]) => (
                <div key={emotion} className=\"space-y-2\">
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"capitalize flex items-center gap-1\">
                      <Heart className=\"w-3 h-3\" />
                      {emotion}
                    </span>
                    <span>{value.toFixed(1)}%</span>
                  </div>
                  <Progress value={value} className=\"h-2\" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Department Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className=\"text-lg font-semibold\">Department Mood Analysis</CardTitle>
          <CardDescription>
            AI-powered insights across different teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=\"space-y-4\">
            {teamAnalysis.map((team, index) => (
              <div 
                key={team.department} 
                className=\"p-4 border rounded-lg space-y-3\"
                data-testid={`team-analysis-${team.department.toLowerCase()}`}
              >
                <div className=\"flex items-center justify-between\">
                  <h4 className=\"font-semibold\">{team.department}</h4>
                  <Badge 
                    variant={team.alertLevel === 'green' ? 'default' : team.alertLevel === 'yellow' ? 'secondary' : 'destructive'}
                  >
                    {team.alertLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className=\"grid grid-cols-2 gap-4 text-sm\">
                  <div>
                    <span className=\"text-muted-foreground\">Avg Sentiment: </span>
                    <span className=\"font-medium\">{team.averageSentiment.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className=\"text-muted-foreground\">Participation: </span>
                    <span className=\"font-medium\">{team.participationRate.toFixed(1)}%</span>
                  </div>
                </div>

                <div className=\"flex flex-wrap gap-2\">
                  {team.keyInsights.map((insight, idx) => (
                    <Badge key={idx} variant=\"outline\" className=\"text-xs\">
                      {insight}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights & Recommendations */}
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        <Card>
          <CardHeader>
            <CardTitle className=\"text-lg font-semibold flex items-center gap-2\">
              <TrendingUp className=\"w-5 h-5 text-emerald-500\" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-3\">
              {analysis.insights.map((insight, index) => (
                <div key={index} className=\"flex gap-2 text-sm\">
                  <div className=\"w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0\" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=\"text-lg font-semibold flex items-center gap-2\">
              <AlertTriangle className=\"w-5 h-5 text-amber-500\" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-3\">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className=\"flex gap-2 text-sm\">
                  <div className=\"w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0\" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}