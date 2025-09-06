import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Shield, Download, Share2, ExternalLink, Calendar, Users, Trophy, CheckCircle } from 'lucide-react';

interface KindnessCertificate {
  id: string;
  title: string;
  description: string;
  achievementType: 'milestone' | 'leadership' | 'innovation' | 'impact' | 'collaboration';
  milestone: {
    category: string;
    threshold: number;
    currentValue: number;
    unit: string;
  };
  issuedDate: string;
  blockchainTxHash: string;
  blockchainNetwork: 'Ethereum' | 'Polygon' | 'EchoDeed Chain';
  verificationUrl: string;
  certificateUrl: string;
  badgeImageUrl: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  rarity: number; // Percentage of users who have achieved this
  stakeholders: string[];
  impactMetrics: {
    peopleHelped: number;
    hoursContributed: number;
    co2Offset: number;
    communityReach: number;
  };
  status: 'pending' | 'verified' | 'revoked';
  shareCount: number;
  endorsements: number;
}

interface CertificateStats {
  totalCertificates: number;
  verifiedCertificates: number;
  pendingVerification: number;
  blockchainTransactions: number;
  uniqueAchievements: number;
  totalEndorsements: number;
}

interface AvailableMilestone {
  id: string;
  title: string;
  description: string;
  type: string;
  threshold: number;
  currentProgress: number;
  unit: string;
  estimatedCompletion: string;
  rarity: number;
  level: string;
  requirements: string[];
}

