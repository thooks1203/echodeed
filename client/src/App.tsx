import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import RewardsPage from "@/pages/rewards";
import { LandingPage } from "@/components/landing-page";
import NotFound from "@/pages/not-found";
import PWAInstall from "@/components/PWAInstall";
import OfflineDataHandler from "@/components/OfflineDataHandler";
import MobileTouchOptimizer from "@/components/MobileTouchOptimizer";

function Router() {
  // Removed authentication requirement for easier access
  // const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/rewards" component={RewardsPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstall />
        <OfflineDataHandler />
        <MobileTouchOptimizer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
