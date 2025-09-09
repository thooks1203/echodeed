import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Moon, Users, GraduationCap, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WellnessCheckInProps {
  onComplete?: () => void;
  gradeLevel: "6" | "7" | "8";
  schoolId: string;
}

const moodOptions = [
  { emoji: "😄", label: "Great", value: "great", score: 5, color: "text-green-500" },
  { emoji: "😊", label: "Good", value: "good", score: 4, color: "text-blue-500" },
  { emoji: "😐", label: "Okay", value: "okay", score: 3, color: "text-yellow-500" },
  { emoji: "😔", label: "Struggling", value: "struggling", score: 2, color: "text-orange-500" },
  { emoji: "😢", label: "Terrible", value: "terrible", score: 1, color: "text-red-500" },
];

export function WellnessCheckIn({ onComplete, gradeLevel, schoolId }: WellnessCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [socialConnection, setSocialConnection] = useState<number | null>(null);
  const [academicPressure, setAcademicPressure] = useState<number | null>(null);
  const [homeEnvironment, setHomeEnvironment] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/wellness-checkin", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      onComplete?.();
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) return;

    const checkInData = {
      schoolId,
      gradeLevel,
      mood: selectedMood.value,
      moodScore: selectedMood.score,
      selectedEmoji: selectedMood.emoji,
      stressLevel,
      sleepQuality,
      socialConnection,
      academicPressure,
      homeEnvironment,
      notes: notes.trim() || null,
    };

    checkInMutation.mutate(checkInData);
  };

  const renderStarRating = (
    label: string,
    icon: React.ReactNode,
    value: number | null,
    setValue: (value: number) => void,
    lowLabel: string,
    highLabel: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{lowLabel}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(star)}
              className={`w-6 h-6 rounded-full border-2 transition-colors ${
                value && star <= value
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{highLabel}</span>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Daily Check-In
        </CardTitle>
        <p className="text-sm text-gray-600">
          How are you feeling today? Your responses are anonymous and help us support you better.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">How are you feeling today?</h3>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedMood?.value === mood.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-medium">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ratings */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Quick Questions (Optional)</h3>
          
          {renderStarRating(
            "Stress Level",
            <MessageCircle className="w-4 h-4 text-orange-500" />,
            stressLevel,
            setStressLevel,
            "No stress",
            "Very stressed"
          )}

          {renderStarRating(
            "Sleep Quality",
            <Moon className="w-4 h-4 text-purple-500" />,
            sleepQuality,
            setSleepQuality,
            "Terrible",
            "Excellent"
          )}

          {renderStarRating(
            "Social Connection",
            <Users className="w-4 h-4 text-green-500" />,
            socialConnection,
            setSocialConnection,
            "Isolated",
            "Very connected"
          )}

          {renderStarRating(
            "Academic Pressure",
            <GraduationCap className="w-4 h-4 text-blue-500" />,
            academicPressure,
            setAcademicPressure,
            "None",
            "Overwhelming"
          )}

          {renderStarRating(
            "Home Environment",
            <Home className="w-4 h-4 text-indigo-500" />,
            homeEnvironment,
            setHomeEnvironment,
            "Difficult",
            "Very supportive"
          )}
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <label className="font-medium text-sm">Anything else on your mind? (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="You can share anything that's bothering you or making you happy..."
            className="min-h-20 text-sm"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">{notes.length}/500</div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || checkInMutation.isPending}
          className="w-full"
          data-testid="submit-wellness-checkin"
        >
          {checkInMutation.isPending ? "Submitting..." : "Submit Check-In"}
        </Button>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Your responses are anonymous and help school counselors understand how students are feeling overall.
        </div>
      </CardContent>
    </Card>
  );
}