import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Eye, 
  Award,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface KindnessMystery {
  id: string;
  title: string;
  description: string;
  location: string;
  timeFrame: string;
  clues: string[];
  status: 'unsolved' | 'solved' | 'investigating';
  submittedBy: string;
  submittedAt: string;
  detectives: number;
  solution?: {
    whoItWas: string;
    confirmedBy: string;
    story: string;
    solvedAt: string;
  };
  category: string;
  urgency: 'low' | 'medium' | 'high';
}

const sampleMysteries: KindnessMystery[] = [
  {
    id: '1',
    title: 'The Mysterious Lunch Helper',
    description: 'Someone left a bag lunch with a note "For anyone who forgot theirs today ❤️" on the cafeteria table during first period.',
    location: 'School Cafeteria',
    timeFrame: 'Tuesday morning, around 8:15 AM',
    clues: [
      'Pink sticky note with heart stickers',
      'Lunch included homemade cookies',
      'Handwriting looked like cursive practice',
      'Bag was placed near the 3rd grade tables'
    ],
    status: 'investigating',
    submittedBy: 'Teacher Ms. Rodriguez',
    submittedAt: '2024-12-09T08:30:00Z',
    detectives: 7,
    category: 'Food Kindness',
    urgency: 'medium'
  },
  {
    id: '2',
    title: 'The Secret Garden Angel',
    description: 'Every morning this week, someone has been watering and caring for the school garden before anyone arrives.',
    location: 'School Garden Area',
    timeFrame: 'This week, very early morning (before 7:30 AM)',
    clues: [
      'Leaves small encouraging notes for plants',
      'Uses a red watering can',
      'Knows exactly which plants need extra care',
      'Sometimes hums while working'
    ],
    status: 'unsolved',
    submittedBy: 'Custodian Mr. Williams',
    submittedAt: '2024-12-08T12:00:00Z',
    detectives: 12,
    category: 'Environmental Care',
    urgency: 'low'
  },
  {
    id: '3',
    title: 'The Locker Note Fairy',
    description: 'Students have been finding encouraging notes in their lockers all week. "You are amazing!" "Keep being awesome!" and similar messages.',
    location: 'Main Hallway Lockers',
    timeFrame: 'All week, appearing overnight',
    clues: [
      'Notes are written on colorful paper',
      'Uses different colored markers',
      'Knows which lockers belong to which students',
      'Notes appear in lockers 47-68 area'
    ],
    status: 'solved',
    submittedBy: 'Student Council',
    submittedAt: '2024-12-07T15:45:00Z',
    detectives: 15,
    solution: {
      whoItWas: 'Emma S. and her little sister',
      confirmedBy: 'Principal Davis',
      story: 'Emma and her sister Maya have been staying after school to write notes. They wanted to make everyone feel special during exam week!',
      solvedAt: '2024-12-09T14:20:00Z'
    },
    category: 'Encouragement',
    urgency: 'low'
  },
  {
    id: '4',
    title: 'The Playground Equipment Cleaner',
    description: 'Someone has been cleaning and organizing the playground equipment every evening, making sure everything is ready for the next day.',
    location: 'Main Playground',
    timeFrame: 'Every evening around 6 PM',
    clues: [
      'Equipment is always perfectly arranged',
      'Uses school cleaning supplies responsibly',
      'Leaves no trace except clean equipment',
      'Even picks up litter from around the area'
    ],
    status: 'investigating',
    submittedBy: 'Parent Volunteer',
    submittedAt: '2024-12-06T19:30:00Z',
    detectives: 9,
    category: 'School Care',
    urgency: 'medium'
  }
];

const categories = [
  { id: 'all', label: 'All Mysteries', count: 4 },
  { id: 'Food Kindness', label: 'Food Kindness', count: 1 },
  { id: 'Environmental Care', label: 'Environmental', count: 1 },
  { id: 'Encouragement', label: 'Encouragement', count: 1 },
  { id: 'School Care', label: 'School Care', count: 1 }
];

const statusColors = {
  unsolved: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  solved: 'bg-green-100 text-green-800'
};

const urgencyColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
};

