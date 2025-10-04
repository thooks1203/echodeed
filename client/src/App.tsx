import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/AdminDashboard";
import ParentDashboard from "@/pages/ParentDashboard";
import RewardsPage from "@/pages/rewards";
import TeacherDashboard from "@/pages/TeacherDashboard";
import ClassSettings from "@/pages/ClassSettings";
import SupportPage from "@/pages/support";
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
import MerchantVerifyPage from "@/pages/MerchantVerifyPage";
import DemoLogin from "@/pages/DemoLogin";
import EmergencySeed from "@/pages/emergency-seed";
import { FloatingRewardsButton } from "@/components/FloatingRewardsButton";
import { RewardNotificationManager } from "@/components/RewardNotificationManager";
import { SchoolRegistration } from "@/components/SchoolRegistration";
import { SurpriseGiveawayManager } from "@/components/SurpriseGiveawayManager";
import { useKindnessSparks } from "@/components/KindnessSparks";
import { KindnessSparksContext } from "@/contexts/KindnessSparksContext";
import { DemoSchoolProvider } from "@/contexts/DemoSchoolContext";
import { useAuth } from "@/hooks/useAuth";
// import TVDisplayMode from "@/pages/TVDisplayMode";

function Router() {
  const [location, setLocation] = useLocation();
  const { isTeacher, isAdmin } = useAuth();
  
  // Hide floating rewards button for admin/teacher roles and certain pages
  const showFloatingButton = !isTeacher && 
                              !isAdmin && 
                              !location.includes('/admin') && 
                              !location.includes('/teacher') && 
                              location !== '/rewards' && 
                              location !== '/' && 
                              location !== '/demo-login';

  return (
    <>
      <Switch>
        <Route path="/emergency-seed" component={EmergencySeed} />
        <Route path="/demo-login" component={DemoLogin} />
        <Route path="/teacher-dashboard">
          {(params) => {
            const searchParams = new URLSearchParams(window.location.search);
            const tab = searchParams.get('tab') || 'feed';
            return <TeacherDashboard initialTab={tab} />;
          }}
        </Route>
        <Route path="/class-settings" component={ClassSettings} />
        <Route path="/support" component={SupportPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/admin/consents" component={SchoolConsentDashboard} />
        <Route path="/school-consent" component={SchoolConsentDashboard} />
        <Route path="/parent" component={ParentDashboard} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route path="/rewards"><RewardsPage /></Route>
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
        <Route path="/r/:code" component={MerchantVerifyPage} />
        {/* <Route path="/tv-display" component={TVDisplayMode} />
        <Route path="/assembly-mode" component={TVDisplayMode} /> */}
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
  // Mount kindness sparks at app root so they're always available
  const { triggerSparks, KindnessSparksComponent } = useKindnessSparks();
  
  return (
    <QueryClientProvider client={queryClient}>
      <DemoSchoolProvider>
        <KindnessSparksContext.Provider value={{ triggerSparks }}>
          <TooltipProvider>
            <Toaster />
            <Router />
            {/* Always-mounted kindness sparks via portal */}
            <KindnessSparksComponent />
            <PWAInstall />
            <RewardNotificationManager />
            <SurpriseGiveawayManager />
          </TooltipProvider>
        </KindnessSparksContext.Provider>
      </DemoSchoolProvider>
    </QueryClientProvider>
  );
}

export default App;
