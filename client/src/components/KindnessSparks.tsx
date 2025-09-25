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
  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Random size
  const size = 16 + Math.random() * 16; // 16-32px
  
  // Random animation duration
  const duration = 2 + Math.random() * 2; // 2-4 seconds
  
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
        scale: [0, 1.2, 1, 0],
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
        zIndex: 9999,
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
      // Create 8-12 sparks
      const numSparks = 8 + Math.floor(Math.random() * 5);
      const newSparks = Array.from({ length: numSparks }, (_, i) => sparkCounter + i);
      
      setSparks(newSparks);
      setSparkCounter(prev => prev + numSparks);
      
      // Auto-complete after all animations should be done
      const timeout = setTimeout(() => {
        setSparks([]);
        onComplete?.();
      }, 6000); // Max duration for all animations
      
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
    setIsActive(true);
  };

  const handleComplete = () => {
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