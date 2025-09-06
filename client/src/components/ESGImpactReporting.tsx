import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TrendingUp, Download, FileText, BarChart3, Globe, Users, Award, Calendar } from 'lucide-react';

interface ESGMetrics {
  environmental: {
    carbonOffset: number; // kg CO2 equivalent
    sustainabilityProjects: number;
    greenInitiatives: number;
    wasteReduction: number; // percentage
  };
  social: {
    volunteerHours: number;
    communityImpact: number; // people reached
    diversityPrograms: number;
    wellnessParticipation: number; // percentage
    employeeEngagement: number; // 1-10 scale
  };
  governance: {
    ethicalPracticesScore: number; // 1-100 scale
    transparencyRating: number; // 1-10 scale
    complianceRate: number; // percentage
    stakeholderSatisfaction: number; // percentage
  };
}

interface ESGReport {
  id: string;
  title: string;
  period: string;
  generatedDate: string;
  status: 'draft' | 'final' | 'submitted';
  metrics: ESGMetrics;
  totalScore: number;
  industryRanking: number;
  improvementAreas: string[];
  achievements: string[];
  downloadUrl?: string;
}

interface ESGTrend {
  month: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export function ESGImpactReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Fetch ESG reports
  const { data: reports, isLoading } = useQuery<ESGReport[]>({
    queryKey: ['/api/esg/reports', selectedPeriod],
    refetchInterval: 60000, // Refresh every minute for real-time data
  });

  // Fetch ESG trends
  const { data: trends } = useQuery<ESGTrend[]>({
    queryKey: ['/api/esg/trends'],
    refetchInterval: 60000,
  });

  // Generate report mutation
  const generateReport = useMutation({
    mutationFn: async (period: string) => {
      const response = await fetch('/api/esg/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ period }),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Loading ESG Impact Reports...</span>
        </div>
      </div>
    );
  }

  const getESGScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E'; // Green - excellent
    if (score >= 60) return '#EAB308'; // Yellow - good
    if (score >= 40) return '#F97316'; // Orange - needs improvement
    return '#EF4444'; // Red - poor
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const periods = [
    { id: 'monthly', name: 'Monthly', icon: '📅' },
    { id: 'quarterly', name: 'Quarterly', icon: '📊' },
    { id: 'annual', name: 'Annual', icon: '📈' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(59,130,246,0.05) 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(34,197,94,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>📊</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#22C55E' }}>
              ESG Impact Integration
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Auto-generated Environmental, Social & Governance compliance reports from kindness data
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedPeriod === period.id ? '#22C55E' : 'white',
                color: selectedPeriod === period.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              data-testid={`period-${period.id}`}
            >
              <span>{period.icon}</span>
              {period.name}
            </button>
          ))}
        </div>

        {/* Generate Report Button */}
        <button
          onClick={() => generateReport.mutate(selectedPeriod)}
          disabled={generateReport.isPending}
          style={{
            background: '#22C55E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: generateReport.isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
          data-testid="generate-report-button"
        >
          {generateReport.isPending ? (
            <>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Generating...
            </>
          ) : (
            <>
              <FileText size={16} />
              Generate {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
            </>
          )}
        </button>
      </div>

      {/* ESG Score Overview */}
      {trends && trends.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={20} style={{ color: '#22C55E' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
              ESG Performance Trends
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                <Globe size={16} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>Environmental</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#22C55E' }}>
                {trends[trends.length - 1]?.environmentalScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Score</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                <Users size={16} style={{ color: '#3B82F6' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>Social</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
                {trends[trends.length - 1]?.socialScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Score</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#faf5ff', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={16} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b21a8' }}>Governance</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
                {trends[trends.length - 1]?.governanceScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Score</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                <BarChart3 size={16} style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Overall ESG</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                {trends[trends.length - 1]?.overallScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
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
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FileText size={16} style={{ color: '#22C55E' }} />
          ESG Impact Reports
        </div>
        
        <div style={{ padding: '20px' }}>
          {reports && reports.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedReport === report.id ? '#f0fdf4' : 'white',
                    borderColor: selectedReport === report.id ? '#22C55E' : '#e5e7eb'
                  }}
                  data-testid={`report-${report.id}`}
                >
                  {/* Report Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                        {report.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                        📅 {report.period} • Generated: {new Date(report.generatedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        backgroundColor: report.status === 'final' ? '#dcfce7' : report.status === 'submitted' ? '#dbeafe' : '#fef3c7',
                        color: report.status === 'final' ? '#166534' : report.status === 'submitted' ? '#1e40af' : '#92400e',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {report.status.toUpperCase()}
                      </span>
                      <div style={{
                        backgroundColor: getESGScoreColor(report.totalScore) + '20',
                        color: getESGScoreColor(report.totalScore),
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {report.totalScore}/100
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#22C55E' }}>
                        {report.metrics.environmental.carbonOffset}kg
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>CO2 Offset</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#3B82F6' }}>
                        {report.metrics.social.volunteerHours}h
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Volunteer Hours</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#8B5CF6' }}>
                        #{report.industryRanking}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Industry Rank</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>
                        {report.metrics.social.communityImpact}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>People Reached</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedReport === report.id && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      {/* Detailed Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        {/* Environmental */}
                        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={16} />
                            Environmental Impact
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                            <div>• {report.metrics.environmental.sustainabilityProjects} sustainability projects</div>
                            <div>• {report.metrics.environmental.greenInitiatives} green initiatives launched</div>
                            <div>• {report.metrics.environmental.wasteReduction}% waste reduction achieved</div>
                          </div>
                        </div>

                        {/* Social */}
                        <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} />
                            Social Impact
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                            <div>• {report.metrics.social.diversityPrograms} diversity programs active</div>
                            <div>• {report.metrics.social.wellnessParticipation}% employee wellness participation</div>
                            <div>• {report.metrics.social.employeeEngagement}/10 engagement score</div>
                          </div>
                        </div>

                        {/* Governance */}
                        <div style={{ background: '#faf5ff', padding: '16px', borderRadius: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b21a8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award size={16} />
                            Governance Excellence
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                            <div>• {report.metrics.governance.ethicalPracticesScore}/100 ethics score</div>
                            <div>• {report.metrics.governance.transparencyRating}/10 transparency rating</div>
                            <div>• {report.metrics.governance.complianceRate}% compliance rate</div>
                          </div>
                        </div>
                      </div>

                      {/* Achievements & Improvements */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                            🏆 Key Achievements
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                            {report.achievements.slice(0, 3).map((achievement, index) => (
                              <div key={index}>• {achievement}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                            📈 Improvement Areas
                          </h4>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                            {report.improvementAreas.slice(0, 3).map((area, index) => (
                              <div key={index}>• {area}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        {report.downloadUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(report.downloadUrl, '_blank');
                            }}
                            style={{
                              background: '#3B82F6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            data-testid={`download-${report.id}`}
                          >
                            <Download size={14} />
                            Download PDF
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Share functionality would go here
                          }}
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          data-testid={`share-${report.id}`}
                        >
                          Share Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📊</span>
              <p>No ESG reports available yet.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Generate your first report to start tracking your organization's impact.
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
          backgroundColor: '#22C55E',
          animation: 'pulse 2s infinite'
        }}></div>
        Live ESG tracking • Auto-generated from kindness data
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}