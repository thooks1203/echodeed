import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

interface RippleEvent {
  id: string;
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}

export function GlobalKindnessRippleMap() {
  const [ripples, setRipples] = useState<RippleEvent[]>([]);
  const { isConnected } = useWebSocket();

  // Mock WebSocket message handling for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Simulate new kindness events
        const mockData = {
          type: 'NEW_POST',
          id: Date.now().toString(),
        };
        
        if (mockData.type === 'NEW_POST' || mockData.type === 'KINDNESS_RIPPLE') {
          // Convert lat/lng to SVG coordinates (simplified world map projection)
          const x = Math.random() * 400 + 50; // Random for demo
          const y = Math.random() * 200 + 50;
          
          const newRipple: RippleEvent = {
            id: mockData.id || Date.now().toString(),
            x,
            y,
            intensity: Math.random() * 0.8 + 0.2,
            timestamp: Date.now()
          };
          
          setRipples(prev => [...prev.slice(-20), newRipple]);
          
          // Remove ripple after animation
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
          }, 6000);
        }
      }
    }, 3000); // Create ripple every 3 seconds
    
    return () => clearInterval(interval);
  }, [isConnected]);

  // Add demo ripples on mount
  useEffect(() => {
    const demoRipples = [
      { id: '1', x: 120, y: 80, intensity: 0.8, timestamp: Date.now() },
      { id: '2', x: 250, y: 120, intensity: 0.6, timestamp: Date.now() + 1000 },
      { id: '3', x: 350, y: 90, intensity: 0.9, timestamp: Date.now() + 2000 },
      { id: '4', x: 180, y: 160, intensity: 0.5, timestamp: Date.now() + 3000 },
      { id: '5', x: 300, y: 140, intensity: 0.7, timestamp: Date.now() + 4000 }
    ];
    
    demoRipples.forEach((ripple, index) => {
      setTimeout(() => {
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 6000);
      }, index * 1500);
    });
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: '600',
          margin: '0 0 8px 0'
        }}>
          🌍 Global Kindness Ripples
        </h3>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '14px', 
          margin: 0 
        }}>
          Real-time visualization of kindness spreading across the world
        </p>
      </div>

      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* World Map Background */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 500 300"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Simplified world continents */}
          <path 
            d="M50 80 L150 70 L180 90 L220 85 L200 110 L150 120 L80 110 Z"
            fill="rgba(34, 197, 94, 0.2)" 
            stroke="rgba(34, 197, 94, 0.4)"
          />
          <path 
            d="M180 90 L280 85 L320 100 L300 130 L250 140 L220 120 Z"
            fill="rgba(34, 197, 94, 0.2)" 
            stroke="rgba(34, 197, 94, 0.4)"
          />
          <path 
            d="M320 100 L420 95 L450 110 L430 140 L380 150 L320 130 Z"
            fill="rgba(34, 197, 94, 0.2)" 
            stroke="rgba(34, 197, 94, 0.4)"
          />
          <path 
            d="M100 160 L200 155 L250 170 L220 200 L150 210 L100 190 Z"
            fill="rgba(34, 197, 94, 0.2)" 
            stroke="rgba(34, 197, 94, 0.4)"
          />

          {/* Active ripples */}
          {ripples.map((ripple) => {
            const age = (Date.now() - ripple.timestamp) / 6000;
            const radius = age * 60 * ripple.intensity;
            const opacity = Math.max(0, (1 - age) * ripple.intensity);
            
            return (
              <g key={ripple.id}>
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r={radius}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  opacity={opacity}
                />
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r={radius * 0.6}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="1"
                  opacity={opacity * 0.7}
                />
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r="4"
                  fill="#10B981"
                  opacity={opacity}
                />
              </g>
            );
          })}
        </svg>

        {/* Stats overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <div>Active: {ripples.length}</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>Live Updates</div>
        </div>
      </div>

      <div style={{ 
        marginTop: '16px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px' 
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#10B981', fontSize: '20px', fontWeight: '700' }}>
            {ripples.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
            Active Ripples
          </div>
        </div>
        
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#3B82F6', fontSize: '20px', fontWeight: '700' }}>
            243,876
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
            Total Impact
          </div>
        </div>
      </div>
    </div>
  );
}