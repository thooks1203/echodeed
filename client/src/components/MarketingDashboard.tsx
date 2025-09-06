import { useState } from 'react';
import { ReferralSystem } from './ReferralSystem';
import { SocialSharing } from './SocialSharing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Share2, Target, Zap, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MarketingMetrics {
  totalReferrals: number;
  totalShares: number;
  conversionRate: number;
  viralCoefficient: number;
  monthlyGrowth: number;
  engagementRate: number;
}

export function MarketingDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'referrals' | 'social'>('overview');

  const { data: metrics } = useQuery<MarketingMetrics>({
    queryKey: ['/api/marketing/metrics'],
  });

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Marketing Performance Overview */}
      <div style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <TrendingUp size={24} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Marketing Performance</h2>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
            Your viral growth engines are working! Here's how your marketing initiatives are performing.
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Users size={24} style={{ color: '#8B5CF6', marginBottom: '12px' }} />
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6', marginBottom: '4px' }}>
            {metrics?.totalReferrals || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Referrals</div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
            +{metrics?.monthlyGrowth || 0}% this month
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Share2 size={24} style={{ color: '#06B6D4', marginBottom: '12px' }} />
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#06B6D4', marginBottom: '4px' }}>
            {metrics?.totalShares || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Social Shares</div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
            {metrics?.engagementRate || 0}% engagement rate
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Target size={24} style={{ color: '#F59E0B', marginBottom: '12px' }} />
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' }}>
            {metrics?.conversionRate || 0}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Conversion Rate</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Referral → Active User
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Zap size={24} style={{ color: '#10B981', marginBottom: '12px' }} />
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
            {metrics?.viralCoefficient || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Viral Coefficient</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Users per referral
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} style={{ color: '#8B5CF6' }} />
          Quick Marketing Actions
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => setActiveView('referrals')}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            data-testid="button-view-referrals"
          >
            <Users size={20} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Manage Referrals</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Send invites & track rewards</div>
          </button>

          <button
            onClick={() => setActiveView('social')}
            style={{
              background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            data-testid="button-view-social"
          >
            <Share2 size={20} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Social Sharing</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Share achievements & stats</div>
          </button>
        </div>
      </div>

      {/* Marketing Tips */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(6,182,212,0.05) 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(139,92,246,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#8B5CF6' }}>
          💡 Pro Marketing Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div>🎯 <strong>Target your department first</strong> - easier to get colleagues on board</div>
          <div>📱 <strong>Share on LinkedIn</strong> - perfect platform for corporate wellness content</div>
          <div>🏆 <strong>Highlight achievements</strong> - people love seeing measurable impact</div>
          <div>⚡ <strong>Time your shares</strong> - Tuesday-Thursday mornings get best engagement</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          Marketing Hub
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Drive viral growth and showcase your company culture
        </p>
      </div>

      {/* Marketing Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <TabsTrigger value="overview" data-testid="tab-marketing-overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="referrals" data-testid="tab-marketing-referrals">🔗 Referrals</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-marketing-social">📱 Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <ReferralSystem />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialSharing />
        </TabsContent>
      </Tabs>
    </div>
  );
}