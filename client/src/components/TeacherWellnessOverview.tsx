import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';

interface TeacherWellnessOverviewProps {
  onClose: () => void;
  onStartCheck?: () => void;
}

export function TeacherWellnessOverview({ onClose, onStartCheck }: TeacherWellnessOverviewProps) {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          data-testid="close-wellness-overview"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Bell Icon */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Daily Wellness Check-In</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          This simulates the daily notification that students in grades 6-12 would receive.
        </p>
      </div>

      {/* Notification Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Notification Preview</h3>
              <p className="text-blue-800 text-sm">
                "Hi! How are you feeling today? Take a quick 2-minute check-in to help us support you better. 😊"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Benefits */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">This system provides:</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span>Anonymous daily mood tracking for grades 6-12</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span>Proactive mental health monitoring</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span>Early intervention for concerning trends</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span>Aggregated analytics for school administrators</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {onStartCheck && (
          <Button 
            onClick={onStartCheck}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            data-testid="start-daily-check"
          >
            Start Daily Check-In
          </Button>
        )}
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-800"
          data-testid="return-to-dashboard"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}