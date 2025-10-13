/**
 * 🚀 REVOLUTIONARY: Push Notification Setup
 * Enables real-time mobile alerts for parents
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Heart, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface PushNotificationSetupProps {
  userId?: string;
  userType?: 'parent' | 'student' | 'admin';
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export default function PushNotificationSetup({ 
  userId, 
  userType = 'parent',
  onSubscriptionChange 
}: PushNotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPushSupport();
    checkSubscriptionStatus();
  }, []);

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      onSubscriptionChange?.(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker if needed
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BPqLvThlLMsF_rLKjRHkH1e5BmzPhY9Ycp7TzJXY8j5n8_F7lM3XvZF2NJp9c0J_3lMnHv8H9H8M8_k8I9_F8I'
        )
      });

      // Send subscription to server
      await saveSubscriptionToServer(subscription);

      setIsSubscribed(true);
      onSubscriptionChange?.(true);

      // Show test notification
      showTestNotification();
      
    } catch (error: any) {
      console.error('Push subscription error:', error);
      setError(error.message || 'Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromServer(subscription);
      }

      setIsSubscribed(false);
      onSubscriptionChange?.(false);
      
    } catch (error: any) {
      console.error('Push unsubscribe error:', error);
      setError(error.message || 'Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscriptionToServer = async (subscription: PushSubscription) => {
    const subscriptionData = {
      userId,
      userType,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    // In production, save to your backend
    console.log('💾 Saving push subscription to server:', subscriptionData);
    
    // Mock API call
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    }).catch(() => {
      // Mock success for demo
      console.log('✅ Push subscription saved (mocked)');
    });
  };

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    console.log('🗑️ Removing push subscription from server');
    
    // Mock API call
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId,
        endpoint: subscription.endpoint 
      })
    }).catch(() => {
      // Mock success for demo
      console.log('✅ Push subscription removed (mocked)');
    });
  };

  const showTestNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('🌟 EchoDeed Notifications Active!', {
        body: userType === 'parent' 
          ? "You'll now receive instant alerts when your child shares kindness acts!"
          : "You'll now receive important updates and safety alerts!",
        icon: '/icons/app-icon-192.png',
        badge: '/icons/kindness-badge-72.png',
        tag: 'echodeed-welcome'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  if (!isSupported) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Push notifications not supported
              </p>
              <p className="text-xs text-yellow-600">
                Your browser doesn't support push notifications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isSubscribed ? "border-green-200" : "border-blue-200"}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          📱 Instant Notifications
          {isSubscribed && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {userType === 'parent' 
            ? "Get instant mobile alerts when your child posts kindness acts through our dual reward system!"
            : "Stay updated with important safety alerts and platform notifications."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permission === 'denied' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <div className="space-y-2">
                <p className="font-semibold">Notification permission blocked</p>
                <p className="text-sm">To enable notifications, please:</p>
                <ol className="text-sm list-decimal list-inside space-y-1">
                  <li>Click the 🔒 lock icon in your browser's address bar</li>
                  <li>Find "Notifications" in the permissions menu</li>
                  <li>Change it from "Block" to "Allow"</li>
                  <li>Refresh this page and click "Enable Notifications" again</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {error && permission !== 'denied' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {userType === 'parent' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Real-time alerts when children share kindness</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Immediate safety notifications if needed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4 text-green-500" />
              <span>Dual reward system celebration alerts</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isSubscribed ? (
            <Button 
              onClick={subscribeToPush}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              data-testid="button-enable-notifications"
            >
              <Bell className="h-4 w-4" />
              {isLoading ? 'Enabling...' : permission === 'denied' ? 'Request Permission Again' : 'Enable Notifications'}
            </Button>
          ) : (
            <Button 
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-disable-notifications"
            >
              <Bell className="h-4 w-4" />
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </Button>
          )}

          {permission === 'granted' && !isSubscribed && (
            <Badge variant="outline" className="text-green-600">
              Permission Granted
            </Badge>
          )}
        </div>

        {isSubscribed && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 You're all set! You'll receive instant notifications for all important updates.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}