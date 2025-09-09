import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Users,
  Star,
  ChevronRight,
  Wand2,
  Heart,
  Clock,
  Award,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StoryChapter {
  id: string;
  authorName: string;
  authorAge: number;
  content: string;
  kindnessAct: string;
  addedAt: string;
  chapterNumber: number;
  wordCount: number;
  reactions: {
    hearts: number;
    stars: number;
    smiles: number;
  };
  inspiration?: string;
}

interface CollaborativeStory {
  id: string;
  title: string;
  theme: string;
  startedBy: string;
  startedAt: string;
  status: 'active' | 'complete' | 'featured';
  totalChapters: number;
  totalWords: number;
  participantCount: number;
  lastUpdated: string;
  chapters: StoryChapter[];
  targetLength: number;
  description: string;
  coverEmoji: string;
}

const sampleStories: CollaborativeStory[] = [
  {
    id: '1',
    title: 'The Magic Kindness Garden',
    theme: 'Environmental Kindness',
    startedBy: 'Emma S.',
    startedAt: '2024-12-01T10:00:00Z',
    status: 'active',
    totalChapters: 8,
    totalWords: 847,
    participantCount: 6,
    lastUpdated: '2024-12-09T14:30:00Z',
    targetLength: 12,
    description: 'A story about kids who discover that acts of kindness make plants grow in magical ways',
    coverEmoji: '🌺',
    chapters: [
      {
        id: '1-1',
        authorName: 'Emma S.',
        authorAge: 8,
        content: 'Maya discovered something amazing in the school garden. Every time someone did something kind, the flowers seemed to grow a little taller and shine a little brighter. She wondered if kindness really was magic...',
        kindnessAct: 'helped a classmate carry their books',
        addedAt: '2024-12-01T10:00:00Z',
        chapterNumber: 1,
        wordCount: 97,
        reactions: { hearts: 12, stars: 8, smiles: 15 },
        inspiration: 'I saw someone help today and it made me happy'
      },
      {
        id: '1-2',
        authorName: 'Marcus R.',
        authorAge: 9,
        content: 'The next day, Maya shared her lunch with a new student who had forgotten theirs. As they sat together, Maya noticed the roses by the cafeteria window had sprouted three new buds overnight!',
        kindnessAct: 'shared lunch with new student',
        addedAt: '2024-12-02T12:30:00Z',
        chapterNumber: 2,
        wordCount: 89,
        reactions: { hearts: 10, stars: 6, smiles: 12 },
        inspiration: 'Wanted to continue Emma\'s garden story'
      },
      {
        id: '1-3',
        authorName: 'Lily W.',
        authorAge: 8,
        content: 'Word spread about the magical garden. Alex helped an older student with their heavy backpack, and suddenly the sunflowers turned to face the sun even though it was cloudy. The garden was definitely responding to kindness!',
        kindnessAct: 'helped carry heavy backpack',
        addedAt: '2024-12-03T09:15:00Z',
        chapterNumber: 3,
        wordCount: 112,
        reactions: { hearts: 14, stars: 9, smiles: 18 }
      }
    ]
  },
  {
    id: '2',
    title: 'The Kindness Superhero Squad',
    theme: 'School Heroes',
    startedBy: 'James K.',
    startedAt: '2024-11-25T14:00:00Z',
    status: 'complete',
    totalChapters: 10,
    totalWords: 1247,
    participantCount: 8,
    lastUpdated: '2024-12-05T16:00:00Z',
    targetLength: 10,
    description: 'Ordinary kids discover they get superpowers when they do acts of kindness',
    coverEmoji: '🦸‍♀️',
    chapters: []
  },
  {
    id: '3',
    title: 'The Traveling Kindness Stone',
    theme: 'Community Connection',
    startedBy: 'Sofia M.',
    startedAt: '2024-12-07T11:00:00Z',
    status: 'active',
    totalChapters: 4,
    totalWords: 423,
    participantCount: 3,
    lastUpdated: '2024-12-09T10:15:00Z',
    targetLength: 8,
    description: 'A special stone that travels from person to person, inspiring kindness wherever it goes',
    coverEmoji: '💎',
    chapters: []
  }
];

