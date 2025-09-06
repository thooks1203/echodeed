import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Share2, Copy, Users, Trophy, Target, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  pendingRewards: number;
  conversionRate: number;
  currentRank: number;
  totalRanked: number;
}

interface TopReferrer {
  rank: number;
  displayName: string;
  totalReferrals: number;
  earnings: number;
  badge: string;
}

export function ReferralSystem() {
  const { toast } = useToast();
  const [shareMethod, setShareMethod] = useState<'link' | 'social' | 'email'>('link');

  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
  });

  const { data: topReferrers = [] } = useQuery<TopReferrer[]>({
    queryKey: ['/api/referrals/leaderboard'],
  });

  const handleCopyReferralLink = () => {
    if (!stats?.referralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied! 📋",
      description: "Share this link to earn $ECHO tokens when colleagues join!",
      duration: 3000,
    });
  };

  const handleShare = (platform: string) => {
    if (!stats?.referralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    const message = "Join me on EchoDeed™ - the AI-powered corporate wellness platform that turns kindness into rewards! 💜✨";
    
    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join me on EchoDeed™&body=${encodeURIComponent(message + ' ' + referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔗</div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading referral data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          Viral Referral System
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Earn 50 $ECHO tokens for each colleague you refer!
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Users size={20} style={{ color: '#8B5CF6', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
            {stats.totalReferrals}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Referrals Made</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Gift size={20} style={{ color: '#06B6D4', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#06B6D4' }}>
            {stats.referralEarnings}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>$ECHO Earned</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Target size={20} style={{ color: '#F59E0B', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
            {Math.round(stats.conversionRate)}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Conversion Rate</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Trophy size={20} style={{ color: '#10B981', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
            #{stats.currentRank}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Your Rank</div>
        </div>
      </div>

      {/* Referral Code & Sharing */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} />
          Your Referral Code
        </h3>
        
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <code style={{
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'monospace',
            color: '#8B5CF6'
          }}>
            {stats.referralCode}
          </code>
          <button
            onClick={handleCopyReferralLink}
            style={{
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            data-testid="button-copy-referral"
          >
            <Copy size={12} />
            Copy Link
          </button>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Quick Share:</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'linkedin', label: 'LinkedIn', color: '#0077B5', emoji: '💼' },
              { id: 'twitter', label: 'Twitter', color: '#1DA1F2', emoji: '🐦' },
              { id: 'email', label: 'Email', color: '#EA4335', emoji: '📧' }
            ].map(platform => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                style={{
                  background: platform.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                  justifyContent: 'center'
                }}
                data-testid={`button-share-${platform.id}`}
              >
                <span>{platform.emoji}</span>
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Referrers Leaderboard */}
      {topReferrers.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} style={{ color: '#F59E0B' }} />
            Top Referrers This Month
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topReferrers.slice(0, 5).map((referrer) => (
              <div
                key={referrer.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: referrer.rank <= 3 ? '#f8f9fa' : 'transparent',
                  borderRadius: '8px',
                  border: referrer.rank <= 3 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: referrer.rank === 1 ? '#F59E0B' : referrer.rank === 2 ? '#6b7280' : referrer.rank === 3 ? '#F97316' : '#e5e7eb',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    #{referrer.rank}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{referrer.displayName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{referrer.totalReferrals} referrals</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#8B5CF6' }}>
                    {referrer.earnings} $ECHO
                  </div>
                  <div style={{ fontSize: '12px' }}>{referrer.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Program Details */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(6,182,212,0.05) 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(139,92,246,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#8B5CF6' }}>
          💰 How Referral Rewards Work
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div>✅ <strong>50 $ECHO</strong> when someone joins with your code</div>
          <div>✅ <strong>25 $ECHO bonus</strong> when they complete their first kindness act</div>
          <div>✅ <strong>Monthly leaderboard prizes</strong> for top referrers</div>
          <div>✅ <strong>Special badges</strong> unlock at 5, 10, and 25 referrals</div>
        </div>
      </div>
    </div>
  );
}