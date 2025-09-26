import { motion, AnimatePresence, MotionConfig } from "framer-motion";
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
  
  // Random icon and color
  const icons = [Heart, Sparkles, Star];
  const colors = ['#ff1744', '#00e676', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#ffeb3b']; // Much brighter colors
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // MASSIVE size for guaranteed visibility!
  const size = 120; // 120px - absolutely impossible to miss!
  
  // Perfect 5-second duration for poster appreciation 
  const duration = 5; // 5 seconds - gives time to appreciate the celebration!
  
  // Sparks are working beautifully! 🎆
  
  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        opacity: 1, // VISIBLE from start!
        scale: 1,   // VISIBLE from start!
        rotate: 0
      }}
      animate={{
        x: endX - startX, // Use transform instead
        y: endY - startY, // Use transform instead  
        opacity: [1, 1, 1, 1, 0], // Stay bright for 4 seconds, fade in final 1 second
        scale: [1, 1.3, 1.2, 1.2, 0], // Stay big for 4 seconds, shrink in final 1 second
        rotate: 360
      }}
      exit={{
        opacity: 0,
        scale: 0
      }}
      transition={{
        duration,
        ease: "linear",
        opacity: { 
          duration, // CRITICAL: Explicitly set duration for opacity
          times: [0, 0.05, 0.8, 0.95, 1] 
        },
        scale: { 
          duration, // CRITICAL: Explicitly set duration for scale
          times: [0, 0.8, 0.95, 1] 
        },
        x: { duration }, // CRITICAL: Explicitly set duration for x movement
        y: { duration }, // CRITICAL: Explicitly set duration for y movement
        rotate: { duration } // CRITICAL: Explicitly set duration for rotation
      }}
      onAnimationComplete={() => {
        // Spark animation completed gracefully
        onComplete();
      }}
      style={{
        position: 'fixed',
        left: startX - size/2, // Center the circle
        top: startY - size/2,  // Center the circle
        width: `${size}px`, // Use our MASSIVE size variable
        height: `${size}px`, // Use our MASSIVE size variable  
        zIndex: 999999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        // MASSIVELY BRIGHT kindness spark styling
        backgroundColor: color, // Use the bright spark color directly!
        borderRadius: '50%',
        border: `4px solid ${color}`,
        boxShadow: `0 0 40px ${color}, 0 0 80px ${color}, 0 0 120px ${color}99`, // TRIPLE glow effect!
        backdropFilter: 'blur(4px)',
        // Beautiful kindness spark styling
        opacity: 1,
        visibility: 'visible'
      }}
      data-testid={`kindness-spark-${id}`}
    >
      <IconComponent size={size/2} fill="white" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }} />
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

  // Simple cleanup effect - clear sparks after enough time
  useEffect(() => {
    if (sparks.length > 0) {
      const cleanup = setTimeout(() => {
        // Cleanup completed sparks
        setSparks([]);
      }, 7000); // 7 seconds - ensures 5s animation + 2s buffer
      
      return () => clearTimeout(cleanup);
    }
  }, [sparks.length]);

  useEffect(() => {
    if (isActive) {
      // Create 8-12 beautiful kindness sparks
      const numSparks = 8 + Math.floor(Math.random() * 5);
      const newSparks = Array.from({ length: numSparks }, (_, i) => sparkCounter + i);
      setSparks(newSparks);
      setSparkCounter(prev => prev + numSparks);
      
      // ✅ DON'T call onComplete immediately! Let the sparks animate first!
      // onComplete will be called when all sparks finish their animations
    }
  }, [isActive]);

  const handleSparkComplete = (sparkId: number) => {
    setSparks(prev => {
      const remaining = prev.filter(id => id !== sparkId);
      
      // If this was the last spark, call onComplete
      if (remaining.length === 0) {
        setTimeout(() => onComplete?.(), 100); // Small delay to ensure cleanup
      }
      
      return remaining;
    });
  };

  // Use React Portal to render directly to document.body to escape any clipping containers
  return createPortal(
    <MotionConfig reducedMotion="never">
      <AnimatePresence>
        {sparks.map(sparkId => (
          <KindnessSpark
            key={sparkId}
            id={sparkId}
            onComplete={() => handleSparkComplete(sparkId)}
          />
        ))}
      </AnimatePresence>
      {/* Kindness sparks are now working beautifully! */}
    </MotionConfig>,
    document.body
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