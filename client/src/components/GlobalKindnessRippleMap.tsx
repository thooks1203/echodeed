import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

interface RippleEvent {
  id: string;
  lat: number;
  lng: number;
  timestamp: Date;
  category: string;
  intensity: number;
}

interface ActiveRipple {
  id: string;
  x: number;
  y: number;
  category: string;
  intensity: number;
  startTime: number;
  duration: number;
}

export function GlobalKindnessRippleMap() {
  const [activeRipples, setActiveRipples] = useState<ActiveRipple[]>([]);
  const [totalRipples, setTotalRipples] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RippleEvent[]>([]);

  // Convert lat/lng to SVG coordinates (simplified world map projection)
  const latLngToXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(380, y)) };
  };

  // Add a new ripple
  const addRipple = useCallback((event: RippleEvent) => {
    const { x, y } = latLngToXY(event.lat, event.lng);
    const newRipple: ActiveRipple = {
      id: event.id,
      x,
      y,
      category: event.category,
      intensity: event.intensity,
      startTime: Date.now(),
      duration: 4000 + (event.intensity * 1000) // 4-7 seconds based on intensity
    };

    setActiveRipples(prev => [...prev, newRipple]);
    setTotalRipples(prev => prev + 1);
    
    // Add to recent activity
    setRecentActivity(prev => [event, ...prev.slice(0, 4)]);

    // Auto-remove ripple after duration
    setTimeout(() => {
      setActiveRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, newRipple.duration);
  }, []);

  // WebSocket message handler for real-time ripples
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'NEW_POST' && message.location) {
      // Create ripple from new post
      const rippleEvent: RippleEvent = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        lat: message.location.lat || (Math.random() * 60 + 20), // Random if no location
        lng: message.location.lng || (Math.random() * 240 - 120),
        timestamp: new Date(),
        category: message.category || 'general',
        intensity: Math.random() * 3 + 1
      };
      addRipple(rippleEvent);
    } else if (message.type === 'KINDNESS_RIPPLE') {
      // Direct ripple event
      addRipple(message.data);
    }
  }, [addRipple]);

  // Initialize WebSocket
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  // Simulate initial activity for demo
  useEffect(() => {
    const cities = [
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
      { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      { lat: 55.7558, lng: 37.6176, name: 'Moscow' },
      { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' },
      { lat: 19.4326, lng: -99.1332, name: 'Mexico City' }
    ];

    const interval = setInterval(() => {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const rippleEvent: RippleEvent = {
        id: `demo-${Date.now()}-${Math.random()}`,
        lat: city.lat + (Math.random() - 0.5) * 10,
        lng: city.lng + (Math.random() - 0.5) * 10,
        timestamp: new Date(),
        category: ['helping', 'sharing', 'caring', 'supporting', 'encouraging'][Math.floor(Math.random() * 5)],
        intensity: Math.random() * 2 + 1
      };
      addRipple(rippleEvent);
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, [addRipple]);

  // Get ripple color based on category
  const getRippleColor = (category: string) => {
    const colors = {
      helping: '#10B981',
      sharing: '#8B5CF6', 
      caring: '#EC4899',
      supporting: '#3B82F6',
      encouraging: '#F59E0B',
      general: '#6B7280'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(6,17,46,0.95), rgba(14,28,50,0.95))',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(59,130,246,0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌊</span>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #3B82F6, #10B981)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Global Kindness Ripples
          </h3>
          <span style={{ fontSize: '24px' }}>🌍</span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: 'rgba(255,255,255,0.7)', 
          margin: 0,
          marginBottom: '16px'
        }}>
          Watch kindness spread across the world in real-time
        </p>

        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
              {totalRipples}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Ripples Today
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
              {activeRipples.length}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Active Now
            </div>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#EF4444',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* World Map with Ripples */}
      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        <svg
          viewBox="0 0 800 400"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(14,28,50,0.8), rgba(6,17,46,0.9))',
            borderRadius: '12px',
            border: '1px solid rgba(59,130,246,0.3)'
          }}
        >
          {/* Simplified world continents (stylized shapes) */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* Continents (simplified shapes) */}
          <g fill="rgba(99,102,241,0.3)" stroke="rgba(139,92,246,0.5)" strokeWidth="1">
            {/* North America */}
            <path d="M100,80 L200,70 L250,120 L200,180 L120,160 Z" />
            {/* South America */}
            <path d="M180,200 L220,190 L240,260 L200,320 L170,280 Z" />
            {/* Europe */}
            <path d="M350,70 L420,65 L430,110 L390,120 L340,100 Z" />
            {/* Africa */}
            <path d="M360,130 L420,125 L440,220 L400,280 L350,250 Z" />
            {/* Asia */}
            <path d="M450,60 L650,50 L680,150 L600,180 L480,160 Z" />
            {/* Australia */}
            <path d="M580,280 L650,275 L660,310 L620,320 L570,300 Z" />
          </g>

          {/* Grid lines for reference */}
          <g stroke="rgba(59,130,246,0.1)" strokeWidth="0.5">
            {[0,1,2,3,4].map(i => (
              <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} />
            ))}
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="400" />
            ))}
          </g>

          {/* Active Ripples */}
          {activeRipples.map((ripple) => {
            const elapsed = Date.now() - ripple.startTime;
            const progress = elapsed / ripple.duration;
            const scale = Math.min(progress * 3, 2);
            const opacity = Math.max(0, 1 - progress);
            
            return (
              <g key={ripple.id}>
                {/* Main ripple */}
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r={scale * 30}
                  fill="none"
                  stroke={getRippleColor(ripple.category)}
                  strokeWidth="2"
                  opacity={opacity * 0.8}
                  filter="url(#glow)"
                />
                {/* Secondary ripple */}
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r={scale * 20}
                  fill={getRippleColor(ripple.category)}
                  opacity={opacity * 0.3}
                  filter="url(#glow)"
                />
                {/* Center point */}
                <circle
                  cx={ripple.x}
                  cy={ripple.y}
                  r="3"
                  fill={getRippleColor(ripple.category)}
                  opacity={opacity}
                  filter="url(#glow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating particles effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `
            radial-gradient(2px 2px at 20px 30px, rgba(139,92,246,0.4), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(16,185,129,0.3), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(59,130,246,0.4), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(236,72,153,0.3), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(245,158,11,0.4), transparent)
          `,
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: 'rgba(255,255,255,0.9)', 
            margin: '0 0 12px 0' 
          }}>
            Recent Ripples
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div 
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  opacity: 1 - (index * 0.3)
                }}
              >
                <div 
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getRippleColor(activity.category),
                    animation: index === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none'
                  }}
                />
                <span style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'capitalize' 
                }}>
                  {activity.category} act of kindness
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255,255,255,0.5)',
                  marginLeft: 'auto'
                }}>
                  just now
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(5deg); }
          66% { transform: translateY(5px) rotate(-3deg); }
        }
      ` }} />
    </div>
  );
}