const storyThemes = [
  { id: 'school-heroes', label: 'School Heroes', emoji: '🦸‍♀️', description: 'Kids with kindness superpowers' },
  { id: 'magical-kindness', label: 'Magical Kindness', emoji: '✨', description: 'When kindness creates magic' },
  { id: 'community-helpers', label: 'Community Helpers', emoji: '🤝', description: 'Helping neighbors and friends' },
  { id: 'animal-friends', label: 'Animal Friends', emoji: '🐕', description: 'Kindness toward animals' },
  { id: 'environmental', label: 'Earth Heroes', emoji: '🌍', description: 'Taking care of our planet' },
  { id: 'family-love', label: 'Family Love', emoji: '👨‍👩‍👧‍👦', description: 'Kindness starts at home' }
];

export function StoryChainBuilder() {
  const [activeTab, setActiveTab] = useState<string>('stories');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('magical-kindness');
  const [newChapter, setNewChapter] = useState({
    content: '',
    kindnessAct: '',
    inspiration: ''
  });

  const selectedStoryData = selectedStory ? sampleStories.find(s => s.id === selectedStory) : null;
  const activeStories = sampleStories.filter(s => s.status === 'active');
  const completedStories = sampleStories.filter(s => s.status === 'complete');

  const totalChapters = sampleStories.reduce((sum, story) => sum + story.totalChapters, 0);
  const totalWords = sampleStories.reduce((sum, story) => sum + story.totalWords, 0);
  const totalParticipants = sampleStories.reduce((sum, story) => sum + story.participantCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              📚 Story Chain Builder
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Create collaborative kindness stories where each chapter is written by a different student
          </p>
          <p className="text-sm text-gray-500">
            Add your chapter and see how the story grows with every act of kindness! 🌟
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">{sampleStories.length}</div>
              <div className="text-sm text-gray-600">Active Stories</div>
              <div className="text-xs text-gray-500 mt-1">being written together</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{totalChapters}</div>
              <div className="text-sm text-gray-600">Chapters Written</div>
              <div className="text-xs text-gray-500 mt-1">by students like you</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600 mb-2">{totalWords}</div>
              <div className="text-sm text-gray-600">Words of Kindness</div>
              <div className="text-xs text-gray-500 mt-1">inspiring stories told</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalParticipants}</div>
              <div className="text-sm text-gray-600">Story Contributors</div>
              <div className="text-xs text-gray-500 mt-1">amazing authors</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stories" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Active Stories
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Chapter
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Wand2 className="w-4 h-4" />
              Start New Story
            </TabsTrigger>
          </TabsList>

          {/* Active Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeStories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStory(story.id)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{story.coverEmoji}</span>
                        {story.title}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        {story.totalChapters}/{story.targetLength} chapters
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">{story.description}</div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {story.participantCount} authors
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {story.totalWords} words
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Started by {story.startedBy}
                        </div>
                      </div>
                      
                      {story.chapters.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-sm mb-1">Latest Chapter by {story.chapters[story.chapters.length - 1].authorName}:</div>
                          <p className="text-sm text-gray-700 italic">
                            "{story.chapters[story.chapters.length - 1].content.substring(0, 100)}..."
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${(story.totalChapters / story.targetLength) * 100}%` }}
                          ></div>
                        </div>
                        <Button size="sm">
                          📖 Read & Add Chapter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Story Details */}
            {selectedStoryData && (
              <Card className="border-l-4 border-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedStoryData.coverEmoji}</span>
                    {selectedStoryData.title}
                    <Badge className="bg-amber-100 text-amber-800">{selectedStoryData.theme}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{selectedStoryData.description}</p>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">📚 Story Chapters</h4>
                      {selectedStoryData.chapters.map((chapter, index) => (
                        <div key={chapter.id} className="flex gap-4 p-4 bg-white rounded-lg border">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {chapter.chapterNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">
                                Chapter {chapter.chapterNumber} by {chapter.authorName} (age {chapter.authorAge})
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{chapter.wordCount} words</span>
                                <span>•</span>
                                <span>{new Date(chapter.addedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">"{chapter.content}"</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-blue-600">
                                💫 Based on: {chapter.kindnessAct}
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  ❤️ {chapter.reactions.hearts}
                                </span>
                                <span className="flex items-center gap-1">
                                  ⭐ {chapter.reactions.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                  😊 {chapter.reactions.smiles}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-500">
                      <div className="font-semibold mb-2">🖊️ Ready to add the next chapter?</div>
                      <p className="text-sm text-gray-700 mb-3">
                        Think about a kind act you've done or witnessed recently. How could it fit into this story?
                      </p>
                      <Button>
                        ✍️ Write Chapter {selectedStoryData.totalChapters + 1}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Add Chapter Tab */}
          <TabsContent value="write" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Your Chapter to a Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Story Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose a story to continue:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeStories.map((story) => (
                        <button
                          key={story.id}
                          onClick={() => setSelectedStory(story.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedStory === story.id
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{story.coverEmoji}</span>
                            <span className="font-medium">{story.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Chapter {story.totalChapters + 1}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{story.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedStory && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What kind act inspired this chapter? *
                          </label>
                          <input 
                            type="text" 
                            className="w-full p-3 border rounded-lg"
                            placeholder="e.g., I helped someone who dropped their books"
                            value={newChapter.kindnessAct}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, kindnessAct: e.target.value }))}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            This helps connect your story to real kindness
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Write your chapter *
                          </label>
                          <textarea 
                            className="w-full p-3 border rounded-lg resize-none h-32"
                            placeholder="Continue the story... What happens next?"
                            value={newChapter.content}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, content: e.target.value }))}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {newChapter.content.split(' ').filter(word => word.length > 0).length} words
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What inspired you to add this chapter?
                          </label>
                          <textarea 
                            className="w-full p-3 border rounded-lg resize-none h-20"
                            placeholder="Optional: Share what inspired your addition..."
                            value={newChapter.inspiration}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, inspiration: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">💡 Writing Tips</h4>
                          <div className="text-sm space-y-1">
                            <div>• Keep your chapter 50-150 words</div>
                            <div>• Continue the story's theme and characters</div>
                            <div>• Include how kindness impacts the story</div>
                            <div>• Leave something for the next writer to continue</div>
                            <div>• Use age-appropriate language for all readers</div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">🌟 Story Connections</h4>
                          <div className="text-sm text-gray-700">
                            <p>Your chapter will be connected to the real act of kindness that inspired it, showing how stories and real life connect!</p>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Button className="w-full" size="lg">
                            📚 Add Chapter to Story
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create New Story Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Start a New Collaborative Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose your story theme:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {storyThemes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`p-4 rounded-lg border transition-all ${
                            selectedTheme === theme.id
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{theme.emoji}</div>
                            <div className="font-medium text-sm">{theme.label}</div>
                            <div className="text-xs text-gray-600 mt-1">{theme.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Story Title *
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-lg"
                          placeholder="Give your story an exciting title..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Story Description *
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded-lg resize-none h-20"
                          placeholder="What is your story about? Help others understand the theme..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Chapter *
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded-lg resize-none h-32"
                          placeholder="Start your story here... Set the scene and introduce the main character or situation..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What kind act inspired this story? *
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-3 border rounded-lg"
                          placeholder="e.g., I saw someone help a friend today"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Story Length Goal
                        </label>
                        <select className="w-full p-3 border rounded-lg">
                          <option value="8">Short Story (8 chapters)</option>
                          <option value="12">Medium Story (12 chapters)</option>
                          <option value="16">Long Story (16 chapters)</option>
                          <option value="20">Epic Story (20 chapters)</option>
                        </select>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🌟 Starting Story Tips</h4>
                        <div className="text-sm space-y-1">
                          <div>• Introduce interesting characters</div>
                          <div>• Set up a problem kindness can solve</div>
                          <div>• Leave room for others to add ideas</div>
                          <div>• Make it relatable to kids' experiences</div>
                          <div>• End with a hook for the next chapter</div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full" size="lg">
                          🚀 Create New Story
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Featured Completed Stories */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Completed Story Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedStories.map((story) => (
                <div key={story.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{story.coverEmoji}</span>
                    <span className="font-semibold">{story.title}</span>
                    <Badge className="bg-green-100 text-green-800">Complete!</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{story.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{story.totalChapters} chapters • {story.participantCount} authors</span>
                    <Button size="sm" variant="outline">
                      📖 Read Full Story
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Write Your Chapter in a Kindness Story?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Every act of kindness can become part of an amazing story. Start writing and see where the community takes it!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                📚 Add to Existing Story
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                🚀 Start New Story
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              ✨ Your kindness inspires stories • 📖 Stories inspire more kindness • 🌟 Together we create magic
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}