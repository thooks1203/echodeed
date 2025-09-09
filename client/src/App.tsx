import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/AdminDashboard";
import ParentDashboard from "@/pages/ParentDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { LandingPage } from "@/components/landing-page";
import PWAInstall from "@/components/PWAInstall";

function Router() {
  return (
    <Switch>
      <Route path="/teacher-dashboard" component={TeacherDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/parent" component={ParentDashboard} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      <Route path="/app" component={Home} />
      <Route path="/" component={LandingPage} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
