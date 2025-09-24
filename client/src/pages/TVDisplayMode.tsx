import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  School2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KindnessPost {
  id: string;
  content: string;
  category?: string;
  location?: string;
  heartsCount?: number;
  createdAt: string;
}

interface TVSettings {
  rotationSpeed: number; // seconds
  showHearts: boolean;
  showLocation: boolean;
  showCategory: boolean;
  schoolName: string;
  theme: 'light' | 'dark' | 'blue' | 'green';
  autoPlay: boolean;
}

export default function TVDisplayMode() {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<TVSettings>({
    rotationSpeed: 8,
    showHearts: true,
    showLocation: true,
    showCategory: true,
    schoolName: 'Burlington Christian Academy',
    theme: 'blue',
    autoPlay: true
  });

  // Fetch kindness posts
  const { data: posts = [], isLoading } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      const data = await response.json();
      // Filter out posts that are too short or empty
      return data.filter((post: any) => post.content && post.content.trim().length > 10);
    },
    refetchInterval: 30000 // Refresh every 30 seconds for new posts
  });

  // Auto-rotate posts
  useEffect(() => {
    if (!isPlaying || !posts.length || settings.rotationSpeed === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPostIndex((prev) => (prev + 1) % posts.length);
    }, settings.rotationSpeed * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, posts.length, settings.rotationSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextPost(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPost(1);
          break;
        case 'f':
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
        case 's':
          e.preventDefault();
          setShowSettings(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const nextPost = useCallback((direction: number) => {
    if (!posts.length) return;
    setCurrentPostIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return posts.length - 1;
      if (next >= posts.length) return 0;
      return next;
    });
  }, [posts.length]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsFullscreen(false);
  }, []);

  // Theme colors
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-gray-900',
          primary: 'bg-gray-800',
          text: 'text-white',
          accent: 'text-purple-400'
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-900 to-indigo-900',
          primary: 'bg-blue-800/50',
          text: 'text-white',
          accent: 'text-blue-300'
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-800 to-emerald-900',
          primary: 'bg-green-700/50',
          text: 'text-white',
          accent: 'text-green-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
          primary: 'bg-white/80',
          text: 'text-gray-900',
          accent: 'text-blue-600'
        };
    }
  };

  const currentPost = posts[currentPostIndex];
  const themeColors = getThemeColors(settings.theme);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-xl ${themeColors.text}`}>Loading kindness posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg} relative overflow-hidden`}>
      {/* Background Sparkles Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              repeatDelay: Math.random() * 2
            }}
          >
            <Sparkles className={`w-4 h-4 ${themeColors.accent}`} />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <School2 className={`w-8 h-8 ${themeColors.accent}`} />
            <h1 className={`text-3xl font-bold ${themeColors.text}`}>
              {settings.schoolName}
            </h1>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Heart className="w-4 h-4 mr-1 text-red-500" />
            Kindness Wall
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {posts.length > 0 && (
            <Badge variant="outline" className={themeColors.text}>
              {currentPostIndex + 1} of {posts.length}
            </Badge>
          )}
          {!isFullscreen && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={themeColors.text}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className={themeColors.text}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-lg z-50 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Display Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">School Name</label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rotation Speed (seconds)</label>
                <Select
                  value={settings.rotationSpeed.toString()}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, rotationSpeed: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="8">8 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="0">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="blue">Ocean Blue</SelectItem>
                    <SelectItem value="green">Forest Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showHearts}
                    onChange={(e) => setSettings(prev => ({ ...prev, showHearts: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Show Heart Counts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showLocation}
                    onChange={(e) => setSettings(prev => ({ ...prev, showLocation: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Show Locations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showCategory}
                    onChange={(e) => setSettings(prev => ({ ...prev, showCategory: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Show Categories</span>
                </label>
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-600 mb-2">Keyboard Controls:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>Spacebar: Play/Pause</li>
                  <li>← → : Navigate posts</li>
                  <li>F or F11: Fullscreen</li>
                  <li>S: Settings</li>
                  <li>ESC: Exit fullscreen</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        {posts.length === 0 ? (
          <div className="text-center">
            <Heart className={`w-24 h-24 ${themeColors.accent} mx-auto mb-6 opacity-50`} />
            <h2 className={`text-3xl font-bold ${themeColors.text} mb-4`}>
              Waiting for kindness to bloom...
            </h2>
            <p className={`text-xl ${themeColors.text} opacity-75`}>
              Be the first to share an act of kindness!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPostIndex}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className={`${themeColors.primary} backdrop-blur-sm border-0 shadow-2xl p-8 md:p-12`}>
                  <div className="space-y-6">
                    {/* Post Content */}
                    <motion.p 
                      className={`text-2xl md:text-4xl font-light leading-relaxed ${themeColors.text}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      "{currentPost.content}"
                    </motion.p>

                    {/* Post Meta */}
                    <motion.div 
                      className="flex items-center justify-center gap-6 flex-wrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {settings.showCategory && currentPost.category && (
                        <Badge variant="secondary" className="text-base px-4 py-2">
                          {currentPost.category}
                        </Badge>
                      )}
                      {settings.showLocation && currentPost.location && (
                        <Badge variant="outline" className={`text-base px-4 py-2 ${themeColors.text}`}>
                          {currentPost.location}
                        </Badge>
                      )}
                      {settings.showHearts && currentPost.heartsCount !== undefined && (
                        <div className="flex items-center gap-2">
                          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                          <span className={`text-xl font-semibold ${themeColors.text}`}>
                            {currentPost.heartsCount}
                          </span>
                        </div>
                      )}
                    </motion.div>

                    {/* Timestamp */}
                    <motion.p 
                      className={`text-sm opacity-60 ${themeColors.text}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.6 }}
                    >
                      {new Date(currentPost.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </motion.p>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 p-6 flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => nextPost(-1)}
          disabled={posts.length <= 1}
          className={`${themeColors.text} hover:bg-white/10`}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`${themeColors.text} hover:bg-white/10`}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => setCurrentPostIndex(0)}
          disabled={currentPostIndex === 0 || posts.length === 0}
          className={`${themeColors.text} hover:bg-white/10`}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => nextPost(1)}
          disabled={posts.length <= 1}
          className={`${themeColors.text} hover:bg-white/10`}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Indicator */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {posts.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentPostIndex 
                  ? themeColors.accent.replace('text-', 'bg-')
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {isPlaying && settings.rotationSpeed > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: settings.rotationSpeed, ease: 'linear' }}
            className="h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            style={{ width: '200px' }}
            key={currentPostIndex}
          />
        </div>
      )}
    </div>
  );
}