import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Heart, 
  DollarSign, 
  Users, 
  Target,
  Calendar,
  Download,
  ExternalLink 
} from 'lucide-react';

interface SponsorAnalytics {
  id: string;
  eventType: 'impression' | 'click' | 'redemption';
  createdAt: string;
  offerId: string;
  userId?: string;
  targetUrl?: string;
}

interface SponsorImpactReport {
  id: string;
  sponsorCompany: string;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  totalImpressions: number;
  totalClicks: number;
  totalRedemptions: number;
  clickThroughRate: number;
  conversionRate: number;
  kindnessActsEnabled: number;
  usersReached: number;
  engagementScore: number;
  brandSentiment: number;
  costPerEngagement: number;
  roi: number;
  generatedAt: string;
}

interface Props {
  sponsorCompany: string;
}

export function SponsorDashboard({ sponsorCompany }: Props) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch analytics data
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['sponsor-analytics', sponsorCompany, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await fetch(`/api/sponsors/${sponsorCompany}/analytics?${params}`);
      return response.json() as Promise<SponsorAnalytics[]>;
    }
  });

  // Fetch impact reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['sponsor-reports', sponsorCompany],
    queryFn: async () => {
      const response = await fetch(`/api/sponsors/${sponsorCompany}/reports`);
      return response.json() as Promise<SponsorImpactReport[]>;
    }
  });

  // Generate new impact report
  const generateReport = async () => {
    try {
      const response = await fetch(`/api/sponsors/${sponsorCompany}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      const newReport = await response.json();
      // Refetch reports to include the new one
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  // Calculate metrics from analytics data
  const metrics = {
    totalImpressions: analytics.filter(a => a.eventType === 'impression').length,
    totalClicks: analytics.filter(a => a.eventType === 'click').length,
    totalRedemptions: analytics.filter(a => a.eventType === 'redemption').length,
    uniqueUsers: new Set(analytics.filter(a => a.userId).map(a => a.userId)).size,
  };

  metrics.clickThroughRate = metrics.totalImpressions > 0 
    ? (metrics.totalClicks / metrics.totalImpressions) * 100 
    : 0;

  metrics.conversionRate = metrics.totalClicks > 0 
    ? (metrics.totalRedemptions / metrics.totalClicks) * 100 
    : 0;

  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 {sponsorCompany} Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your sponsorship performance and community impact on EchoDeed™
          </p>
        </div>

        {/* Date Range Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Date Range:</span>
              </div>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-1 border rounded"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-1 border rounded"
              />
              <Button onClick={generateReport} className="ml-4">
                Generate New Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📈 Overview</TabsTrigger>
            <TabsTrigger value="performance">🎯 Performance</TabsTrigger>
            <TabsTrigger value="impact">💝 Impact</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Impressions</p>
                      <p className="text-2xl font-bold text-blue-600">{metrics.totalImpressions.toLocaleString()}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clicks</p>
                      <p className="text-2xl font-bold text-green-600">{metrics.totalClicks.toLocaleString()}</p>
                    </div>
                    <MousePointer className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">CTR</p>
                      <p className="text-2xl font-bold text-purple-600">{metrics.clickThroughRate.toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users Reached</p>
                      <p className="text-2xl font-bold text-orange-600">{metrics.uniqueUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Summary */}
            {latestReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ROI Summary (Latest Report)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{latestReport.roi}%</p>
                      <p className="text-sm text-gray-600">Return on Investment</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">${latestReport.costPerEngagement / 100}</p>
                      <p className="text-sm text-gray-600">Cost per Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{latestReport.engagementScore}/100</p>
                      <p className="text-sm text-gray-600">Engagement Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📊 Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Click-Through Rate</span>
                      <Badge variant={metrics.clickThroughRate > 2 ? "default" : "secondary"}>
                        {metrics.clickThroughRate.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <Badge variant={metrics.conversionRate > 5 ? "default" : "secondary"}>
                        {metrics.conversionRate.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Redemptions</span>
                      <Badge>{metrics.totalRedemptions}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Home Page Rewards</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Featured Offers</span>
                      <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Newsletter Mentions</span>
                      <Badge className="bg-purple-100 text-purple-800">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            {latestReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Kindness Acts Enabled</p>
                        <p className="text-2xl font-bold text-pink-600">{latestReport.kindnessActsEnabled.toLocaleString()}</p>
                      </div>
                      <Heart className="w-8 h-8 text-pink-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Brand Sentiment</p>
                        <p className="text-2xl font-bold text-green-600">{latestReport.brandSentiment}/100</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Community Reach</p>
                        <p className="text-2xl font-bold text-blue-600">{latestReport.usersReached.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>💝 Community Impact Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700">
                    🌟 <strong>Your sponsorship is making a real difference!</strong>
                  </p>
                  {latestReport && (
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg mt-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">This Month's Impact</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>✨ <strong>{latestReport.kindnessActsEnabled}</strong> acts of kindness were shared by our community</li>
                        <li>🤝 <strong>{latestReport.usersReached}</strong> people were reached with your positive brand message</li>
                        <li>💪 <strong>{latestReport.engagementScore}/100</strong> engagement score shows strong community connection</li>
                        <li>📈 <strong>{latestReport.roi}%</strong> ROI demonstrates measurable business value</li>
                      </ul>
                      <p className="mt-4 text-sm text-gray-600">
                        Generated on {new Date(latestReport.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  📋 Impact Reports
                  <Button onClick={generateReport}>
                    Generate New Report
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <p>Loading reports...</p>
                ) : reports.length === 0 ? (
                  <p className="text-gray-500">No reports generated yet. Click "Generate New Report" to create your first impact report.</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">
                            Impact Report - {new Date(report.reportPeriodStart).toLocaleDateString()} to {new Date(report.reportPeriodEnd).toLocaleDateString()}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge>{report.roi}% ROI</Badge>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Impressions</p>
                            <p className="font-medium">{report.totalImpressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Clicks</p>
                            <p className="font-medium">{report.totalClicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">CTR</p>
                            <p className="font-medium">{report.clickThroughRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Kindness Acts</p>
                            <p className="font-medium">{report.kindnessActsEnabled.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Generated {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}