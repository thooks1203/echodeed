import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Mail, 
  Target,
  Calendar,
  Heart,
  Star,
  Gift,
  Send,
  Archive,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TimeCapsuleLetter {
  id: string;
  title: string;
  content: string;
  kindnessGoals: string[];
  deliveryDate: string;
  createdAt: string;
  status: 'scheduled' | 'delivered' | 'completed';
  completedGoals: string[];
  reflection?: string;
  futureAge: number;
  currentAge: number;
  category: 'monthly' | 'semester' | 'yearly' | 'graduation';
}

const sampleTimeCapsules: TimeCapsuleLetter[] = [
  {
    id: '1',
    title: 'My Winter Break Kindness Goals',
    content: 'Dear Future Me, I hope by the time you read this, you\'ve made our community a little brighter! I\'m excited to work on being more helpful at home and spreading kindness wherever I go.',
    kindnessGoals: [
      'Help mom with dishes every day without being asked',
      'Write thank you notes to 3 people who helped me this year',
      'Volunteer at the local food bank',
      'Compliment at least one person every day',
      'Help a neighbor with something'
    ],
    deliveryDate: '2025-01-15',
    createdAt: '2024-12-09',
    status: 'scheduled',
    completedGoals: [],
    futureAge: 9,
    currentAge: 8,
    category: 'monthly'
  },
  {
    id: '2',
    title: 'End of 3rd Grade Letter',
    content: 'Hi Future 4th Grade Me! Right now I\'m 8 years old and in Mrs. Johnson\'s class. I want to be known as someone who always helps others and makes people smile. I hope you remember to keep being kind!',
    kindnessGoals: [
      'Help new students feel welcome in 4th grade',
      'Join the school kindness club',
      'Organize a classroom kindness challenge',
      'Help younger students with reading',
      'Always include others at recess'
    ],
    deliveryDate: '2025-08-20',
    createdAt: '2024-05-15',
    status: 'scheduled',
    completedGoals: [],
    futureAge: 9,
    currentAge: 8,
    category: 'yearly'
  },
  {
    id: '3',
    title: 'My October Kindness Challenge',
    content: 'Dear November Me, I hope you completed all these acts of kindness! I was really excited about Halloween and wanted to spread joy beyond just trick-or-treating.',
    kindnessGoals: [
      'Give compliments to 5 classmates',
      'Help clean up the playground',
      'Share my Halloween candy with friends',
      'Write a nice note to my teacher',
      'Help my little brother with his costume'
    ],
    deliveryDate: '2024-11-01',
    createdAt: '2024-10-01',
    status: 'delivered',
    completedGoals: [
      'Give compliments to 5 classmates',
      'Share my Halloween candy with friends',
      'Write a nice note to my teacher',
      'Help my little brother with his costume'
    ],
    reflection: 'I did most of my goals! I felt really good helping my brother and sharing candy. I want to do even more next month!',
    futureAge: 8,
    currentAge: 8,
    category: 'monthly'
  }
];

const categoryInfo = {
  monthly: { label: 'Monthly Goals', icon: Calendar, color: 'bg-blue-100 text-blue-800', duration: '1 month' },
  semester: { label: 'Semester Goals', icon: Archive, color: 'bg-green-100 text-green-800', duration: '6 months' },
  yearly: { label: 'Yearly Goals', icon: Star, color: 'bg-purple-100 text-purple-800', duration: '1 year' },
  graduation: { label: 'Graduation Goals', icon: Gift, color: 'bg-orange-100 text-orange-800', duration: 'Until graduation' }
};

const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

