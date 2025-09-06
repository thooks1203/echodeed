import React, { useEffect, useState } from 'react';

export default function MobileTouchOptimizer() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [touchSupport, setTouchSupport] = useState(false);

  useEffect(() => {
    // Detect if app is installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Detect touch support
    setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Add mobile-optimized CSS classes
    const root = document.documentElement;
    root.classList.add('mobile-optimized');
    
    if (isStandalone || isInWebAppiOS) {
      root.classList.add('pwa-installed');
    }

    if (touchSupport) {
      root.classList.add('touch-device');
    }

    // Prevent zoom on input focus (iOS Safari)
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (window.innerWidth < 768) {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
        }
      });

      input.addEventListener('blur', () => {
        if (window.innerWidth < 768) {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
        }
      });
    });

    // Add haptic feedback for buttons (if supported)
    const addHapticFeedback = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
          // Vibrate for 10ms on button press
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        });
      });
    };

    addHapticFeedback();

    // Re-run haptic feedback setup on DOM changes
    const observer = new MutationObserver(addHapticFeedback);
    observer.observe(document.body, { childList: true, subtree: true });

    // Add pull-to-refresh prevention
    const preventPullToRefresh = (e: TouchEvent) => {
      const touch = e.touches[0];
      const isAtTop = window.scrollY === 0;
      const isPullingDown = touch.clientY > touch.clientX;
      
      if (isAtTop && isPullingDown) {
        e.preventDefault();
      }
    };

    if (isInstalled) {
      document.body.addEventListener('touchstart', preventPullToRefresh);
    }

    // Add iOS safe area support
    if (isInWebAppiOS) {
      root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }

    // Cleanup
    return () => {
      observer.disconnect();
      if (isInstalled) {
        document.body.removeEventListener('touchstart', preventPullToRefresh);
      }
    };
  }, []);

  useEffect(() => {
    // Add mobile-specific CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile touch optimizations */
      .mobile-optimized {
        -webkit-tap-highlight-color: rgba(16, 185, 129, 0.2);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .mobile-optimized input,
      .mobile-optimized textarea,
      .mobile-optimized [contenteditable] {
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
      }

      /* Touch device optimizations */
      .touch-device button,
      .touch-device [role="button"] {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }

      .touch-device .interactive-element {
        transform: scale(1);
        transition: transform 0.1s ease;
      }

      .touch-device .interactive-element:active {
        transform: scale(0.95);
      }

      /* PWA installed optimizations */
      .pwa-installed {
        padding-top: var(--safe-area-inset-top, 0px);
        padding-bottom: var(--safe-area-inset-bottom, 0px);
        padding-left: var(--safe-area-inset-left, 0px);
        padding-right: var(--safe-area-inset-right, 0px);
      }

      .pwa-installed body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }

      /* Improved mobile scrolling */
      .mobile-optimized .scrollable {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }

      /* Better mobile form inputs */
      @media (max-width: 768px) {
        .mobile-optimized input,
        .mobile-optimized textarea,
        .mobile-optimized select {
          font-size: 16px !important;
          padding: 12px !important;
          border-radius: 8px !important;
        }
      }

      /* Mobile-first responsive utilities */
      .mobile-hidden {
        display: none;
      }

      @media (min-width: 768px) {
        .mobile-hidden {
          display: block;
        }
        
        .desktop-hidden {
          display: none;
        }
      }

      /* PWA splash screen style */
      .pwa-splash {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: 'Inter', sans-serif;
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null; // This is a utility component - no visible rendering
}