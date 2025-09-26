import { SVGProps } from 'react';

// Custom kindness-themed emojis for EchoDeed
// Each emoji is a React component for theming, scaling, and offline availability

interface EmojiProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// Heart with helping hand
export function HeartHandEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF6B9D"/>
      <path d="M12 10v4l3-2z" fill="white"/>
    </svg>
  );
}

// Sparkling heart
export function SparkHeartEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF4081"/>
      <circle cx="8" cy="6" r="1" fill="#FFD700"/>
      <circle cx="16" cy="6" r="1" fill="#FFD700"/>
      <circle cx="18" cy="12" r="1" fill="#FFD700"/>
      <circle cx="6" cy="12" r="1" fill="#FFD700"/>
    </svg>
  );
}

// High five hands
export function HighFiveEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M8 4c0-1.1.9-2 2-2s2 .9 2 2v7l2-2c.78-.78 2.05-.78 2.83 0s.78 2.05 0 2.83L12 16.66 7.17 11.83c-.78-.78-.78-2.05 0-2.83s2.05-.78 2.83 0L12 11V4z" fill="#FFA726"/>
      <path d="M16 4c0-1.1.9-2 2-2s2 .9 2 2v7l-2-2c-.78-.78-2.05-.78-2.83 0s-.78 2.05 0 2.83L20 16.66l4.83-4.83c.78-.78.78-2.05 0-2.83s-2.05-.78-2.83 0L20 11V4z" fill="#FFB74D" transform="scale(-1,1) translate(-24,0)"/>
    </svg>
  );
}

// Thank you note
export function ThankYouNoteEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="#81C784"/>
      <path d="M3 7l9 6 9-6" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M8 12h8M8 15h6" stroke="white" strokeWidth="1.5"/>
    </svg>
  );
}

// Recycle leaf
export function RecycleLeafEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4CAF50"/>
      <path d="M12 6c-1.66 0-3 1.34-3 3 0 2.25 3 6 3 6s3-3.75 3-6c0-1.66-1.34-3-3-3z" fill="#66BB6A"/>
      <circle cx="12" cy="9" r="1" fill="white"/>
    </svg>
  );
}

// Mentor crown
export function MentorCrownEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 16L12 6l7 10H5z" fill="#FFD700"/>
      <circle cx="5" cy="16" r="2" fill="#FFC107"/>
      <circle cx="12" cy="6" r="2" fill="#FFC107"/>
      <circle cx="19" cy="16" r="2" fill="#FFC107"/>
      <rect x="4" y="16" width="16" height="3" fill="#FF9800"/>
    </svg>
  );
}

// Inclusion rainbow
export function InclusionRainbowEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3C7.03 3 3 7.03 3 12h2c0-3.87 3.13-7 7-7s7 3.13 7 7h2c0-4.97-4.03-9-9-9z" fill="#F44336"/>
      <path d="M12 5C8.13 5 5 8.13 5 12h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7z" fill="#FF9800"/>
      <path d="M12 7c-2.76 0-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5z" fill="#FFEB3B"/>
      <path d="M12 9c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" fill="#4CAF50"/>
    </svg>
  );
}

// Community hands
export function CommunityHandsEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="8" fill="#E3F2FD"/>
      <path d="M6 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z" fill="#2196F3"/>
      <path d="M14 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z" fill="#2196F3"/>
      <path d="M10 14c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2s-2-.9-2-2v-2z" fill="#1976D2"/>
    </svg>
  );
}

// Positivity sun
export function PositivitySunEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="6" fill="#FFD54F"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FFA000" strokeWidth="2"/>
      <circle cx="10" cy="10" r="1" fill="#FF8F00"/>
      <circle cx="14" cy="10" r="1" fill="#FF8F00"/>
      <path d="M9 14c0 1.66 1.34 3 3 3s3-1.34 3-3" stroke="#FF8F00" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

// Study buddy
export function StudyBuddyEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="4" width="16" height="12" rx="1" fill="#8BC34A"/>
      <rect x="6" y="6" width="12" height="8" fill="white"/>
      <path d="M8 8h8M8 10h6M8 12h4" stroke="#4CAF50" strokeWidth="1"/>
      <path d="M18 16l2 2v2l-2-2z" fill="#2E7D32"/>
    </svg>
  );
}

// Clean up leaf
export function CleanUpLeafEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#66BB6A"/>
      <path d="M12 6L8 12h8l-4-6z" fill="white"/>
      <circle cx="12" cy="18" r="2" fill="#4CAF50"/>
    </svg>
  );
}

// Kind words bubble
export function KindWordsBubbleEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#E1BEE7"/>
      <path d="M7 7h10M7 10h8M7 13h6" stroke="#7B1FA2" strokeWidth="1.5"/>
      <circle cx="17" cy="8" r="1" fill="#FF4081"/>
    </svg>
  );
}