export function KindnessDetective() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMystery, setSelectedMystery] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('mysteries');

  const filteredMysteries = selectedCategory === 'all' 
    ? sampleMysteries 
    : sampleMysteries.filter(mystery => mystery.category === selectedCategory);

  const mysteryToShow = selectedMystery ? sampleMysteries.find(m => m.id === selectedMystery) : null;

  const solvedCount = sampleMysteries.filter(m => m.status === 'solved').length;
  const investigatingCount = sampleMysteries.filter(m => m.status === 'investigating').length;
  const totalDetectives = sampleMysteries.reduce((sum, m) => sum + m.detectives, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              🕵️ Kindness Detective
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Solve mysteries of anonymous good deeds happening in our community
          </p>
          <p className="text-sm text-gray-500">
            Someone did something kind but didn't take credit? Let's celebrate them together! 🔍✨
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{sampleMysteries.length}</div>
              <div className="text-sm text-gray-600">Active Mysteries</div>
              <div className="text-xs text-gray-500 mt-1">awaiting detectives</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{solvedCount}</div>
              <div className="text-sm text-gray-600">Solved Cases</div>
              <div className="text-xs text-gray-500 mt-1">good deeds revealed</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalDetectives}</div>
              <div className="text-sm text-gray-600">Student Detectives</div>
              <div className="text-xs text-gray-500 mt-1">helping solve mysteries</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{investigatingCount}</div>
              <div className="text-sm text-gray-600">Under Investigation</div>
              <div className="text-xs text-gray-500 mt-1">hot on the trail</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mysteries" className="flex items-center gap-1">
              <Search className="w-4 h-4" />
              Active Mysteries
            </TabsTrigger>
            <TabsTrigger value="solved" className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              Solved Cases
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Report Mystery
            </TabsTrigger>
          </TabsList>

          {/* Active Mysteries Tab */}
          <TabsContent value="mysteries" className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Mystery Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        selectedCategory === category.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{category.label}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {category.count} cases
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mystery List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMysteries.filter(m => m.status !== 'solved').map((mystery) => (
                <Card key={mystery.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMystery(mystery.id)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{mystery.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={statusColors[mystery.status]}>
                          {mystery.status}
                        </Badge>
                        <Badge className={urgencyColors[mystery.urgency]}>
                          {mystery.urgency}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {mystery.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {mystery.timeFrame}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4">{mystery.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">🔍 Evidence & Clues</h4>
                        <div className="space-y-1">
                          {mystery.clues.slice(0, 2).map((clue, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                              {clue}
                            </div>
                          ))}
                          {mystery.clues.length > 2 && (
                            <div className="text-xs text-gray-500 ml-4">
                              +{mystery.clues.length - 2} more clues to discover...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          {mystery.detectives} student detectives working on this
                        </div>
                        <Button size="sm">
                          🕵️ Join Investigation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Solved Cases Tab */}
          <TabsContent value="solved" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {sampleMysteries.filter(m => m.status === 'solved').map((mystery) => (
                <Card key={mystery.id} className="border-l-4 border-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {mystery.title}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        CASE SOLVED!
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">🔍 The Mystery</h4>
                        <p className="text-gray-700 mb-4">{mystery.description}</p>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-4 h-4" />
                            {mystery.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {mystery.timeFrame}
                          </div>
                        </div>
                      </div>
                      
                      {mystery.solution && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            The Solution
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Who:</strong> {mystery.solution.whoItWas}</div>
                            <div><strong>Story:</strong> {mystery.solution.story}</div>
                            <div className="text-xs text-gray-600 mt-2">
                              Solved by {mystery.detectives} detectives • Confirmed by {mystery.solution.confirmedBy}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Submit Mystery Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Report a Kindness Mystery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">
                    Did you witness an act of kindness but don't know who did it? Help us celebrate anonymous heroes by reporting their good deeds!
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What happened? *
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded-lg resize-none h-24"
                          placeholder="Describe the kind act you witnessed..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Where did it happen? *
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-lg"
                          placeholder="e.g., School cafeteria, playground, hallway..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          When did it happen? *
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-lg"
                          placeholder="e.g., Yesterday morning, Last Tuesday..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Any clues about who did it?
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded-lg resize-none h-24"
                          placeholder="Any details that might help identify the kind person..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select className="w-full p-3 border rounded-lg">
                          <option value="">Choose a category...</option>
                          <option value="Food Kindness">Food Kindness</option>
                          <option value="Environmental Care">Environmental Care</option>
                          <option value="Encouragement">Encouragement</option>
                          <option value="School Care">School Care</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full" size="lg">
                          🕵️ Submit Mystery for Investigation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Good Mystery Reports */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">💡 Tips for Great Mystery Reports</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Include Details About:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Exact location and time</li>
                      <li>• What made the act special</li>
                      <li>• Any unique details you noticed</li>
                      <li>• How it made people feel</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Help Detectives by Noting:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Physical clues left behind</li>
                      <li>• Approximate age or grade level</li>
                      <li>• Any distinguishing features</li>
                      <li>• Patterns or repeated behavior</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}