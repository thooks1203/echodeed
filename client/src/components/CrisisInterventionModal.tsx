import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, MessageSquare, Shield, Heart, AlertTriangle, Clock, Users } from 'lucide-react';

interface EmergencyResource {
  title: string;
  description: string;
  contactInfo: string;
  category: 'suicide' | 'abuse' | 'mental_health' | 'crisis' | 'local';
  isPriority: boolean;
  availableHours: string;
}

interface CrisisInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  safetyLevel: 'Crisis' | 'High_Risk' | 'Sensitive' | 'Safe';
  emergencyResources: EmergencyResource[];
  showEmergencyContactForm?: boolean;
  onEmergencyContactSubmit?: (contact: any) => void;
}

export function CrisisInterventionModal({
  isOpen,
  onClose,
  safetyLevel,
  emergencyResources,
  showEmergencyContactForm = false,
  onEmergencyContactSubmit
}: CrisisInterventionModalProps) {
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: 'parent'
  });
  const [hasCalledHelp, setHasCalledHelp] = useState(false);

  const getSafetyIcon = () => {
    switch (safetyLevel) {
      case 'Crisis': return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'High_Risk': return <Shield className="w-8 h-8 text-orange-500" />;
      case 'Sensitive': return <Heart className="w-8 h-8 text-yellow-500" />;
      default: return <Heart className="w-8 h-8 text-green-500" />;
    }
  };

  const getSafetyMessage = () => {
    switch (safetyLevel) {
      case 'Crisis':
        return {
          title: "Immediate Help Available",
          message: "We're concerned about your safety. Please reach out to one of these resources right now - you don't have to face this alone.",
          urgency: "urgent"
        };
      case 'High_Risk':
        return {
          title: "Support Resources",
          message: "It sounds like you're going through something difficult. These resources can provide professional support.",
          urgency: "high"
        };
      case 'Sensitive':
        return {
          title: "You're Not Alone",
          message: "Thank you for sharing. Here are some resources that might help during challenging times.",
          urgency: "medium"
        };
      default:
        return {
          title: "Resources Available",
          message: "Here are some helpful resources for support and wellness.",
          urgency: "low"
        };
    }
  };

  const handleResourceClick = (resource: EmergencyResource) => {
    if (resource.category === 'suicide' || resource.category === 'crisis') {
      setHasCalledHelp(true);
    }
  };

  const handleEmergencyContactSubmit = () => {
    if (onEmergencyContactSubmit) {
      onEmergencyContactSubmit(emergencyContact);
    }
    onClose();
  };

  const safetyMsg = getSafetyMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            {getSafetyIcon()}
            <div>
              <DialogTitle className="text-2xl font-bold">{safetyMsg.title}</DialogTitle>
              <p className="text-gray-600 mt-1">{safetyMsg.message}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Crisis-level urgent notice */}
        {safetyLevel === 'Crisis' && (
          <Alert className="border-red-200 bg-red-50 mb-6" data-testid="crisis-urgent-alert">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              <strong>Your safety is our priority.</strong> If you're in immediate danger, call 911 or go to your nearest emergency room.
            </AlertDescription>
          </Alert>
        )}

        {/* Emergency Resources */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Immediate Help Available
          </h3>
          
          {emergencyResources.map((resource, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                resource.isPriority 
                  ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => handleResourceClick(resource)}
              data-testid={`resource-${resource.category}-${index}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                    {resource.isPriority && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{resource.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">{resource.contactInfo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.availableHours}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {resource.category === 'suicide' && (
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${resource.contactInfo.replace(/[^\d]/g, '')}`);
                      }}
                      data-testid={`call-button-${index}`}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call Now
                    </Button>
                  )}
                  {resource.contactInfo.includes('text') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`sms:${resource.contactInfo.match(/\d+/)?.[0] || ''}`);
                      }}
                      data-testid={`text-button-${index}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contact Collection (COPPA Safety Exception) */}
        {showEmergencyContactForm && safetyLevel === 'Crisis' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Emergency Contact (Required for Your Safety)
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>COPPA Safety Exception:</strong> Due to safety concerns, we may need to contact a trusted adult if you're in immediate danger. This is only used for your protection.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Parent/Guardian name"
                  data-testid="input-emergency-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  data-testid="input-emergency-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={emergencyContact.relation}
                  onChange={(e) => setEmergencyContact({...emergencyContact, relation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="select-emergency-relation"
                >
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="family">Family Member</option>
                  <option value="other">Other Trusted Adult</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          {hasCalledHelp && (
            <div className="flex items-center gap-2 text-green-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Thank you for reaching out for help</span>
            </div>
          )}
          
          <div className="flex gap-3 ml-auto">
            {showEmergencyContactForm && safetyLevel === 'Crisis' ? (
              <>
                <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  onClick={handleEmergencyContactSubmit}
                  disabled={!emergencyContact.name || !emergencyContact.phone}
                  data-testid="button-submit-emergency-contact"
                >
                  Submit Emergency Contact
                </Button>
              </>
            ) : (
              <Button onClick={onClose} data-testid="button-close">
                {hasCalledHelp ? 'I Got Help' : 'Close'}
              </Button>
            )}
          </div>
        </div>

        {/* Follow-up message for crisis situations */}
        {safetyLevel === 'Crisis' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Remember:</strong> You matter, and this feeling is temporary. Professional counselors are trained to help with exactly what you're going through.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}