// Locker note
export function LockerNoteEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="6" y="3" width="12" height="18" rx="1" fill="#90A4AE"/>
      <rect x="7" y="6" width="10" height="12" fill="#FFEB3B"/>
      <path d="M9 9h6M9 11h5M9 13h4" stroke="#F57F17" strokeWidth="1"/>
      <circle cx="18" cy="8" r="1" fill="#F44336"/>
    </svg>
  );
}

// Bus seat
export function BusSeatEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="8" width="18" height="12" rx="2" fill="#FFB74D"/>
      <rect x="5" y="10" width="6" height="8" rx="1" fill="#FF8A65"/>
      <rect x="13" y="10" width="6" height="8" rx="1" fill="#FF8A65"/>
      <circle cx="6" cy="20" r="2" fill="#424242"/>
      <circle cx="18" cy="20" r="2" fill="#424242"/>
      <rect x="8" y="4" width="8" height="6" fill="#2196F3"/>
    </svg>
  );
}

// Cafeteria tray
export function CafeteriaTrayEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2" y="8" width="20" height="12" rx="2" fill="#8D6E63"/>
      <circle cx="7" cy="14" r="3" fill="#FFA726"/>
      <rect x="12" y="11" width="4" height="6" rx="1" fill="#4CAF50"/>
      <rect x="17" y="12" width="3" height="4" fill="#F44336"/>
      <path d="M6 14h2M13 13h2" stroke="white" strokeWidth="1"/>
    </svg>
  );
}

// Tree plant
export function TreePlantEmoji({ size = 24, ...props }: EmojiProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="8" y="16" width="8" height="6" fill="#8D6E63"/>
      <circle cx="12" cy="8" r="6" fill="#4CAF50"/>
      <rect x="11" y="10" width="2" height="8" fill="#6D4C41"/>
      <circle cx="8" cy="6" r="2" fill="#66BB6A"/>
      <circle cx="16" cy="6" r="2" fill="#66BB6A"/>
      <circle cx="12" cy="4" r="2" fill="#81C784"/>
    </svg>
  );
}

// Emoji Registry - Maps keys to components and metadata
export const EmojiRegistry = {
  heart_hand: {
    component: HeartHandEmoji,
    label: "Heart Hand",
    category: "kindness",
    tags: ["help", "care", "heart", "hand"]
  },
  spark_heart: {
    component: SparkHeartEmoji,
    label: "Spark Heart",
    category: "kindness", 
    tags: ["love", "sparkle", "heart", "magic"]
  },
  high_five: {
    component: HighFiveEmoji,
    label: "High Five",
    category: "friendship",
    tags: ["celebrate", "friend", "hands", "success"]
  },
  thank_you_note: {
    component: ThankYouNoteEmoji,
    label: "Thank You Note",
    category: "gratitude",
    tags: ["thanks", "note", "message", "appreciate"]
  },
  recycle_leaf: {
    component: RecycleLeafEmoji,
    label: "Recycle Leaf",
    category: "environment",
    tags: ["recycle", "green", "earth", "clean"]
  },
  mentor_crown: {
    component: MentorCrownEmoji,
    label: "Mentor Crown",
    category: "guidance",
    tags: ["mentor", "teach", "lead", "crown"]
  },
  inclusion_rainbow: {
    component: InclusionRainbowEmoji,
    label: "Inclusion Rainbow",
    category: "inclusion",
    tags: ["inclusive", "rainbow", "diverse", "welcome"]
  },
  community_hands: {
    component: CommunityHandsEmoji,
    label: "Community Hands",
    category: "community",
    tags: ["together", "community", "hands", "unity"]
  },
  positivity_sun: {
    component: PositivitySunEmoji,
    label: "Positivity Sun",
    category: "positivity",
    tags: ["happy", "sun", "bright", "positive"]
  },
  study_buddy: {
    component: StudyBuddyEmoji,
    label: "Study Buddy",
    category: "learning",
    tags: ["study", "help", "learn", "school"]
  },
  clean_up_leaf: {
    component: CleanUpLeafEmoji,
    label: "Clean Up",
    category: "environment",
    tags: ["clean", "environment", "leaf", "tidy"]
  },
  kind_words_bubble: {
    component: KindWordsBubbleEmoji,
    label: "Kind Words",
    category: "communication",
    tags: ["words", "kind", "speak", "nice"]
  },
  locker_note: {
    component: LockerNoteEmoji,
    label: "Locker Note",
    category: "school",
    tags: ["note", "locker", "school", "message"]
  },
  bus_seat: {
    component: BusSeatEmoji,
    label: "Bus Seat",
    category: "school",
    tags: ["bus", "seat", "share", "transport"]
  },
  cafeteria_tray: {
    component: CafeteriaTrayEmoji,
    label: "Cafeteria Tray",
    category: "school",
    tags: ["cafeteria", "lunch", "food", "share"]
  },
  tree_plant: {
    component: TreePlantEmoji,
    label: "Tree Plant",
    category: "environment",
    tags: ["plant", "tree", "grow", "nature"]
  }
} as const;

export type EmojiKey = keyof typeof EmojiRegistry;
export const emojiKeys = Object.keys(EmojiRegistry) as EmojiKey[];