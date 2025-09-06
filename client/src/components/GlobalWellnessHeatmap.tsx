import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WellnessDataPoint {
  id: string;
  department: string;
  teamSize: number;
  averageMood: number; // 1-10 scale
  stressLevel: number; // 1-10 scale  
  engagementScore: number; // 1-10 scale
  kindnessActivity: number; // acts per day
  location: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface HeatmapStats {
  totalDepartments: number;
  averageWellness: number;
  criticalDepartments: number;
  improvingTrends: number;
  totalEmployees: number;
}

export function GlobalWellnessHeatmap() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch real-time heatmap data
  const { data: heatmapData, isLoading } = useQuery<WellnessDataPoint[]>({
    queryKey: ['/api/wellness/heatmap', selectedTimeRange],
    refetchInterval: 10000, // Update every 10 seconds for real-time experience
  });

  const { data: stats } = useQuery<HeatmapStats>({
    queryKey: ['/api/wellness/heatmap-stats'],
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🗺️</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Loading Global Wellness Heatmap...</span>
        </div>
      </div>
    );
  }

  const getWellnessColor = (mood: number, stress: number) => {
    const wellness = (mood * 0.6) + ((10 - stress) * 0.4); // Combined wellness score
    if (wellness >= 8) return '#10B981'; // Green - excellent
    if (wellness >= 6.5) return '#F59E0B'; // Yellow - good
    if (wellness >= 5) return '#EF4444'; // Orange - concern
    return '#DC2626'; // Red - critical
  };

  const getRiskBadge = (level: string) => {
    const colors = {
      low: { bg: '#D1FAE5', text: '#065F46', icon: '✅' },
      medium: { bg: '#FEF3C7', text: '#92400E', icon: '⚠️' },
      high: { bg: '#FEE2E2', text: '#991B1B', icon: '🚨' }
    };
    const color = colors[level as keyof typeof colors];
    
    return (
      <span style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {color.icon} {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(16,185,129,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>🗺️</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#10B981' }}>
              Global Wellness Heatmap
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Real-time anonymous mood visualization across departments
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedTimeRange === range ? '#10B981' : 'transparent',
                color: selectedTimeRange === range ? 'white' : '#6b7280'
              }}
              data-testid={`time-range-${range}`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
              {stats.totalDepartments}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Departments</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
              {stats.averageWellness.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg Wellness Score</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>
              {stats.criticalDepartments}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Need Attention</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
              {stats.improvingTrends}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Improving Teams</div>
          </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: '#f9fafb', 
          padding: '16px', 
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '14px',
          color: '#374151'
        }}>
          🏢 Department Wellness Overview
        </div>
        
        <div style={{ padding: '20px' }}>
          {heatmapData && heatmapData.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {heatmapData.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
                  style={{
                    background: selectedDepartment === dept.id ? '#f0f9ff' : 'white',
                    border: `2px solid ${selectedDepartment === dept.id ? '#3B82F6' : getWellnessColor(dept.averageMood, dept.stressLevel)}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  data-testid={`department-${dept.department.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                        {dept.department}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                        📍 {dept.location} • 👥 {dept.teamSize} people
                      </p>
                    </div>
                    {getRiskBadge(dept.riskLevel)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: getWellnessColor(dept.averageMood, dept.stressLevel) }}>
                        {dept.averageMood.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>😊 Mood</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: dept.stressLevel > 7 ? '#EF4444' : '#10B981' }}>
                        {dept.stressLevel.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>😰 Stress</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6' }}>
                        {dept.engagementScore.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>⚡ Engagement</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#8B5CF6' }}>
                        {dept.kindnessActivity}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>💜 Kindness</div>
                    </div>
                  </div>

                  {selectedDepartment === dept.id && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        📊 Detailed Insights
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                        <div>• Last updated: {new Date(dept.timestamp).toLocaleString()}</div>
                        <div>• Wellness trend: {dept.averageMood >= 7 ? '📈 Improving' : dept.averageMood >= 5 ? '➡️ Stable' : '📉 Declining'}</div>
                        <div>• Recommended actions: {dept.riskLevel === 'high' ? 'Immediate intervention needed' : dept.riskLevel === 'medium' ? 'Monitor closely' : 'Maintain current practices'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🗺️</span>
              <p>No wellness data available yet.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Data will appear as employees share their wellness status anonymously.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time indicator */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          animation: 'pulse 2s infinite'
        }}></div>
        Live data • Updates every 10 seconds
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `
      }} />
    </div>
  );
}