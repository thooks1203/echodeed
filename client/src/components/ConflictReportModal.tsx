/**
 * REVOLUTIONARY: Anonymous Conflict Reporting Interface
 * World's first AI-powered anonymous conflict resolution system for schools
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Shield, Heart, Users, AlertTriangle } from 'lucide-react';

interface ConflictReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConflictReportModal({ isOpen, onClose }: ConflictReportModalProps) {
  const [step, setStep] = useState<'intro' | 'type' | 'details' | 'location' | 'submit' | 'success'>('intro');
  const [conflictType, setConflictType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [involvedParties, setInvolvedParties] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  
  const queryClient = useQueryClient();

  const submitReport = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch('/api/conflicts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error('Failed to submit report');
      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
    }
  });

  const handleSubmit = () => {
    submitReport.mutate({
      conflictType,
      conflictDescription: description,
      location,
      gradeLevel,
      involvedParties,
      isAnonymous: 1,
      severityLevel: isUrgent ? 'urgent' : 'medium'
    });
  };

  const resetForm = () => {
    setStep('intro');
    setConflictType('');
    setDescription('');
    setLocation('');
    setGradeLevel('');
    setInvolvedParties('');
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
        maxWidth: '400px',
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
          data-testid="close-conflict-report"
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
              <Shield size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              🛡️ Safe Space Reporter
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              This is a completely anonymous and safe way to report conflicts or situations that are bothering you or someone else. 
              Our AI will help find the best solution.
            </p>
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Heart size={16} color="#F59E0B" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
                  100% Anonymous & Confidential
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
                Your identity will never be shared. We're here to help make school safer and happier for everyone.
              </p>
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
              data-testid="start-conflict-report"
            >
              Report a Situation →
            </Button>
          </div>
        )}

        {step === 'type' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              What type of situation are you reporting?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'peer_conflict', label: '👥 Conflict Between Students', desc: 'Disagreement or argument between classmates' },
                { id: 'exclusion', label: '😔 Someone Being Left Out', desc: 'Not being included in activities or groups' },
                { id: 'verbal_disagreement', label: '💬 Hurtful Words', desc: 'Name-calling, teasing, or mean comments' },
                { id: 'physical_incident', label: '🚨 Physical Situation', desc: 'Pushing, hitting, or physical conflict' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setConflictType(type.id);
                    if (type.id === 'physical_incident') setIsUrgent(true);
                    setStep('details');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#8B5CF6';
                    (e.target as HTMLElement).style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                    (e.target as HTMLElement).style.backgroundColor = 'white';
                  }}
                  data-testid={`conflict-type-${type.id}`}
                >
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Tell us what happened
            </h3>
            {isUrgent && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #F87171',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={20} color="#DC2626" />
                <span style={{ fontSize: '14px', color: '#DC2626', fontWeight: '600' }}>
                  Urgent situation detected - We'll prioritize this report
                </span>
              </div>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened in your own words. The more details you provide, the better we can help..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px'
              }}
              data-testid="conflict-description"
            />
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
                onClick={() => setStep('location')}
                disabled={description.length < 10}
                style={{
                  flex: 2,
                  background: description.length >= 10 ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : '#9CA3AF',
                  color: 'white'
                }}
                data-testid="continue-to-location"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Where did this happen?
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}
                data-testid="conflict-location"
              >
                <option value="">Select location...</option>
                <option value="classroom">Classroom</option>
                <option value="playground">Playground</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="hallway">Hallway</option>
                <option value="bathroom">Bathroom</option>
                <option value="library">Library</option>
                <option value="gym">Gym</option>
                <option value="bus">School Bus</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}
                data-testid="conflict-grade"
              >
                <option value="">Select grade...</option>
                <option value="K">Kindergarten</option>
                <option value="1">1st Grade</option>
                <option value="2">2nd Grade</option>
                <option value="3">3rd Grade</option>
                <option value="4">4th Grade</option>
                <option value="5">5th Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Who was involved? (No names needed)
              </label>
              <input
                type="text"
                value={involvedParties}
                onChange={(e) => setInvolvedParties(e.target.value)}
                placeholder="e.g., 'Two students in my class' or 'A group of older kids'"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                data-testid="involved-parties"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setStep('details')}
                variant="outline"
                style={{ flex: 1 }}
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep('submit')}
                disabled={!location || !gradeLevel || !involvedParties}
                style={{
                  flex: 2,
                  background: (location && gradeLevel && involvedParties) ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : '#9CA3AF',
                  color: 'white'
                }}
                data-testid="continue-to-submit"
              >
                Review →
              </Button>
            </div>
          </div>
        )}

        {step === 'submit' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Review Your Report
            </h3>
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Type:</strong> {conflictType.replace('_', ' ')}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Location:</strong> {location}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Grade:</strong> {gradeLevel}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Description:</strong> {description.substring(0, 100)}...
              </div>
            </div>
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={16} color="#059669" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                  AI-Powered Resolution
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>
                Our AI will analyze this situation and provide immediate guidance for resolution. 
                {isUrgent && " Because this is urgent, a teacher will be notified right away."}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setStep('location')}
                variant="outline"
                style={{ flex: 1 }}
              >
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitReport.isPending}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white'
                }}
                data-testid="submit-conflict-report"
              >
                {submitReport.isPending ? 'Submitting...' : 'Submit Report 🛡️'}
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
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              Thank You! 💙
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              Your report has been submitted successfully. Our AI is already analyzing the situation and will provide 
              guidance for resolution. You've taken a brave step to make school safer for everyone.
            </p>
            <div style={{
              background: '#F0F9FF',
              border: '1px solid #0EA5E9',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#0369A1', margin: 0 }}>
                <strong>What happens next:</strong> Our AI will analyze this situation and provide immediate guidance. 
                {isUrgent && " A teacher has been alerted and will follow up soon. "}
                Remember, you can always talk to a trusted adult if you need more help.
              </p>
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
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}