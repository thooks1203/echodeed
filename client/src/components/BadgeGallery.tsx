import { useQuery } from '@tanstack/react-query';
import { Award, Lock, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string | null;
  badgeIcon: string | null;
  badgeColor: string | null;
  awardedAt: string;
  metadata?: any;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirements?: string;
}

// Default badge definitions if API fails
const DEFAULT_BADGES: BadgeDefinition[] = [
  { id: 'originator', name: 'The Originator', description: 'Share your first act of kindness!', icon: '🌟', color: 'yellow', category: 'achievement' },
  { id: 'weekly_warrior', name: 'Weekly Warrior', description: 'Share 3+ acts of kindness in one week!', icon: '⚔️', color: 'purple', category: 'achievement' },
  { id: 'grade_hero', name: 'Grade Hero', description: 'Your grade had the most posts this month!', icon: '🦸', color: 'blue', category: 'recognition' },
  { id: 'kindness_streak_3', name: '3-Day Streak', description: 'Post kindness 3 days in a row!', icon: '🔥', color: 'orange', category: 'milestone' },
  { id: 'kindness_streak_7', name: '7-Day Streak', description: 'A full week of daily kindness!', icon: '💎', color: 'cyan', category: 'milestone' },
  { id: 'super_supporter', name: 'Super Supporter', description: 'Give hearts to 10 different posts!', icon: '💜', color: 'pink', category: 'achievement' },
  { id: 'staff_star', name: 'Staff Star', description: 'Recognized by staff for outstanding character!', icon: '⭐', color: 'gold', category: 'recognition' },
];

const colorClasses: Record<string, string> = {
  yellow: 'from-yellow-400 to-amber-500 ring-yellow-300',
  purple: 'from-purple-400 to-indigo-500 ring-purple-300',
  blue: 'from-blue-400 to-cyan-500 ring-blue-300',
  orange: 'from-orange-400 to-red-500 ring-orange-300',
  cyan: 'from-cyan-400 to-teal-500 ring-cyan-300',
  pink: 'from-pink-400 to-rose-500 ring-pink-300',
  gold: 'from-amber-400 to-yellow-500 ring-amber-300',
  green: 'from-green-400 to-emerald-500 ring-green-300',
};

export function BadgeGallery({ userId }: { userId?: string }) {
  // Fetch user's earned badges
  const { data: earnedBadges = [], isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ['/api/badges/mine'],
  });

  // Fetch all available badge definitions
  const { data: definitions = DEFAULT_BADGES, isLoading: defsLoading } = useQuery<BadgeDefinition[]>({
    queryKey: ['/api/badges/definitions'],
  });

  const isLoading = badgesLoading || defsLoading;
  
  // Create a set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

  // Combine definitions with earned status
  const allBadges = (definitions.length > 0 ? definitions : DEFAULT_BADGES).map(def => ({
    ...def,
    isEarned: earnedBadgeIds.has(def.id),
    earnedData: earnedBadges.find(b => b.badgeId === def.id)
  }));

  const earnedCount = allBadges.filter(b => b.isEarned).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Badge Gallery</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {earnedCount}/{allBadges.length} Earned
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-pointer group ${
                badge.isEarned
                  ? `bg-gradient-to-br ${colorClasses[badge.color] || colorClasses.yellow} shadow-md hover:scale-105 hover:shadow-lg ring-2 ring-offset-2`
                  : 'bg-gray-100 dark:bg-gray-700 opacity-50 hover:opacity-70'
              }`}
              title={badge.isEarned ? `${badge.name} - Earned!` : `${badge.name} - ${badge.description}`}
            >
              {/* Badge Icon */}
              <span className={`text-2xl ${badge.isEarned ? '' : 'grayscale'}`}>
                {badge.icon}
              </span>
              
              {/* Lock overlay for unearned */}
              {!badge.isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-xl">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
              
              {/* Sparkle effect for earned */}
              {badge.isEarned && (
                <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white/80 animate-pulse" />
              )}
              
              {/* Badge name on hover */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {badge.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent achievements */}
      {earnedBadges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Achievements</p>
          <div className="space-y-2">
            {earnedBadges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="flex items-center gap-2 text-sm">
                <span>{badge.badgeIcon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{badge.badgeName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(badge.awardedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
