import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient as client } from '@/lib/queryClient';

interface NotificationPreferences {
  id: string;
  userId: string;
  dailyEncouragementEnabled: number;
  notificationFrequency: string;
  preferredTime: string;
  timezone: string;
  pushNotificationsEnabled: number;
  emailNotificationsEnabled: number;
  lastNotificationSent: Date | null;
  totalNotificationsSent: number;
  totalNotificationsOpened: number;
  createdAt: Date;
  updatedAt: Date;
}

export function NotificationPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
  });

  // Local state for immediate UI updates
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [pushEnabled, setPushEnabled] = useState(true);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.dailyEncouragementEnabled === 1);
      setFrequency(preferences.notificationFrequency);
      setPushEnabled(preferences.pushNotificationsEnabled === 1);
    }
  }, [preferences]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return await apiRequest(
        '/api/notifications/preferences',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: '✅ Preferences Updated',
        description: 'Your notification settings have been saved.',
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

  const handleToggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    updateMutation.mutate({ dailyEncouragementEnabled: checked ? 1 : 0 });
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    updateMutation.mutate({ notificationFrequency: value });
  };

  const handlePushToggle = (checked: boolean) => {
    setPushEnabled(checked);
    updateMutation.mutate({ pushNotificationsEnabled: checked ? 1 : 0 });
  };

  if (isLoading) {
    return (
      <Card>
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
    <Card data-testid="notification-preferences-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Bell className="h-5 w-5 text-blue-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
          Daily Encouragement
        </CardTitle>
        <CardDescription>
          Get daily messages of encouragement to inspire kindness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-encouragement" className="text-base font-medium">
              Enable Daily Encouragement
            </Label>
            <p className="text-sm text-gray-500">
              Receive uplifting messages to brighten your day
            </p>
          </div>
          <Switch
            id="daily-encouragement"
            checked={enabled}
            onCheckedChange={handleToggleEnabled}
            data-testid="toggle-daily-encouragement"
          />
        </div>

        {/* Frequency Selection - Only show if enabled */}
        {enabled && (
          <>
            <div className="space-y-3">
              <Label htmlFor="frequency" className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Message Frequency
              </Label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger id="frequency" data-testid="select-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every Day</SelectItem>
                  <SelectItem value="every_other_day">Every Other Day</SelectItem>
                  <SelectItem value="weekly">Once a Week</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {frequency === 'daily' && 'Get a message every day at 9:00 AM'}
                {frequency === 'every_other_day' && 'Get a message every 2 days'}
                {frequency === 'weekly' && 'Get a message once per week'}
              </p>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base font-medium">
                  Browser Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Show messages as browser notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushEnabled}
                onCheckedChange={handlePushToggle}
                data-testid="toggle-push-notifications"
              />
            </div>

            {/* Stats */}
            {preferences && preferences.totalNotificationsSent > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  📊 You've received {preferences.totalNotificationsSent} encouraging message{preferences.totalNotificationsSent !== 1 ? 's' : ''} so far!
                </p>
              </div>
            )}
          </>
        )}

        {/* Disabled State Message */}
        {!enabled && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Enable daily encouragement to receive positive messages that inspire you to spread kindness. You can turn it off anytime!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
