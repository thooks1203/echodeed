# EchoDeed Design Guidelines

## Design Approach: Reference-Based (Social + Gamification)

**Primary References:** Instagram (feed patterns), Discord (community sidebar), Duolingo (gamification/rewards), BeReal (authenticity for Gen Z)

**Design Philosophy:** Create a vibrant, dopamine-friendly interface that makes kindness shareable and rewarding. Balance youthful energy with emotional maturity - this celebrates genuine acts, not superficial engagement.

---

## Layout System

**Sidebar Navigation (Desktop):**
- Fixed left sidebar: 80px wide, full height
- Collapsed icons with tooltips on hover
- Active state: subtle glow effect
- Icons: Home, Feed, Hours, Rewards, Profile, Settings

**Main Content Area:**
- Mobile: Full width with 16px horizontal padding
- Desktop: max-w-2xl centered with sidebar offset (ml-20)
- Feed items: Full-bleed on mobile, card-based on desktop

**Spacing Scale:** Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistency
- Component spacing: p-4 to p-6
- Section gaps: space-y-6 to space-y-8
- Card padding: p-6 on desktop, p-4 on mobile

---

## Typography Hierarchy

**Font Stack:**
- Primary: 'Inter' (700, 600, 500, 400) - clean, modern, excellent readability
- Accent: 'Plus Jakarta Sans' (800, 700) - rounded, friendly for headings

**Text Hierarchy:**
- Hero/Display: 3xl to 4xl, font-black (Plus Jakarta Sans)
- Page Titles: 2xl, font-bold
- Section Headers: xl, font-semibold
- Card Titles: lg, font-semibold
- Body Text: base, font-normal
- Metadata/Timestamps: sm, font-medium
- Labels/Tags: xs to sm, font-semibold uppercase tracking-wide

---

## Component Library

### Kindness Feed Cards
**Structure:**
- Rounded-2xl cards with subtle shadow
- Anonymous avatar placeholder (generated patterns, not photos)
- Timestamp (e.g., "2h ago")
- Kindness description: 2-4 lines with "Read more" expansion
- Category badge (top-right): small pill with icon
- Reaction bar: Heart/Clap/Star icons with counts
- Share button (anonymous sharing)

**Feed Layout:**
- Mobile: Single column, full-width cards
- Desktop: Single column max-w-xl for readability
- Infinite scroll with skeleton loading states

### Service Hour Tracker
**Dashboard Widget:**
- Large circular progress indicator (stroke-width: 12)
- Center: Current hours in 3xl bold, "hours" in sm below
- Goal ring around progress (e.g., "25/40 hours")
- Mini milestone badges below (Bronze/Silver/Gold tiers)
- Weekly breakdown bar chart underneath

### Reward Marketplace Cards
**Grid Layout:**
- Mobile: 2-column grid (grid-cols-2, gap-4)
- Desktop: 3-column grid (grid-cols-3, gap-6)

**Card Design:**
- Aspect ratio 3:4
- Image placeholder at top (rounded-t-xl)
- Gradient overlay on image bottom for text readability
- Reward title: font-semibold, text-white (on gradient)
- Point cost: Large bold number with coin icon
- "Redeem" button at bottom (full-width within card)
- Lock icon overlay for insufficient points

### Dual Reward System Display
**Student Dashboard:**
- Split-screen on desktop: Student rewards (left 60%) | Parent rewards (right 40%)
- Mobile: Tabs to switch between "My Rewards" and "Family Impact"

**Parent Notification Cards:**
- Subtle card showing "Your kindness earned your family..."
- Small confetti animation on point awards
- Link to parent portal (external)

### Post Kindness Flow
**Floating Action Button (FAB):**
- Bottom-right: Rounded-full, 56px diameter
- Plus icon, subtle pulse animation
- Sticks above bottom nav on mobile

**Modal Form:**
- Full-screen on mobile, centered modal on desktop (max-w-lg)
- Category selector: Icon grid (6 categories)
- Text area: Minimum 20 characters, maximum 500
- Anonymous verification checkbox
- Character counter
- Estimated hours dropdown
- Submit button: Full-width, gradient background

### Navigation Elements
**Bottom Nav (Mobile):**
- Fixed bottom bar, 64px height
- 5 icons: Feed, Hours, Post (FAB), Rewards, Profile
- Active state: icon color shift with subtle upward lift

**Sidebar (Desktop):**
- Icons vertically stacked with 16px spacing
- School logo at top (40px circular)
- Active page: background glow effect
- Logout at bottom

---

## Images

**Hero Image (Landing/Login Page):**
- Full-width hero: 60vh on mobile, 70vh on desktop
- Image Description: Diverse group of high school students collaborating on a community project - vibrant, authentic, candid photography showing genuine connection and teamwork. Bright natural lighting.
- Gradient overlay: Purple gradient (opacity 40%) from bottom
- Centered content over image: Logo, tagline, CTA button with backdrop blur

**Reward Marketplace Images:**
- Product/reward photos: School merch, gift cards, event tickets
- Consistent 3:4 aspect ratio
- High-quality, bright product photography

**Empty States:**
- Illustration style: Friendly, simple line art with purple accents
- Feed empty: Student planting kindness seed illustration
- No rewards: Treasure chest with sparkles
- Zero hours: Clock with encouraging message

**Profile Avatars:**
- Generated geometric patterns (no photos for anonymity)
- Unique color combinations per user
- Circular with 2px border

---

## Interaction Patterns

**Micro-interactions:**
- Heart reaction: Pop and color fill on tap
- Card tap: Subtle scale (1.02) with shadow expansion
- Button press: Scale down to 0.98
- Loading states: Skeleton screens with shimmer effect
- Success actions: Confetti burst (lottie animation)

**Gestures (Mobile):**
- Pull-to-refresh on feed
- Swipe between tabs
- Long-press on kindness post for quick reactions

**Animations:**
- Page transitions: Slide from right (mobile), fade (desktop)
- Modal entry: Scale up from 0.95 with fade
- Reward unlock: Sparkle trail animation
- Hour milestone: Circular progress fill with celebration

---

## Accessibility

**Core Requirements:**
- All interactive elements: Minimum 44px touch target
- Form labels: Visible, positioned above inputs
- Focus indicators: 2px solid ring with offset
- Error messages: Below field with error icon
- Skip navigation link for keyboard users
- ARIA labels for icon-only buttons
- Color contrast: WCAG AA minimum (4.5:1 for body text)

**Screen Reader Support:**
- Announce point gains
- Feed updates with live region
- Modal focus trapping
- Descriptive button labels (not just "Click here")

---

## Responsive Breakpoints

- Mobile: < 768px (primary target)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar visible)

**Mobile-First Adjustments:**
- Typography: Scale down 1 size on mobile
- Padding: Reduce by 25% on mobile
- Grid columns: Always single/double on mobile
- Sidebar: Converts to bottom nav
- Modals: Full-screen overlays

This design creates an energetic, purposeful platform that makes kindness visible, rewarding, and socially engaging for Gen Z students while maintaining emotional authenticity.