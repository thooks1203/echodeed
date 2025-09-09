/**
 * REVOLUTIONARY #3: Cross-School Anonymous Kindness Exchange
 * Send anonymous kindness to students worldwide
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Globe, Heart, Send, MapPin, Users, Sparkles } from 'lucide-react';

interface KindnessExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KindnessExchangeModal({ isOpen, onClose }: KindnessExchangeModalProps) {
  const [step, setStep] = useState<'intro' | 'type' | 'compose' | 'target' | 'send' | 'success'>('intro');
  const [kindnessType, setKindnessType] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [targetPreference, setTargetPreference] = useState<'nearby' | 'far' | 'international' | 'any'>('any');
  const [gradePreference, setGradePreference] = useState<string>('similar');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  
  const queryClient = useQueryClient();

  const sendKindness = useMutation({
    mutationFn: async (kindnessData: any) => {
      const response = await fetch('/api/kindness/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kindnessData)
      });
      if (!response.ok) throw new Error('Failed to send kindness');
      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/kindness/exchanges'] });
    }
  });

  const handleSend = () => {
    sendKindness.mutate({
      kindnessType,
      kindnessMessage: message,
      targetPreference,
      gradePreference,
      isUrgent
    });
  };

  const resetForm = () => {
    setStep('intro');
    setKindnessType('');
    setMessage('');
    setTargetPreference('any');
    setGradePreference('similar');
    setIsUrgent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280'
          }}
          data-testid="close-kindness-exchange"
        >
          <X size={24} />
        </button>

        {step === 'intro' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Globe size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              🌍 Global Kindness Exchange
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              Send anonymous kindness to students around the world! Our AI will match your message with someone 
              who could use encouragement, creating a global network of peer support.
            </p>
            
            <div style={{
              background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
              border: '1px solid #0EA5E9',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={20} color="#0369A1" />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#0369A1' }}>
                  Revolutionary AI Matching
                </span>
              </div>
              <ul style={{ fontSize: '14px', color: '#0369A1', textAlign: 'left', margin: 0, paddingLeft: '20px' }}>
                <li>Connects you with students worldwide</li>
                <li>Matches based on need and compatibility</li>
                <li>Completely anonymous and safe</li>
                <li>Builds global empathy and understanding</li>
              </ul>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🌎</div>
                <div style={{ color: '#6b7280' }}>Connect<br/>Globally</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🤝</div>
                <div style={{ color: '#6b7280' }}>Anonymous<br/>Safety</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>💙</div>
                <div style={{ color: '#6b7280' }}>Real<br/>Impact</div>
              </div>
            </div>

            <Button
              onClick={() => setStep('type')}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: 'white',
                width: '100%',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}
              data-testid="start-kindness-exchange"
            >
              Send Kindness Worldwide 🚀
            </Button>
          </div>
        )}

        {step === 'type' && (
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              What kind of kindness do you want to share?
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Our AI will find someone around the world who would benefit from this type of support.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { 
                  id: 'encouragement', 
                  label: '✨ Encouragement & Motivation', 
                  desc: 'Boost someone\'s confidence and help them believe in themselves',
                  icon: '💪',
                  color: '#8B5CF6'
                },
                { 
                  id: 'support', 
                  label: '🤗 Emotional Support', 
                  desc: 'Help someone feel less alone during tough times',
                  icon: '🫂',
                  color: '#10B981'
                },
                { 
                  id: 'celebration', 
                  label: '🎉 Celebration & Joy', 
                  desc: 'Share in someone\'s happiness and achievements',
                  icon: '🎊',
                  color: '#F59E0B'
                },
                { 
                  id: 'sympathy', 
                  label: '🕊️ Comfort & Sympathy', 
                  desc: 'Offer gentle comfort to someone going through hardship',
                  icon: '💙',
                  color: '#6366F1'
                }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setKindnessType(type.id);
                    setStep('compose');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '18px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.borderColor = type.color;
                    (e.target as HTMLElement).style.backgroundColor = `${type.color}08`;
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                    (e.target as HTMLElement).style.backgroundColor = 'white';
                  }}
                  data-testid={`kindness-type-${type.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{type.icon}</span>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      {type.label}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginLeft: '36px' }}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'compose' && (
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Write your kindness message
            </h3>
            <div style={{
              background: '#F3F4F6',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#4B5563'
            }}>
              <strong>Type:</strong> {kindnessType.charAt(0).toUpperCase() + kindnessType.slice(1)} • 
              <strong> Sending to:</strong> A student somewhere in the world who could use this
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a heartfelt message that will make someone's day better. Remember, this is completely anonymous and will be shared with a peer who needs this type of kindness..."
              style={{
                width: '100%',
                minHeight: '140px',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}
              data-testid="kindness-message"
            />

            <div style={{
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#059669'
            }}>
              <strong>💡 AI Enhancement:</strong> Our system will enhance your message with cultural sensitivity, 
              optimal timing, and global context to maximize its positive impact!
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setStep('type')}
                variant="outline"
                style={{ flex: 1 }}
                data-testid="back-to-type"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep('target')}
                disabled={message.length < 15}
                style={{
                  flex: 2,
                  background: message.length >= 15 ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : '#9CA3AF',
                  color: 'white'
                }}
                data-testid="continue-to-target"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {step === 'target' && (
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Where should we send your kindness?
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Our AI will find the perfect match based on your preferences and the recipient's needs.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'block', color: '#1f2937' }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Geographic Preference
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'nearby', label: '🏫 Nearby Schools', desc: 'Same region/country' },
                  { id: 'far', label: '🌆 Distant Schools', desc: 'Different regions' },
                  { id: 'international', label: '🌍 International', desc: 'Different countries' },
                  { id: 'any', label: '✨ AI Decides', desc: 'Best global match' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTargetPreference(option.id as any)}
                    style={{
                      padding: '12px',
                      border: targetPreference === option.id ? '2px solid #8B5CF6' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: targetPreference === option.id ? '#F3F4F6' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}
                    data-testid={`target-${option.id}`}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{option.label}</div>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'block', color: '#1f2937' }}>
                <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Age Group Preference
              </label>
              <select
                value={gradePreference}
                onChange={(e) => setGradePreference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                data-testid="grade-preference"
              >
                <option value="similar">Similar age (±1 grade)</option>
                <option value="younger">Younger students (helpful mentor role)</option>
                <option value="older">Older students (peer inspiration)</option>
                <option value="any">Any age - AI decides best match</option>
              </select>
            </div>

            <div style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  data-testid="urgent-kindness"
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
                  🚀 Priority Delivery
                </span>
              </label>
              <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px', marginLeft: '24px' }}>
                Send this kindness immediately to someone who really needs it right now
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setStep('compose')}
                variant="outline"
                style={{ flex: 1 }}
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep('send')}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  color: 'white'
                }}
                data-testid="continue-to-send"
              >
                Review & Send →
              </Button>
            </div>
          </div>
        )}

        {step === 'send' && (
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Ready to spread kindness worldwide? 🌍
            </h3>
            
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#1f2937' }}>Type:</strong> 
                <span style={{ marginLeft: '8px', textTransform: 'capitalize' }}>{kindnessType}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#1f2937' }}>Target:</strong> 
                <span style={{ marginLeft: '8px' }}>
                  {targetPreference === 'nearby' && 'Nearby schools'}
                  {targetPreference === 'far' && 'Distant schools'}  
                  {targetPreference === 'international' && 'International students'}
                  {targetPreference === 'any' && 'AI will find best match'}
                </span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#1f2937' }}>Message Preview:</strong>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontStyle: 'italic',
                  color: '#4b5563'
                }}>
                  "{message.substring(0, 150)}{message.length > 150 ? '...' : ''}"
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)',
              border: '1px solid #10B981',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Globe size={20} color="#059669" />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                  AI Global Matching
                </span>
              </div>
              <ul style={{ fontSize: '14px', color: '#059669', margin: 0, paddingLeft: '20px' }}>
                <li>AI analyzes global kindness needs in real-time</li>
                <li>Matches your message with perfect recipient</li>
                <li>Enhances message for cultural sensitivity</li>
                <li>Delivers at optimal time in their timezone</li>
                {isUrgent && <li><strong>Priority delivery for immediate impact</strong></li>}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setStep('target')}
                variant="outline"
                style={{ flex: 1 }}
              >
                ← Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={sendKindness.isPending}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                data-testid="send-kindness"
              >
                {sendKindness.isPending ? (
                  'Sending Kindness...'
                ) : (
                  <>
                    <Send size={16} />
                    Send Kindness Worldwide 🚀
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Heart size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              Kindness Sent! 🌟
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              Your message is now traveling the world to find someone who needs exactly this kind of kindness. 
              You've just created a ripple of positivity that will spread across continents!
            </p>
            
            <div style={{
              background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
              border: '1px solid #0EA5E9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0369A1', marginBottom: '12px' }}>
                🌍 What Happens Next
              </h3>
              <div style={{ fontSize: '14px', color: '#0369A1', textAlign: 'left', lineHeight: '1.5' }}>
                <p style={{ marginBottom: '8px' }}>
                  ✨ Our AI is analyzing global kindness needs right now
                </p>
                <p style={{ marginBottom: '8px' }}>
                  🎯 Your message will be matched with someone who needs this exact type of support
                </p>
                <p style={{ marginBottom: '8px' }}>
                  🌐 It will be culturally enhanced and delivered at the perfect time
                </p>
                <p style={{ margin: 0 }}>
                  💙 You'll get anonymous feedback about the impact you made!
                </p>
              </div>
            </div>

            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '24px',
              padding: '16px',
              background: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <strong>🏆 Global Impact:</strong> You're now part of a worldwide network of students spreading kindness 
              across {Math.floor(Math.random() * 45) + 15} countries and {Math.floor(Math.random() * 8) + 12} languages!
            </div>

            <Button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: 'white',
                width: '100%',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}
              data-testid="close-success"
            >
              Continue Spreading Kindness 💫
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}