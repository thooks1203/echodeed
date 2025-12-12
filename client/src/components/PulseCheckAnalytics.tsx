import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, Heart } from 'lucide-react';

interface DailyAverage {
  date: string;
  avg_score: string;
  total_responses: string;
  low_scores: string;
}

interface PulseAnalytics {
  dailyAverages: DailyAverage[];
  unresolvedAlerts: number;
}

export function PulseCheckAnalytics() {
  const { data, isLoading } = useQuery<PulseAnalytics>({
    queryKey: ['/api/pulse-check/analytics', { days: 7 }],
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading Pulse Check analytics...</div>
        </CardContent>
      </Card>
    );
  }

  const dailyAverages = data?.dailyAverages || [];
  const unresolvedAlerts = data?.unresolvedAlerts || 0;
  
  const overallAverage = dailyAverages.length > 0
    ? dailyAverages.reduce((sum, d) => sum + parseFloat(d.avg_score || '0'), 0) / dailyAverages.length
    : 0;
  
  const totalResponses = dailyAverages.reduce((sum, d) => sum + parseInt(d.total_responses || '0'), 0);
  const totalLowScores = dailyAverages.reduce((sum, d) => sum + parseInt(d.low_scores || '0'), 0);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 4.5) return '😊';
    if (score >= 3.5) return '🙂';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😔';
    return '😢';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-pink-500" fill="#ec4899" />
          Pulse Check Analytics (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl mb-1">{getScoreEmoji(overallAverage)}</div>
            <div className={`text-2xl font-bold ${getScoreColor(overallAverage)}`}>
              {overallAverage.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">{totalResponses}</div>
            <div className="text-xs text-gray-500">Responses</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-2xl font-bold text-emerald-600">
              {totalResponses > 0 ? Math.round((1 - totalLowScores / totalResponses) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Positive</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${unresolvedAlerts > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <div className={`text-2xl font-bold ${unresolvedAlerts > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {unresolvedAlerts}
            </div>
            <div className="text-xs text-gray-500">Alerts</div>
          </div>
        </div>

        {dailyAverages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Daily Trend</div>
            <div className="flex items-end gap-1 h-20">
              {dailyAverages.slice(0, 7).reverse().map((day, i) => {
                const score = parseFloat(day.avg_score || '0');
                const height = (score / 5) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        score >= 4 ? 'bg-emerald-400' : 
                        score >= 3 ? 'bg-yellow-400' : 
                        score >= 2.5 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${score.toFixed(1)}`}
                    />
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {unresolvedAlerts > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {unresolvedAlerts} student{unresolvedAlerts > 1 ? 's' : ''} may need additional support
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Review crisis alerts in the counselor dashboard
            </p>
          </div>
        )}

        {overallAverage > 0 && overallAverage < 2.5 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                School average below 2.5 - Consider wellness intervention
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
