import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Instagram, Link2, Download, Copy, Check, Share2 } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    category: string;
    createdAt: string;
  };
  schoolInfo?: {
    name: string;
    logoUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
  };
}

export function SocialShareModal({ isOpen, onClose, post, schoolInfo }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate branded image for sharing
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions (Instagram story: 1080x1920, feed: 1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#EC4899');
    gradient.addColorStop(1, '#F59E0B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < canvas.width; i += 40) {
      for (let j = 0; j < canvas.height; j += 40) {
        if ((i + j) % 80 === 0) {
          ctx.beginPath();
          ctx.arc(i, j, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // White content card
    const cardMargin = 80;
    const cardWidth = canvas.width - (cardMargin * 2);
    const cardHeight = canvas.height - (cardMargin * 2);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardMargin, cardWidth, cardHeight, 32);
    ctx.fill();

    // EchoDeed logo/branding at top
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EchoDeed™', canvas.width / 2, cardMargin + 100);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '28px Inter, system-ui, sans-serif';
    ctx.fillText('Acts of Kindness', canvas.width / 2, cardMargin + 145);

    // Decorative heart emoji
    ctx.font = '80px serif';
    ctx.fillText('💜', canvas.width / 2, cardMargin + 260);

    // Post content
    ctx.fillStyle = '#1F2937';
    ctx.font = '36px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // Word wrap the content
    const words = post.content.split(' ');
    let line = '';
    let y = cardMargin + 360;
    const maxWidth = cardWidth - 120;
    const lineHeight = 52;
    
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), canvas.width / 2, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line.trim(), canvas.width / 2, y);

    // Category badge
    ctx.fillStyle = '#8B5CF6';
    const badgeY = canvas.height - cardMargin - 180;
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.fillText(`✨ ${post.category} ✨`, canvas.width / 2, badgeY);

    // School name if provided
    if (schoolInfo?.name) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '24px Inter, system-ui, sans-serif';
      ctx.fillText(schoolInfo.name, canvas.width / 2, canvas.height - cardMargin - 100);
    }

    // Date
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '22px Inter, system-ui, sans-serif';
    const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    ctx.fillText(dateStr, canvas.width / 2, canvas.height - cardMargin - 50);

    setImageGenerated(true);
  }, [isOpen, post, schoolInfo]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `echodeed-kindness-${post.id.slice(0, 8)}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/share/${post.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    // Download the image first
    handleDownload();
    // Open Instagram (mobile will open app, desktop will open web)
    if (schoolInfo?.instagramUrl) {
      window.open(schoolInfo.instagramUrl, '_blank');
    } else {
      window.open('https://instagram.com', '_blank');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'kindness-post.png', { type: 'image/png' });
          await navigator.share({
            title: 'An Act of Kindness',
            text: post.content,
            files: [file]
          });
        });
      } catch (err) {
        console.log('Native share failed, falling back to download');
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-500" />
            Share This Kindness
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: '300px', width: 'auto' }}
            />
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleInstagramShare}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Share to Instagram
            </Button>
            
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* School links */}
          {(schoolInfo?.instagramUrl || schoolInfo?.websiteUrl) && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">School Links</p>
              <div className="flex gap-2">
                {schoolInfo?.instagramUrl && (
                  <a
                    href={schoolInfo.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {schoolInfo?.websiteUrl && (
                  <a
                    href={schoolInfo.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Link2 className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
