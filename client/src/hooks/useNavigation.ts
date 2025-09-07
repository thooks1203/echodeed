import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

interface NavigationState {
  canGoBack: boolean;
  currentPath: string;
  previousPath: string | null;
  goBack: () => void;
}

export function useNavigation(): NavigationState {
  const [location, setLocation] = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([location]);
  
  useEffect(() => {
    setNavigationHistory(prev => {
      // Avoid duplicates if we're on the same page
      if (prev[prev.length - 1] === location) return prev;
      return [...prev, location];
    });
  }, [location]);

  const goBack = () => {
    if (navigationHistory.length > 1) {
      // Remove current page and go to previous
      const newHistory = navigationHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setLocation(previousPage);
    } else {
      // Fallback to root if no history
      setLocation('/');
    }
  };

  return {
    canGoBack: navigationHistory.length > 1,
    currentPath: location,
    previousPath: navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null,
    goBack
  };
}

// Hook for managing internal tab navigation with back support
export function useTabNavigation(initialTab: string) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabHistory, setTabHistory] = useState<string[]>([initialTab]);

  const navigateToTab = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      setTabHistory(prev => [...prev, tabId]);
    }
  };

  const goBackInTabs = () => {
    if (tabHistory.length > 1) {
      const newHistory = tabHistory.slice(0, -1);
      const previousTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(previousTab);
      return true;
    }
    return false;
  };

  return {
    activeTab,
    setActiveTab,
    canGoBackInTabs: tabHistory.length > 1,
    navigateToTab,
    goBackInTabs,
    tabHistory
  };
}