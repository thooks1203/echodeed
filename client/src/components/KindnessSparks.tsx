import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface KindnessSparkProps {
  id: number;
  onComplete: () => void;
}

function KindnessSpark({ id, onComplete }: KindnessSparkProps) {
  // Random starting position
  const startX = Math.random() * window.innerWidth;
  const startY = window.innerHeight;
  
  // Random end position (somewhere in upper portion of screen)
  const endX = Math.random() * window.innerWidth;
  const endY = Math.random() * (window.innerHeight * 0.3);
  
  // Random icon and color
  const icons = [Heart, Sparkles, Star];
  const colors = ['#ff1744', '#00e676', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#ffeb3b']; // Much brighter colors
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Random size - BIGGER for visibility
  const size = 32 + Math.random() * 24; // 32-56px
  
  // Random animation duration - SLOWER for visibility
  const duration = 4 + Math.random() * 3; // 4-7 seconds
  
  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        opacity: 0,
        scale: 0,
        rotate: 0
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1.2, 0], // Bigger scale
        rotate: 360
      }}
      exit={{
        opacity: 0,
        scale: 0
      }}
      transition={{
        duration,
        ease: "easeOut",
        opacity: {
          times: [0, 0.2, 0.8, 1]
        }
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        zIndex: 999999, // Much higher z-index to ensure visibility
        pointerEvents: 'none',
        color
      }}
      data-testid={`kindness-spark-${id}`}
    >
      <IconComponent size={size} fill="currentColor" />
    </motion.div>
  );
}

interface KindnessSparksProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function KindnessSparks({ isActive, onComplete }: KindnessSparksProps) {
  const [sparks, setSparks] = useState<number[]>([]);
  const [sparkCounter, setSparkCounter] = useState(0);

  useEffect(() => {
    if (isActive) {
      console.log('🎆 KindnessSparks effect triggered, isActive:', isActive);
      
      // Respect user's reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      console.log('🎆 Reduced motion preference:', prefersReducedMotion);
      
      if (prefersReducedMotion) {
        console.log('🎆 Skipping animation due to reduced motion preference');
        onComplete?.();
        return;
      }
      
      // Create 8-12 sparks
      const numSparks = 8 + Math.floor(Math.random() * 5);
      const newSparks = Array.from({ length: numSparks }, (_, i) => sparkCounter + i);
      
      console.log('🎆 Creating', numSparks, 'sparks:', newSparks);
      setSparks(newSparks);
      setSparkCounter(prev => prev + numSparks);
      
      // Auto-complete after all animations should be done
      const timeout = setTimeout(() => {
        console.log('🎆 Auto-completing sparks animation');
        setSparks([]);
        onComplete?.();
      }, 8000); // Longer duration to see the animation
      
      return () => clearTimeout(timeout);
    }
  }, [isActive, sparkCounter, onComplete]);

  const handleSparkComplete = (sparkId: number) => {
    setSparks(prev => prev.filter(id => id !== sparkId));
  };

  return (
    <AnimatePresence>
      {sparks.map(sparkId => (
        <KindnessSpark
          key={sparkId}
          id={sparkId}
          onComplete={() => handleSparkComplete(sparkId)}
        />
      ))}
    </AnimatePresence>
  );
}

// Hook for triggering kindness sparks
export function useKindnessSparks() {
  const [isActive, setIsActive] = useState(false);

  const triggerSparks = () => {
    console.log('🎆 KINDNESS SPARKS TRIGGERED!', new Date().toLocaleTimeString());
    setIsActive(true);
  };

  const handleComplete = () => {
    console.log('✨ KINDNESS SPARKS COMPLETE!', new Date().toLocaleTimeString());
    setIsActive(false);
  };

  return {
    isActive,
    triggerSparks,
    KindnessSparksComponent: () => (
      <KindnessSparks isActive={isActive} onComplete={handleComplete} />
    )
  };
}