export function KindnessTimeCapsule() {
  const [activeTab, setActiveTab] = useState<string>('my-capsules');
  const [selectedCategory, setSelectedCategory] = useState<string>('monthly');
  const [newCapsule, setNewCapsule] = useState({
    title: '',
    content: '',
    goals: [''],
    deliveryDate: '',
    category: 'monthly'
  });

  const scheduledCapsules = sampleTimeCapsules.filter(c => c.status === 'scheduled');
  const deliveredCapsules = sampleTimeCapsules.filter(c => c.status === 'delivered');
  const totalGoals = sampleTimeCapsules.reduce((sum, capsule) => sum + capsule.kindnessGoals.length, 0);
  const completedGoals = sampleTimeCapsules.reduce((sum, capsule) => sum + capsule.completedGoals.length, 0);

  const addGoal = () => {
    setNewCapsule(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setNewCapsule(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setNewCapsule(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              ⏰ Kindness Time Capsule
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Write letters to your future self with kindness goals and dreams
          </p>
          <p className="text-sm text-gray-500">
            Set kindness goals now and see if Future You accomplished them! 📮✨
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{sampleTimeCapsules.length}</div>
              <div className="text-sm text-gray-600">Time Capsules</div>
              <div className="text-xs text-gray-500 mt-1">letters to future you</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{scheduledCapsules.length}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
              <div className="text-xs text-gray-500 mt-1">waiting to be delivered</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedGoals}</div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
              <div className="text-xs text-gray-500 mt-1">out of {totalGoals} total</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round((completedGoals / totalGoals) * 100)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-xs text-gray-500 mt-1">goals completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-capsules" className="flex items-center gap-1">
              <Archive className="w-4 h-4" />
              My Time Capsules
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Send className="w-4 h-4" />
              Create New Capsule
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              Delivered Letters
            </TabsTrigger>
          </TabsList>

          {/* My Time Capsules Tab */}
          <TabsContent value="my-capsules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Scheduled Time Capsules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledCapsules.map((capsule) => {
                    const categoryDetails = categoryInfo[capsule.category];
                    const IconComponent = categoryDetails.icon;
                    const daysUntilDelivery = Math.ceil((new Date(capsule.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <Card key={capsule.id} className="border-l-4 border-purple-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{capsule.title}</CardTitle>
                            <Badge className={categoryDetails.color}>
                              {categoryDetails.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {daysUntilDelivery} days until delivery
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {capsule.kindnessGoals.length} goals
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-gray-700 mb-4 text-sm italic">
                            "{capsule.content.substring(0, 100)}..."
                          </p>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">🎯 Kindness Goals to Complete:</h4>
                            <div className="space-y-1">
                              {capsule.kindnessGoals.slice(0, 3).map((goal, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                  {goal}
                                </div>
                              ))}
                              {capsule.kindnessGoals.length > 3 && (
                                <div className="text-xs text-gray-500 ml-4">
                                  +{capsule.kindnessGoals.length - 3} more goals
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-xs text-gray-500">
                              Will be delivered: {new Date(capsule.deliveryDate).toLocaleDateString()}
                            </div>
                            <Button size="sm" variant="outline">
                              ✏️ Edit Goals
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create New Capsule Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Create Your Kindness Time Capsule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose your time capsule type:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(categoryInfo).map(([key, info]) => {
                        const IconComponent = info.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`p-4 rounded-lg border transition-all ${
                              selectedCategory === key
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <IconComponent className={`w-6 h-6 ${
                                selectedCategory === key ? 'text-purple-600' : 'text-gray-600'
                              }`} />
                              <div className="text-sm font-medium text-gray-900">{info.label}</div>
                              <div className="text-xs text-gray-500">{info.duration}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Give your time capsule a title *
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-lg"
                          placeholder="e.g., My Spring Kindness Goals"
                          value={newCapsule.title}
                          onChange={(e) => setNewCapsule(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Write a letter to your future self *
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded-lg resize-none h-32"
                          placeholder="Dear Future Me, right now I am... I hope by the time you read this..."
                          value={newCapsule.content}
                          onChange={(e) => setNewCapsule(prev => ({ ...prev, content: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          When should this be delivered? *
                        </label>
                        <input 
                          type="date" 
                          className="w-full p-3 border rounded-lg"
                          value={newCapsule.deliveryDate}
                          onChange={(e) => setNewCapsule(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kindness goals for Future You *
                        </label>
                        <div className="space-y-2">
                          {newCapsule.goals.map((goal, index) => (
                            <div key={index} className="flex gap-2">
                              <input 
                                type="text" 
                                className="flex-1 p-2 border rounded-lg text-sm"
                                placeholder={`Kindness goal ${index + 1}...`}
                                value={goal}
                                onChange={(e) => updateGoal(index, e.target.value)}
                              />
                              {newCapsule.goals.length > 1 && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => removeGoal(index)}
                                  className="px-2"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={addGoal}
                            className="w-full"
                          >
                            ➕ Add Another Goal
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full" size="lg">
                          📮 Create Time Capsule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivered Letters Tab */}
          <TabsContent value="delivered" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {deliveredCapsules.map((capsule) => (
                <Card key={capsule.id} className="border-l-4 border-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gift className="w-5 h-5 text-green-500" />
                        {capsule.title}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        DELIVERED
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Created when you were {capsule.currentAge} • Delivered at age {capsule.futureAge}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">💌 Your Letter</h4>
                        <p className="text-gray-700 text-sm italic mb-4">"{capsule.content}"</p>
                        
                        <h4 className="font-semibold mb-2">🎯 Your Goals</h4>
                        <div className="space-y-1">
                          {capsule.kindnessGoals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {capsule.completedGoals.includes(goal) ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={capsule.completedGoals.includes(goal) ? 'text-green-700' : 'text-gray-600'}>
                                {goal}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">✨ Your Reflection</h4>
                        {capsule.reflection ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">"{capsule.reflection}"</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                              How did you do with your kindness goals? Write a reflection:
                            </p>
                            <textarea 
                              className="w-full p-2 border rounded text-sm resize-none h-20"
                              placeholder="I felt good about... Next time I want to..."
                            />
                            <Button size="sm" className="mt-2">
                              💫 Save Reflection
                            </Button>
                          </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm">
                            <strong>Goal Success Rate:</strong> {Math.round((capsule.completedGoals.length / capsule.kindnessGoals.length) * 100)}%
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {capsule.completedGoals.length} out of {capsule.kindnessGoals.length} goals completed
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Send a Message to Future You?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Set kindness goals now and see if Future You accomplishes them. It's like having a conversation with yourself across time!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                📮 Create Time Capsule
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                ⏰ View My Capsules
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              ✨ Set goals for future you • 📮 Get reminders to be kind • 💫 Reflect on your growth
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}