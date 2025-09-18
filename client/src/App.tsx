import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/AdminDashboard";
import ParentDashboard from "@/pages/ParentDashboard";
import RewardsPage from "@/pages/rewards";
import TeacherDashboard from "@/pages/TeacherDashboardSimple";
import { LandingPage } from "@/components/landing-page";
import PWAInstall from "@/components/PWAInstall";
import WellnessCheckInPage from "@/pages/wellness-checkin";
import FamilyChallenges from "@/pages/FamilyChallenges";
import MentorDashboard from "@/pages/MentorDashboard";
import FamilyDashboard from "@/pages/FamilyDashboard";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import StudentSignup from "@/pages/StudentSignup";
import ParentConsent from "@/pages/ParentConsent";
import SchoolConsentDashboard from "@/pages/SchoolConsentDashboard";
import { FloatingRewardsButton } from "@/components/FloatingRewardsButton";
import { RewardNotificationManager } from "@/components/RewardNotificationManager";
import { SchoolRegistration } from "@/components/SchoolRegistration";

function Router() {
  const [location, setLocation] = useLocation();
  const showFloatingButton = location !== '/rewards' && location !== '/';

  return (
    <>
      <Switch>
        <Route path="/teacher-dashboard"><TeacherDashboard /></Route>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/admin/consents" component={SchoolConsentDashboard} />
        <Route path="/school-consent" component={SchoolConsentDashboard} />
        <Route path="/parent" component={ParentDashboard} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/wellness-checkin" component={WellnessCheckInPage} />
        <Route path="/family-challenges" component={FamilyChallenges} />
        <Route path="/family-dashboard"><FamilyDashboard /></Route>
        <Route path="/analytics-dashboard"><AnalyticsDashboard /></Route>
        <Route path="/mentor-dashboard" component={MentorDashboard} />
        <Route path="/school-register">
          <SchoolRegistration />
        </Route>
        <Route path="/student-signup" component={StudentSignup} />
        <Route path="/parent-consent/:verificationCode" component={ParentConsent} />
        <Route path="/app" component={Home} />
        <Route path="/" component={LandingPage} />
      </Switch>
      
      {/* Floating Rewards Button - Always Visible for Better Engagement */}
      {showFloatingButton && (
        <FloatingRewardsButton 
          onRewardsClick={() => setLocation('/rewards')}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstall />
        <RewardNotificationManager />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
