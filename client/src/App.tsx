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
import Landing from "@/pages/Landing";
import ExploreRolePage from "@/pages/ExploreRolePage";
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
import PresentationDownloads from "@/pages/PresentationDownloads";
import AllegacyPresentation from "@/pages/AllegacyPresentation";
import MarketingAssets from "@/pages/MarketingAssets";
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
  const { isTeacher, isAdmin, isParent } = useAuth();
  
  // Hide floating rewards button for admin/teacher/parent roles and certain pages
  // Only students should see Echo Tokens since only they earn them
  const showFloatingButton = !isTeacher && 
                              !isAdmin && 
                              !isParent && 
                              !location.includes('/admin') && 
                              !location.includes('/teacher') && 
                              !location.includes('/parent') && 
                              !location.includes('/explore') && 
                              location !== '/rewards' && 
                              location !== '/' && 
                              location !== '/demo-login';

  return (
    <>
      <Switch>
        <Route path="/emergency-seed" component={EmergencySeed} />
        <Route path="/presentations" component={PresentationDownloads} />
        <Route path="/allegacy-presentation" component={AllegacyPresentation} />
        <Route path="/marketing-assets" component={MarketingAssets} />
        <Route path="/demo-login" component={DemoLogin} />
        <Route path="/teacher-dashboard">
          <TeacherDashboard />
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
        <Route path="/explore/:role" component={ExploreRolePage} />
        <Route path="/app" component={Home} />
        <Route path="/" component={Landing} />
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
