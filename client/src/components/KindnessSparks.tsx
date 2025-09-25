import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface KindnessSparkProps {
  id: number;
  onComplete: () => void;
}

function KindnessSpark({ id, onComplete }: KindnessSparkProps) {
  // TEST VERSION: Fixed visible positions in center of screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Start from bottom center, move to top center (guaranteed visible)
  const startX = centerX + (Math.random() - 0.5) * 200; // Small spread around center
  const startY = window.innerHeight - 100; // Start near bottom
  const endX = centerX + (Math.random() - 0.5) * 200; // End near center
  const endY = 50; // End near top
  
  console.log(`🎆 Spark ${id} position: start(${startX}, ${startY}) -> end(${endX}, ${endY})`);
  
  // Random icon and color
  const icons = [Heart, Sparkles, Star];
  const colors = ['#ff1744', '#00e676', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#ffeb3b']; // Much brighter colors
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // HUGE size for visibility test
  const size = 64; // Fixed 64px - impossible to miss!
  
  // VERY SLOW for visibility test
  const duration = 6; // Fixed 6 seconds - very slow
  
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
        color,
        // TEST: Add visible background to make absolutely sure it's visible
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '50%',
        padding: '8px',
        border: '3px solid black',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
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
      
      // TEMPORARILY BYPASS reduced motion for debugging - we need to see if portal works
      const prefersReducedMotion = false; // window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      console.log('🎆 Reduced motion preference (BYPASSED FOR TESTING):', prefersReducedMotion);
      
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

  // Use React Portal to render directly to document.body to escape any clipping containers
  return createPortal(
    <AnimatePresence>
      {sparks.map(sparkId => (
        <KindnessSpark
          key={sparkId}
          id={sparkId}
          onComplete={() => handleSparkComplete(sparkId)}
        />
      ))}
    </AnimatePresence>,
    document.body
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