import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Share2, Download, TrendingUp, Heart, Zap, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableContent {
  id: string;
  type: 'achievement' | 'milestone' | 'company_culture' | 'wellness_impact';
  title: string;
  description: string;
  visualData: {
    primaryStat: string;
    secondaryStat?: string;
    icon: string;
    color: string;
    bgGradient: string;
  };
  shareText: string;
  hashtags: string[];
}

interface CompanyCultureStats {
  companyName: string;
  kindnessScore: number;
  wellnessImprovement: number;
  employeeEngagement: number;
  anonymousParticipation: number;
}

export function SocialSharing() {
  const { toast } = useToast();
  const [selectedShare, setSelectedShare] = useState<ShareableContent | null>(null);

  const { data: shareableContent = [] } = useQuery<ShareableContent[]>({
    queryKey: ['/api/sharing/content'],
  });

  const { data: cultureStats } = useQuery<CompanyCultureStats>({
    queryKey: ['/api/sharing/company-culture'],
  });

  const generateShareImage = (content: ShareableContent) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630; // Optimal for social media

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, content.visualData.color);
    gradient.addColorStop(1, content.visualData.bgGradient);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(content.title, canvas.width / 2, 200);

    // Primary stat
    ctx.font = 'bold 72px -apple-system, system-ui, sans-serif';
    ctx.fillText(content.visualData.primaryStat, canvas.width / 2, 320);

    // Description
    ctx.font = '32px -apple-system, system-ui, sans-serif';
    ctx.fillText(content.description, canvas.width / 2, 420);

    // Brand
    ctx.font = 'bold 24px -apple-system, system-ui, sans-serif';
    ctx.fillText('EchoDeed™ - Your Kindness, Amplified', canvas.width / 2, 550);

    return canvas.toDataURL('image/png');
  };

  const handleShare = (content: ShareableContent, platform: string) => {
    const shareText = `${content.shareText} #${content.hashtags.join(' #')}`;
    const shareUrl = `${window.location.origin}`;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      // Track the share
      fetch('/api/sharing/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content.id,
          platform,
          action: 'share'
        })
      });
    }
  };

  const handleDownloadImage = (content: ShareableContent) => {
    const imageUrl = generateShareImage(content);
    const link = document.createElement('a');
    link.download = `echodeed-${content.type}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    toast({
      title: "Image Downloaded! 📱",
      description: "Perfect for sharing on your favorite social platforms!",
      duration: 3000,
    });
  };

  const generateCompanyCultureShare = (): ShareableContent => {
    if (!cultureStats) return null;

    return {
      id: 'culture-stats',
      type: 'company_culture',
      title: `${cultureStats.companyName} Culture Update`,
      description: 'Fostering workplace wellness through kindness',
      visualData: {
        primaryStat: `${cultureStats.kindnessScore}/100`,
        secondaryStat: `+${cultureStats.wellnessImprovement}%`,
        icon: '💜',
        color: '#8B5CF6',
        bgGradient: '#06B6D4'
      },
      shareText: `Our workplace culture is thriving! ${cultureStats.employeeEngagement}% employee engagement and ${cultureStats.anonymousParticipation}% anonymous participation in wellness programs. #WorkplaceCulture #EmployeeWellness #CorporateKindness`,
      hashtags: ['WorkplaceCulture', 'EmployeeWellness', 'CorporateKindness', 'EchoDeed']
    };
  };

  const allShareableContent = [...shareableContent];
  if (cultureStats) {
    allShareableContent.push(generateCompanyCultureShare());
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          Viral Social Sharing
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Share your achievements while staying completely anonymous
        </p>
      </div>

      {/* Shareable Content Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allShareableContent.map((content) => (
          <div
            key={content.id}
            style={{
              background: content.visualData.bgGradient,
              backgroundImage: `linear-gradient(135deg, ${content.visualData.color}, ${content.visualData.bgGradient})`,
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              opacity: 0.3,
              borderRadius: '16px'
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Content Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{content.visualData.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{content.title}</h3>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>{content.description}</p>
                  </div>
                </div>
                {content.type === 'achievement' && <Award size={20} />}
                {content.type === 'milestone' && <TrendingUp size={20} />}
                {content.type === 'company_culture' && <Heart size={20} />}
                {content.type === 'wellness_impact' && <Zap size={20} />}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{content.visualData.primaryStat}</div>
                  {content.visualData.secondaryStat && (
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>{content.visualData.secondaryStat} improvement</div>
                  )}
                </div>
              </div>

              {/* Share Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDownloadImage(content)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  data-testid={`button-download-${content.id}`}
                >
                  <Download size={12} />
                  Download
                </button>

                {['twitter', 'linkedin', 'facebook'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleShare(content, platform)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'capitalize'
                    }}
                    data-testid={`button-share-${platform}-${content.id}`}
                  >
                    <Share2 size={12} />
                    {platform}
                  </button>
                ))}
              </div>

              {/* Hashtags Preview */}
              <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
                {content.hashtags.map(tag => `#${tag}`).join(' ')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Sharing Benefits */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#8B5CF6' }}>
          🌟 Why Share Your Impact?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div>✅ <strong>Build Company Brand</strong> as a caring workplace</div>
          <div>✅ <strong>Attract Top Talent</strong> with culture transparency</div>
          <div>✅ <strong>Stay Anonymous</strong> while showing impact</div>
          <div>✅ <strong>Inspire Other Companies</strong> to join the movement</div>
        </div>
      </div>
    </div>
  );
}