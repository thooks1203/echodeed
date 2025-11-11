import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StudentNotificationPreferences {
  userId: string;
  emailNotificationsEnabled: boolean;
  dailyDigestTime: string;
  milestoneDigestTime: string;
  lastTokenMilestoneNotified: number;
  lastStreakMilestoneNotified: number;
}

export function StudentNotificationPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<StudentNotificationPreferences>({
    queryKey: ['/api/student-notifications/preferences'],
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [dailyDigestTime, setDailyDigestTime] = useState('07:00');
  const [milestoneDigestTime, setMilestoneDigestTime] = useState('15:00');

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailNotificationsEnabled);
      setDailyDigestTime(preferences.dailyDigestTime);
      setMilestoneDigestTime(preferences.milestoneDigestTime);
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<StudentNotificationPreferences>) => {
      const res = await apiRequest('PUT', '/api/student-notifications/preferences', updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-notifications/preferences'] });
      toast({
        title: '✅ Settings Saved',
        description: 'Your notification preferences have been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  const handleSavePreferences = () => {
    updateMutation.mutate({
      emailNotificationsEnabled: emailEnabled,
      dailyDigestTime,
      milestoneDigestTime,
    });
  };

  if (isLoading) {
    return (
      <Card data-testid="notification-preferences-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="notification-preferences-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {emailEnabled ? <Bell className="h-5 w-5 text-blue-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
          Student Notification Settings
        </CardTitle>
        <CardDescription>
          Manage email notifications for service hours, token milestones, IPARD bonuses, and rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 mb-2">📬 WHAT YOU'LL RECEIVE</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Service hour approval notifications</li>
            <li>✓ Token milestone achievements (100, 250, 500, 1000)</li>
            <li>✓ IPARD bonus awards (Investigation, Reflection, Demonstration)</li>
            <li>✓ Reward redemption status updates</li>
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base font-medium">
              Enable Email Notifications
            </Label>
            <p className="text-sm text-gray-500">
              Receive updates about your achievements and activities
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
            data-testid="switch-email-notifications"
          />
        </div>

        {emailEnabled && (
          <>
            <div className="space-y-3">
              <Label htmlFor="daily-digest-time" className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Daily Digest Time
              </Label>
              <Select value={dailyDigestTime} onValueChange={setDailyDigestTime}>
                <SelectTrigger id="daily-digest-time" data-testid="select-daily-digest-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="07:30">7:30 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Receive a daily summary of your recent activities
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="milestone-digest-time" className="text-base font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Milestone Digest Time
              </Label>
              <Select value={milestoneDigestTime} onValueChange={setMilestoneDigestTime}>
                <SelectTrigger id="milestone-digest-time" data-testid="select-milestone-digest-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="15:30">3:30 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Get notified when you reach token milestones
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSavePreferences}
                disabled={updateMutation.isPending}
                className="w-full"
                data-testid="button-save-preferences"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </>
        )}

        {!emailEnabled && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              💡 <strong>Email notifications are currently OFF.</strong> Enable them to stay updated on your achievements, service hour approvals, and milestone rewards!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
