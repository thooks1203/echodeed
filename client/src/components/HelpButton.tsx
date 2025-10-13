import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  content: string;
  className?: string;
}

export function HelpButton({ content, className }: HelpButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-testid="button-help"
            className={cn(
              "inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              className
            )}
            aria-label="Help information"
          >
            <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Role-specific help content
export const helpContent = {
  student: {
    dashboard: "Your dashboard shows your kindness impact! Track your deeds, service hours, and Echo tokens earned for making a difference.",
    serviceHours: "Log your community service hours here. Upload a verification letter and your teacher will approve it - usually within 24 hours!",
    echoTokens: "Echo tokens are earned by sharing kindness and completing service hours. Redeem them for rewards from local Greensboro businesses!",
    streaks: "Keep your kindness streak alive by posting or logging service hours daily. Longer streaks unlock special milestone badges!",
    rewards: "Browse available rewards and see how many Echo tokens each costs. Your parent can redeem rewards on your behalf.",
    goals: "Set personal goals for kindness acts, service hours, or streaks. Track your progress and celebrate when you achieve them!"
  },
  parent: {
    dashboard: "Monitor your child's character development journey! See their kindness acts, service hours, and earned rewards in real-time.",
    notifications: "Get instant push notifications when your child earns tokens, completes service hours, or reaches milestones.",
    rewards: "Redeem your child's earned Echo tokens for rewards from local businesses. Rewards are sent directly to your email!",
    serviceVerification: "View your child's submitted service hours with photo verification. Teachers review and approve within 24 hours.",
    conversationStarters: "Use these research-based prompts to discuss character education with your child. New prompts appear regularly!",
    faq: "Find answers to common questions about verification, tokens, rewards, privacy, and how EchoDeed supports character education."
  },
  teacher: {
    dashboard: "Your central hub for managing student character development. Review service hours, monitor progress, and track school-wide impact.",
    serviceApproval: "Review student service hour submissions with photo verification. One-click approval makes verification fast and easy!",
    moderation: "Review flagged content from the AI system. All moderation decisions are made by you - the AI only flags for your review.",
    analytics: "Track school-wide character education metrics. Export data to Google Sheets or x2vol for reporting and compliance.",
    rewards: "Monitor student token earnings and reward redemptions. Local business partnerships help you celebrate student achievements!"
  }
};
