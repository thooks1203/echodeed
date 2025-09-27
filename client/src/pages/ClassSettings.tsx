import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Target, 
  Bell, 
  MessageSquare,
  Save,
  BookOpen
} from 'lucide-react';

export default function ClassSettings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Class settings state
  const [classInfo, setClassInfo] = useState({
    className: "Ms. Sarah Wilson's Class",
    gradeLevel: "6-8",
    subject: "Character Education & Social Studies",
    schoolYear: "2025-2026",
    maxStudents: 24
  });

  const [goals, setGoals] = useState({
    weeklyKindnessTarget: 60,
    participationGoal: 85,
    characterTraitFocus: "Empathy"
  });

  const [notifications, setNotifications] = useState({
    parentUpdates: true,
    achievementAlerts: true,
    weeklyReports: true,
    wellnessAlerts: true
  });

  const [communication, setCommunication] = useState({
    autoParentNotifications: true,
    weeklyNewsletters: true,
    instantAlerts: true
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "✅ Settings Saved!",
      description: "Your class settings have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              size="sm"
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Class Settings</h1>
              <p className="text-gray-600">Configure your classroom preferences and goals</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    value={classInfo.className}
                    onChange={(e) => setClassInfo({...classInfo, className: e.target.value})}
                    data-testid="input-class-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select value={classInfo.gradeLevel} onValueChange={(value) => setClassInfo({...classInfo, gradeLevel: value})}>
                    <SelectTrigger data-testid="select-grade-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K-2">K-2</SelectItem>
                      <SelectItem value="3-5">3-5</SelectItem>
                      <SelectItem value="6-8">6-8</SelectItem>
                      <SelectItem value="9-12">9-12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Primary Subject</Label>
                  <Input
                    id="subject"
                    value={classInfo.subject}
                    onChange={(e) => setClassInfo({...classInfo, subject: e.target.value})}
                    data-testid="input-subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={classInfo.maxStudents}
                    onChange={(e) => setClassInfo({...classInfo, maxStudents: parseInt(e.target.value)})}
                    data-testid="input-max-students"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Character Education Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Character Education Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weeklyTarget">Weekly Kindness Target</Label>
                  <Input
                    id="weeklyTarget"
                    type="number"
                    value={goals.weeklyKindnessTarget}
                    onChange={(e) => setGoals({...goals, weeklyKindnessTarget: parseInt(e.target.value)})}
                    data-testid="input-kindness-target"
                  />
                  <p className="text-sm text-gray-500 mt-1">Target acts of kindness per week</p>
                </div>
                
                <div>
                  <Label htmlFor="participationGoal">Participation Goal (%)</Label>
                  <Input
                    id="participationGoal"
                    type="number"
                    min="0"
                    max="100"
                    value={goals.participationGoal}
                    onChange={(e) => setGoals({...goals, participationGoal: parseInt(e.target.value)})}
                    data-testid="input-participation-goal"
                  />
                </div>
                
                <div>
                  <Label htmlFor="characterFocus">Character Trait Focus</Label>
                  <Select value={goals.characterTraitFocus} onValueChange={(value) => setGoals({...goals, characterTraitFocus: value})}>
                    <SelectTrigger data-testid="select-character-trait">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empathy">Empathy</SelectItem>
                      <SelectItem value="Kindness">Kindness</SelectItem>
                      <SelectItem value="Respect">Respect</SelectItem>
                      <SelectItem value="Responsibility">Responsibility</SelectItem>
                      <SelectItem value="Honesty">Honesty</SelectItem>
                      <SelectItem value="Gratitude">Gratitude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parent Progress Updates</Label>
                    <p className="text-sm text-gray-500">Send parents weekly progress reports</p>
                  </div>
                  <Switch
                    checked={notifications.parentUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, parentUpdates: checked})}
                    data-testid="switch-parent-updates"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Achievement Alerts</Label>
                    <p className="text-sm text-gray-500">Notify when students reach milestones</p>
                  </div>
                  <Switch
                    checked={notifications.achievementAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, achievementAlerts: checked})}
                    data-testid="switch-achievement-alerts"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Generate automatic weekly summaries</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                    data-testid="switch-weekly-reports"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wellness Alerts</Label>
                    <p className="text-sm text-gray-500">Alert for student wellness concerns</p>
                  </div>
                  <Switch
                    checked={notifications.wellnessAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, wellnessAlerts: checked})}
                    data-testid="switch-wellness-alerts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Parent Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Parent Notifications</Label>
                    <p className="text-sm text-gray-500">Automatically notify parents of student activities</p>
                  </div>
                  <Switch
                    checked={communication.autoParentNotifications}
                    onCheckedChange={(checked) => setCommunication({...communication, autoParentNotifications: checked})}
                    data-testid="switch-auto-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Newsletters</Label>
                    <p className="text-sm text-gray-500">Send class newsletters to parents</p>
                  </div>
                  <Switch
                    checked={communication.weeklyNewsletters}
                    onCheckedChange={(checked) => setCommunication({...communication, weeklyNewsletters: checked})}
                    data-testid="switch-newsletters"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Instant Alerts</Label>
                    <p className="text-sm text-gray-500">Send immediate alerts for important events</p>
                  </div>
                  <Switch
                    checked={communication.instantAlerts}
                    onCheckedChange={(checked) => setCommunication({...communication, instantAlerts: checked})}
                    data-testid="switch-instant-alerts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}