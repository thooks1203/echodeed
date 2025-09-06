import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, X, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setServiceWorkerReady(true);
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: \"App Updated!\",
                    description: \"New features available. Refresh to update.\",
                    duration: 10000,
                  });
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt if not already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      
      if (!isStandalone && !isInWebAppiOS) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      toast({
        title: \"🎉 EchoDeed™ Installed!\",
        description: \"App successfully installed. You can now use it offline!\",
      });
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: \"🌐 Back Online!\",
        description: \"Connection restored. Syncing data...\",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: \"📱 Offline Mode\",
        description: \"You can continue using the app. Data will sync when online.\",
        variant: \"destructive\",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: \"Installing EchoDeed™...\",
          description: \"App will be available on your home screen soon!\",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursAgo = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt) {
    return (
      <div className=\"fixed bottom-4 right-4 z-50 flex items-center gap-2\">
        {/* Connection Status Indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
          isOnline 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {isOnline ? (
            <>
              <Wifi className=\"w-3 h-3\" />
              Online
            </>
          ) : (
            <>
              <WifiOff className=\"w-3 h-3\" />
              Offline
            </>
          )}
        </div>
        
        {/* PWA Status */}
        {serviceWorkerReady && (
          <div className=\"flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400\">
            <Smartphone className=\"w-3 h-3\" />
            PWA Ready
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\" data-testid=\"pwa-install-modal\">
      <Card className=\"max-w-md w-full bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700\">
        <CardHeader className=\"text-center relative\">
          <Button
            variant=\"ghost\"
            size=\"sm\"
            className=\"absolute top-2 right-2 h-6 w-6 p-0\"
            onClick={handleDismiss}
            data-testid=\"button-dismiss-install\"
          >
            <X className=\"w-4 h-4\" />
          </Button>
          
          <div className=\"mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4\">
            <Smartphone className=\"w-8 h-8 text-white\" />
          </div>
          
          <CardTitle className=\"text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent\">
            Install EchoDeed™
          </CardTitle>
          
          <CardDescription className=\"text-gray-600 dark:text-gray-300\">
            Get the full experience with our Progressive Web App
          </CardDescription>
        </CardHeader>
        
        <CardContent className=\"space-y-4\">
          <div className=\"space-y-3\">
            <div className=\"flex items-center gap-3 text-sm\">
              <div className=\"w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0\" />
              <span>Works offline - access your wellness data anywhere</span>
            </div>
            
            <div className=\"flex items-center gap-3 text-sm\">
              <div className=\"w-2 h-2 bg-blue-500 rounded-full flex-shrink-0\" />
              <span>Push notifications for important updates</span>
            </div>
            
            <div className=\"flex items-center gap-3 text-sm\">
              <div className=\"w-2 h-2 bg-purple-500 rounded-full flex-shrink-0\" />
              <span>Native app experience on your device</span>
            </div>
            
            <div className=\"flex items-center gap-3 text-sm\">
              <div className=\"w-2 h-2 bg-orange-500 rounded-full flex-shrink-0\" />
              <span>Faster loading and better performance</span>
            </div>
          </div>
          
          <div className=\"flex gap-2 pt-2\">
            <Button 
              onClick={handleInstallClick}
              className=\"flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white\"
              data-testid=\"button-install-pwa\"
            >
              <Download className=\"w-4 h-4 mr-2\" />
              Install App
            </Button>
            
            <Button 
              variant=\"outline\" 
              onClick={handleDismiss}
              className=\"px-4\"
              data-testid=\"button-maybe-later\"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className=\"text-xs text-center text-gray-500 dark:text-gray-400\">
            Free to install • Works on all devices • No app store required
          </p>
        </CardContent>
      </Card>
    </div>
  );
}