export function KindnessImpactCertificates() {
  const [selectedTab, setSelectedTab] = useState<'earned' | 'available' | 'blockchain'>('earned');
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch earned certificates
  const { data: certificates, isLoading } = useQuery<KindnessCertificate[]>({
    queryKey: ['/api/certificates/earned'],
    refetchInterval: 30000,
  });

  // Fetch available milestones
  const { data: availableMilestones } = useQuery<AvailableMilestone[]>({
    queryKey: ['/api/certificates/available'],
    refetchInterval: 60000,
  });

  // Fetch certificate stats
  const { data: stats } = useQuery<CertificateStats>({
    queryKey: ['/api/certificates/stats'],
    refetchInterval: 60000,
  });

  // Mint certificate mutation
  const mintCertificate = useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await fetch('/api/certificates/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ milestoneId }),
      });
      if (!response.ok) throw new Error('Failed to mint certificate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates/earned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates/available'] });
    }
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏆</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Loading Blockchain Certificates...</span>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond': return '#E879F9';
      case 'Platinum': return '#A855F7';
      case 'Gold': return '#F59E0B';
      case 'Silver': return '#6B7280';
      default: return '#CD7C2F'; // Bronze
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#22C55E';
      case 'pending': return '#F59E0B';
      default: return '#EF4444'; // revoked
    }
  };

  const getRarityLabel = (rarity: number) => {
    if (rarity <= 1) return 'Ultra Rare';
    if (rarity <= 5) return 'Very Rare';
    if (rarity <= 15) return 'Rare';
    if (rarity <= 35) return 'Uncommon';
    return 'Common';
  };

  const tabs = [
    { id: 'earned', name: 'My Certificates', icon: '🏆', count: certificates?.length || 0 },
    { id: 'available', name: 'Available Milestones', icon: '🎯', count: availableMilestones?.length || 0 },
    { id: 'blockchain', name: 'Blockchain Explorer', icon: '🔗', count: stats?.blockchainTransactions || 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(59,130,246,0.05) 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(168,85,247,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>🏆</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#8B5CF6' }}>
              Kindness Impact Certificates
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Blockchain-verified digital credentials for major kindness achievements
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>
                {stats.totalCertificates}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Earned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#22C55E' }}>
                {stats.verifiedCertificates}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Blockchain Verified</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>
                {stats.blockchainTransactions}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Blockchain TXs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                {stats.totalEndorsements}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Endorsements</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedTab === tab.id ? '#8B5CF6' : 'white',
                color: selectedTab === tab.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              data-testid={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              {tab.name}
              <span style={{ 
                backgroundColor: selectedTab === tab.id ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                color: selectedTab === tab.id ? 'white' : '#6b7280',
                padding: '2px 6px', 
                borderRadius: '10px', 
                fontSize: '12px' 
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Earned Certificates Tab */}
        {selectedTab === 'earned' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Award size={16} style={{ color: '#8B5CF6' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Your Verified Achievements
              </span>
            </div>
            
            <div style={{ padding: '20px' }}>
              {certificates && certificates.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCertificate(selectedCertificate === cert.id ? null : cert.id)}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: selectedCertificate === cert.id ? '#faf5ff' : 'white',
                        borderColor: selectedCertificate === cert.id ? '#8B5CF6' : '#e5e7eb'
                      }}
                      data-testid={`certificate-${cert.id}`}
                    >
                      {/* Certificate Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                              {cert.title}
                            </h3>
                            <span style={{
                              backgroundColor: getLevelColor(cert.level) + '20',
                              color: getLevelColor(cert.level),
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              {cert.level}
                            </span>
                            <span style={{
                              backgroundColor: '#f0f9ff',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {getRarityLabel(cert.rarity)}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                            {cert.description}
                          </p>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span>📅 {new Date(cert.issuedDate).toLocaleDateString()}</span>
                            <span>🔗 {cert.blockchainNetwork}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(cert.status)
                              }}></div>
                              {cert.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${getLevelColor(cert.level)}20 0%, ${getLevelColor(cert.level)}40 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            {cert.level === 'Diamond' ? '💎' : cert.level === 'Platinum' ? '⚡' : cert.level === 'Gold' ? '🥇' : cert.level === 'Silver' ? '🥈' : '🥉'}
                          </div>
                        </div>
                      </div>

                      {/* Impact Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#3B82F6' }}>
                            {cert.impactMetrics.peopleHelped}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>People Helped</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#22C55E' }}>
                            {cert.impactMetrics.hoursContributed}h
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Hours Contributed</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#8B5CF6' }}>
                            {cert.impactMetrics.co2Offset}kg
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>CO2 Offset</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>
                            {cert.endorsements}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Endorsements</div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedCertificate === cert.id && (
                        <div style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          {/* Blockchain Verification */}
                          <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Shield size={14} style={{ color: '#22C55E' }} />
                              Blockchain Verification
                            </h4>
                            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#166534' }}>Transaction Hash: </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                                  {cert.blockchainTxHash}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(cert.verificationUrl, '_blank');
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#22C55E',
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                  }}
                                >
                                  <ExternalLink size={12} />
                                </button>
                              </div>
                              <div>
                                <span style={{ fontWeight: '600', color: '#166534' }}>Network: </span>
                                <span style={{ color: '#6b7280' }}>{cert.blockchainNetwork}</span>
                              </div>
                            </div>
                          </div>

                          {/* Milestone Details */}
                          <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                              🎯 Achievement Milestone
                            </h4>
                            <div style={{ fontSize: '12px', color: '#6b7280', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                              <div><strong>Category:</strong> {cert.milestone.category}</div>
                              <div><strong>Threshold:</strong> {cert.milestone.threshold} {cert.milestone.unit}</div>
                              <div><strong>Your Achievement:</strong> {cert.milestone.currentValue} {cert.milestone.unit}</div>
                              <div><strong>Completion:</strong> {((cert.milestone.currentValue / cert.milestone.threshold) * 100).toFixed(1)}%</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(cert.certificateUrl, '_blank');
                              }}
                              style={{
                                background: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              data-testid={`download-${cert.id}`}
                            >
                              <Download size={12} />
                              Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share functionality would go here
                              }}
                              style={{
                                background: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              data-testid={`share-${cert.id}`}
                            >
                              <Share2 size={12} />
                              Share
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(cert.verificationUrl, '_blank');
                              }}
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Shield size={12} />
                              Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🏆</span>
                  <p>No certificates earned yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Complete kindness milestones to earn blockchain-verified certificates!
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Available Milestones Tab */}
        {selectedTab === 'available' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Trophy size={16} style={{ color: '#F59E0B' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Milestones You Can Achieve
              </span>
            </div>
            
            <div style={{ padding: '20px' }}>
              {availableMilestones && availableMilestones.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {availableMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        background: 'white'
                      }}
                      data-testid={`milestone-${milestone.id}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                              {milestone.title}
                            </h3>
                            <span style={{
                              backgroundColor: getLevelColor(milestone.level) + '20',
                              color: getLevelColor(milestone.level),
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              {milestone.level}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            {milestone.description}
                          </p>
                        </div>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: '3px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `conic-gradient(${getLevelColor(milestone.level)} ${(milestone.currentProgress / milestone.threshold) * 360}deg, #e5e7eb 0deg)`,
                          position: 'relative'
                        }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: getLevelColor(milestone.level)
                          }}>
                            {Math.round((milestone.currentProgress / milestone.threshold) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Details */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                            {milestone.currentProgress} / {milestone.threshold} {milestone.unit}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(100, (milestone.currentProgress / milestone.threshold) * 100)}%`,
                            height: '100%',
                            backgroundColor: getLevelColor(milestone.level),
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                          Requirements:
                        </h4>
                        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.4 }}>
                          {milestone.requirements.slice(0, 3).map((req, index) => (
                            <div key={index}>• {req}</div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          Est. completion: {milestone.estimatedCompletion}
                        </div>
                        {milestone.currentProgress >= milestone.threshold ? (
                          <button
                            onClick={() => mintCertificate.mutate(milestone.id)}
                            disabled={mintCertificate.isPending}
                            style={{
                              background: '#22C55E',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: mintCertificate.isPending ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            data-testid={`mint-${milestone.id}`}
                          >
                            {mintCertificate.isPending ? (
                              <>
                                <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                Minting...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Mint Certificate
                              </>
                            )}
                          </button>
                        ) : (
                          <div style={{
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {milestone.threshold - milestone.currentProgress} {milestone.unit} to go
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🎯</span>
                  <p>All milestones completed!</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Check back later for new achievements to unlock.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Blockchain Explorer Tab */}
        {selectedTab === 'blockchain' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ExternalLink size={16} style={{ color: '#3B82F6' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Blockchain Transaction History
              </span>
            </div>
            
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🔗</span>
              <p style={{ color: '#6b7280' }}>Blockchain explorer integration coming soon!</p>
              <p style={{ fontSize: '14px', marginTop: '8px', color: '#6b7280' }}>
                View all your certificate transactions, verification history, and network statistics.
              </p>
            </div>
          </>
        )}
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
          backgroundColor: '#8B5CF6',
          animation: 'pulse 2s infinite'
        }}></div>
        Blockchain-verified • Tamper-proof credentials
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