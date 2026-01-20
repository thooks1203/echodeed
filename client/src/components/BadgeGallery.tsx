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

// ═══════════════════════════════════════════════════════════════════════════════
// THE MCNEILL COLLECTION - Eastern Guilford Wildcat Badges
// Modern "level-up" gaming aesthetic with Blue/Gold Wildcat colors
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_BADGES: BadgeDefinition[] = [
  { 
    id: 'originator', 
    name: 'The Originator', 
    description: 'Plant your first seed of kindness!', 
    icon: '🌱', 
    color: 'green-gold', 
    category: 'achievement',
    requirements: 'Make your very first post'
  },
  { 
    id: 'weekly_warrior', 
    name: 'Weekly Warrior', 
    description: 'Show consistent kindness all week!', 
    icon: '🛡️', 
    color: 'silver-blue', 
    category: 'achievement',
    requirements: 'Post 3+ deeds in one week'
  },
  { 
    id: 'grade_hero', 
    name: 'Grade Hero', 
    description: 'Lead your grade to victory!', 
    icon: '👑', 
    color: 'gold', 
    category: 'recognition',
    requirements: 'Be in the grade with most posts this month'
  },
  { 
    id: 'echo_maker', 
    name: 'Echo Maker', 
    description: 'Your kindness creates ripples!', 
    icon: '💫', 
    color: 'blue-cyan', 
    category: 'achievement',
    requirements: 'Get 5+ echoes on a single post'
  },
  { 
    id: 'wildcat_legend', 
    name: 'Wildcat Legend', 
    description: 'The ultimate kindness achievement!', 
    icon: '🐾', 
    color: 'diamond', 
    category: 'legendary',
    requirements: 'Reach 50 deeds or Principal recognition'
  },
];

// Wildcat-themed color palette (Blue/Gold base with accent colors)
const colorClasses: Record<string, string> = {
  'green-gold': 'from-green-400 via-emerald-500 to-amber-400 ring-green-300',
  'silver-blue': 'from-slate-300 via-blue-400 to-blue-600 ring-blue-300',
  'gold': 'from-yellow-400 via-amber-500 to-yellow-600 ring-yellow-300',
  'blue-cyan': 'from-blue-500 via-cyan-400 to-teal-400 ring-cyan-300',
  'diamond': 'from-purple-400 via-pink-300 to-cyan-300 ring-purple-200',
  yellow: 'from-yellow-400 to-amber-500 ring-yellow-300',
  purple: 'from-purple-400 to-indigo-500 ring-purple-300',
  blue: 'from-blue-400 to-cyan-500 ring-blue-300',
  orange: 'from-orange-400 to-red-500 ring-orange-300',
  cyan: 'from-cyan-400 to-teal-500 ring-cyan-300',
  pink: 'from-pink-400 to-rose-500 ring-pink-300',
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
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-amber-900 rounded-xl shadow-lg border border-amber-400/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <div>
            <h3 className="font-bold text-amber-400 text-sm">The McNeill Collection</h3>
            <p className="text-xs text-blue-200">Eastern Guilford Wildcats</p>
          </div>
        </div>
        <div className="bg-amber-400/20 px-3 py-1 rounded-full">
          <span className="text-sm font-bold text-amber-400">
            {earnedCount}/{allBadges.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-square rounded-full bg-blue-700/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`relative aspect-square rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${
                badge.isEarned
                  ? `bg-gradient-to-br ${colorClasses[badge.color] || colorClasses.gold} shadow-lg hover:scale-110 hover:shadow-xl ring-2 ring-offset-1 ring-offset-blue-900`
                  : 'bg-blue-950/60 border-2 border-blue-700/50 hover:border-blue-600/70'
              }`}
              title={badge.isEarned ? `${badge.name} - Earned!` : `${badge.name} - ${badge.requirements}`}
            >
              {/* Badge Icon */}
              <span className={`text-xl ${badge.isEarned ? 'drop-shadow-md' : 'grayscale opacity-40'}`}>
                {badge.icon}
              </span>
              
              {/* Lock overlay for unearned */}
              {!badge.isEarned && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                  <Lock className="w-3 h-3 text-blue-400/60 absolute bottom-1" />
                </div>
              )}
              
              {/* Sparkle effect for earned */}
              {badge.isEarned && (
                <Sparkles className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-amber-300 animate-pulse drop-shadow-lg" />
              )}
              
              {/* Badge name on hover */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="bg-blue-950 text-amber-400 text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-xl border border-amber-400/30">
                  {badge.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent achievements */}
      {earnedBadges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-400/20">
          <p className="text-xs font-medium text-blue-300 mb-2">🏆 Recent Achievements</p>
          <div className="space-y-2">
            {earnedBadges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="flex items-center gap-2 text-sm bg-blue-950/40 rounded-lg px-2 py-1">
                <span className="text-lg">{badge.badgeIcon}</span>
                <span className="font-medium text-amber-300">{badge.badgeName}</span>
                <span className="text-xs text-blue-400 ml-auto">
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
