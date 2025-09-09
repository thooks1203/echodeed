import { useState } from "react";
import { WellnessCheckIn } from "@/components/WellnessCheckIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { Link } from "wouter";

export default function WellnessCheckInPage() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Demo values for testing
  const demoSchoolId = "burlington-nc-middle";
  const demoGradeLevel = "7" as const;

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Your check-in has been submitted anonymously. Your responses help us create a better school environment for everyone.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCompleted(false);
                  setShowCheckIn(false);
                }}
                className="w-full"
              >
                Take Another Check-In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCheckIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => setShowCheckIn(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <WellnessCheckIn
            gradeLevel={demoGradeLevel}
            schoolId={demoSchoolId}
            onComplete={() => setCompleted(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🔔</div>
          <CardTitle className="text-xl">Daily Wellness Check-In</CardTitle>
          <p className="text-sm text-gray-600">
            This simulates the daily notification that students in grades 6-8 would receive.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Notification Preview</h3>
                <p className="text-sm text-blue-700 mt-1">
                  "Hi! How are you feeling today? Take a quick 2-minute check-in to help us support you better. 😊"
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">This system provides:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Anonymous daily mood tracking for grades 6-8</li>
              <li>• Proactive mental health monitoring</li>
              <li>• Early intervention for concerning trends</li>
              <li>• Aggregated analytics for school administrators</li>
            </ul>
          </div>

          <Button 
            onClick={() => setShowCheckIn(true)}
            className="w-full"
            data-testid="start-wellness-checkin"
          >
            Start Daily Check-In
          </Button>

          <div className="text-center">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}