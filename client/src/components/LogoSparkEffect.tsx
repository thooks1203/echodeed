import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SparkProps {
  delay: number;
  angle: number;
  duration: number;
}

const Spark = ({ delay, angle, duration }: SparkProps) => {
  const distance = 120 + Math.random() * 80; // 120-200px travel distance (DOUBLED!)
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
      style={{
        background: 'linear-gradient(135deg, #fbbf24, #fb923c, #f472b6)',
        boxShadow: '0 0 16px rgba(251, 191, 36, 0.9)',
      }}
      initial={{ 
        x: 0, 
        y: 0, 
        scale: 0,
        opacity: 0 
      }}
      animate={{
        x: x,
        y: y,
        scale: [0, 2.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: 8,
      }}
    />
  );
};

const HeartbeatGlow = () => {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent 70%)',
        filter: 'blur(20px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

interface LogoSparkEffectProps {
  children: React.ReactNode;
}

export default function LogoSparkEffect({ children }: LogoSparkEffectProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  // Generate 8 sparks at different angles
  const sparkAngles = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8);

  return (
    <div className="relative inline-block">
      {/* Heartbeat Glow */}
      <HeartbeatGlow />
      
      {/* Initial Burst Sparks */}
      {sparkAngles.map((angle, i) => (
        <Spark
          key={`burst-${i}`}
          angle={angle}
          delay={i * 0.05} // Stagger slightly
          duration={0.8}
        />
      ))}
      
      {/* Wandering Sparks (offset angles for variety) */}
      {sparkAngles.map((angle, i) => (
        <Spark
          key={`wander-${i}`}
          angle={angle + Math.PI / 16} // Slight offset
          delay={2 + i * 0.1} // Start after burst
          duration={1.2}
        />
      ))}
      
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
