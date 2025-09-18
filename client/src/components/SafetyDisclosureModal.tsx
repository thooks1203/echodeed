import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Heart, AlertTriangle, Lock, Users, Phone } from 'lucide-react';

interface SafetyDisclosureModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function SafetyDisclosureModal({
  isOpen,
  onAccept,
  onDecline
}: SafetyDisclosureModalProps) {
  const [hasReadDisclosure, setHasReadDisclosure] = useState(false);
  const [understandsAnonymityLimits, setUnderstandsAnonymityLimits] = useState(false);
  const [agreesToSafetyProtocol, setAgreesToSafetyProtocol] = useState(false);

  const canProceed = hasReadDisclosure && understandsAnonymityLimits && agreesToSafetyProtocol;

  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <DialogTitle className="text-2xl font-bold">Safety & Privacy Disclosure</DialogTitle>
              <p className="text-gray-600 mt-1">Important information about your safety and privacy</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Safety-First Approach */}
          <Alert className="border-blue-200 bg-blue-50">
            <Heart className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your safety is our highest priority.</strong> This platform is designed to protect and support students while respecting your privacy.
            </AlertDescription>
          </Alert>

          {/* Anonymity Protection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Anonymous Support Circle
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Your posts are completely anonymous - no usernames, emails, or identifying information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Only your school community can see your posts (filtered by school)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Licensed school counselors can provide professional support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>No posts are tied to your identity or stored with personal information</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Safety-Limited Anonymity */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Safety-Limited Anonymity
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 mb-3">
                <strong>Important:</strong> While we protect your anonymity, there are rare situations where your safety may require us to act:
              </p>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⚠️</span>
                  <span><strong>Immediate danger:</strong> If your post indicates you may harm yourself or others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⚠️</span>
                  <span><strong>Child abuse:</strong> If your post indicates ongoing abuse or neglect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⚠️</span>
                  <span><strong>Legal requirements:</strong> When mandated reporting laws require professional intervention</span>
                </li>
              </ul>
              <p className="text-sm text-orange-800 mt-3 font-medium">
                In these situations, school counselors may need to contact you directly or notify appropriate authorities to ensure your safety.
              </p>
            </div>
          </div>

          {/* Crisis Detection System */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              AI-Powered Safety Detection
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">🤖</span>
                  <span>Our AI system analyzes posts for safety concerns like self-harm, abuse, or crisis situations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">🚨</span>
                  <span>High-risk posts are immediately reviewed by trained school counselors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">📞</span>
                  <span>Crisis situations trigger immediate access to emergency resources (988 Suicide & Crisis Lifeline)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">❤️</span>
                  <span>The goal is always to connect you with appropriate help and support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Emergency Contact Collection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Emergency Contact (Crisis Situations Only)
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-2">
                <strong>COPPA Safety Exception:</strong> For crisis situations involving immediate danger, we may collect emergency contact information:
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Only collected if AI detects potential self-harm or immediate danger</li>
                <li>• Used solely to contact a trusted adult who can provide immediate support</li>
                <li>• Not stored long-term or used for any other purpose</li>
                <li>• Required by duty-of-care responsibilities to protect minors</li>
              </ul>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Your Agreement</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="read-disclosure"
                  checked={hasReadDisclosure}
                  onCheckedChange={setHasReadDisclosure}
                  data-testid="checkbox-read-disclosure"
                />
                <label htmlFor="read-disclosure" className="text-sm leading-relaxed cursor-pointer">
                  I have read and understood the privacy and safety information above
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="anonymity-limits"
                  checked={understandsAnonymityLimits}
                  onCheckedChange={setUnderstandsAnonymityLimits}
                  data-testid="checkbox-anonymity-limits"
                />
                <label htmlFor="anonymity-limits" className="text-sm leading-relaxed cursor-pointer">
                  I understand that anonymity may have limits in crisis situations for my safety
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="safety-protocol"
                  checked={agreesToSafetyProtocol}
                  onCheckedChange={setAgreesToSafetyProtocol}
                  data-testid="checkbox-safety-protocol"
                />
                <label htmlFor="safety-protocol" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the safety protocols and understand that emergency contacts may be collected for crisis situations
                </label>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Always Available Resources:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>🆘 <strong>Crisis Text Line:</strong> Text HOME to 741741</div>
              <div>📞 <strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</div>
              <div>🏫 <strong>School Counselor:</strong> Visit the counseling office anytime</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onDecline} data-testid="button-decline">
            I Don't Agree
          </Button>
          <Button 
            onClick={onAccept}
            disabled={!canProceed}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-accept"
          >
            I Agree - Continue to Support Circle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}