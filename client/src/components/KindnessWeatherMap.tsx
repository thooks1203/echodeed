import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sun, 
  Cloud, 
  CloudRain,
  CloudSnow,
  Zap,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Users,
  Heart,
  Thermometer
} from 'lucide-react';

interface WeatherZone {
  id: string;
  name: string;
  type: 'classroom' | 'area' | 'building';
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';
  kindnessLevel: number; // 0-100
  recentActivity: number;
  needsAttention: boolean;
  lastUpdated: string;
  description: string;
  suggestions: string[];
  coordinates: { x: number; y: number };
}

interface WeatherEvent {
  id: string;
  type: 'sunshine-burst' | 'kindness-storm' | 'drought-alert' | 'rainbow-moment';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  impact: 'positive' | 'needs-help' | 'celebration';
}

const weatherTypes = {
  sunny: { 
    icon: Sun, 
    label: 'Sunny', 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-100',
    description: 'Lots of kindness happening!'
  },
  'partly-cloudy': { 
    icon: Cloud, 
    label: 'Partly Cloudy', 
    color: 'text-blue-400', 
    bg: 'bg-blue-100',
    description: 'Some kindness, could use more'
  },
  cloudy: { 
    icon: Cloud, 
    label: 'Cloudy', 
    color: 'text-gray-500', 
    bg: 'bg-gray-100',
    description: 'Limited kindness activity'
  },
  rainy: { 
    icon: CloudRain, 
    label: 'Rainy', 
    color: 'text-blue-600', 
    bg: 'bg-blue-200',
    description: 'Needs kindness support'
  },
  stormy: { 
    icon: Zap, 
    label: 'Stormy', 
    color: 'text-red-500', 
    bg: 'bg-red-100',
    description: 'Urgent kindness needed'
  }
};

const sampleZones: WeatherZone[] = [
  {
    id: '1',
    name: 'Mrs. Johnson\'s 3rd Grade',
    type: 'classroom',
    weather: 'sunny',
    kindnessLevel: 92,
    recentActivity: 15,
    needsAttention: false,
    lastUpdated: '2024-12-09T14:30:00Z',
    description: 'Amazing kindness energy! Students are actively helping each other.',
    suggestions: ['Keep up the great work!', 'Share strategies with other classrooms'],
    coordinates: { x: 20, y: 30 }
  },
  {
    id: '2',
    name: 'Main Playground',
    type: 'area',
    weather: 'partly-cloudy',
    kindnessLevel: 67,
    recentActivity: 8,
    needsAttention: false,
    lastUpdated: '2024-12-09T12:15:00Z',
    description: 'Good inclusion during games, but some isolated students.',
    suggestions: ['Organize inclusive group activities', 'Add kindness monitors'],
    coordinates: { x: 60, y: 70 }
  },
  {
    id: '3',
    name: 'Cafeteria',
    type: 'area',
    weather: 'cloudy',
    kindnessLevel: 45,
    recentActivity: 3,
    needsAttention: true,
    lastUpdated: '2024-12-09T11:45:00Z',
    description: 'Some table exclusion noticed. Students eating alone.',
    suggestions: ['Introduce buddy lunch program', 'Train lunch monitors', 'Create welcoming table signs'],
    coordinates: { x: 40, y: 50 }
  },
  {
    id: '4',
    name: 'Mr. Smith\'s 5th Grade',
    type: 'classroom',
    weather: 'rainy',
    kindnessLevel: 28,
    recentActivity: 1,
    needsAttention: true,
    lastUpdated: '2024-12-09T10:00:00Z',
    description: 'Recent conflicts and low participation in kindness activities.',
    suggestions: ['Implement peer mediation', 'Focus on team-building', 'Individual check-ins'],
    coordinates: { x: 20, y: 80 }
  },
  {
    id: '5',
    name: 'Library',
    type: 'area',
    weather: 'sunny',
    kindnessLevel: 88,
    recentActivity: 12,
    needsAttention: false,
    lastUpdated: '2024-12-09T13:20:00Z',
    description: 'Students helping each other find books and sharing reading spaces.',
    suggestions: ['Continue reading buddy program', 'Expand quiet kindness activities'],
    coordinates: { x: 80, y: 40 }
  },
  {
    id: '6',
    name: 'Bus Loading Zone',
    type: 'area',
    weather: 'stormy',
    kindnessLevel: 15,
    recentActivity: 0,
    needsAttention: true,
    lastUpdated: '2024-12-09T15:30:00Z',
    description: 'Frequent pushing and line-cutting. High stress area.',
    suggestions: ['Add more supervision', 'Create line games', 'Teach waiting skills', 'Assign student helpers'],
    coordinates: { x: 10, y: 10 }
  }
];

const recentEvents: WeatherEvent[] = [
  {
    id: '1',
    type: 'sunshine-burst',
    title: '☀️ Sunshine Burst in Library!',
    description: 'Reading buddies program created 12 acts of kindness in just one hour',
    location: 'Library',
    timestamp: '2024-12-09T13:20:00Z',
    impact: 'celebration'
  },
  {
    id: '2',
    type: 'drought-alert',
    title: '🌵 Kindness Drought Alert',
    description: 'Bus loading zone needs immediate kindness intervention',
    location: 'Bus Loading Zone',
    timestamp: '2024-12-09T15:30:00Z',
    impact: 'needs-help'
  },
  {
    id: '3',
    type: 'rainbow-moment',
    title: '🌈 Rainbow Moment!',
    description: 'Mrs. Johnson\'s class achieved 15 consecutive days of sunny kindness weather',
    location: 'Mrs. Johnson\'s 3rd Grade',
    timestamp: '2024-12-09T14:30:00Z',
    impact: 'celebration'
  }
];

export function KindnessWeatherMap() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const selectedZoneData = selectedZone ? sampleZones.find(z => z.id === selectedZone) : null;

  const overallKindnessLevel = Math.round(
    sampleZones.reduce((sum, zone) => sum + zone.kindnessLevel, 0) / sampleZones.length
  );

  const zonesNeedingHelp = sampleZones.filter(zone => zone.needsAttention).length;
  const sunnyZones = sampleZones.filter(zone => zone.weather === 'sunny').length;

  const getWeatherEmoji = (weather: string) => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'partly-cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      default: return '☁️';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sunshine-burst': return '☀️';
      case 'drought-alert': return '🌵';
      case 'kindness-storm': return '⛈️';
      case 'rainbow-moment': return '🌈';
      default: return '☁️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              🌤️ Kindness Weather Map
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            See the kindness climate across your school in real-time
          </p>
          <p className="text-sm text-gray-500">
            Track where kindness is sunny ☀️ and where it needs more rain 🌧️
          </p>
        </div>

        {/* Weather Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{overallKindnessLevel}%</div>
              <div className="text-sm text-gray-600">Overall Climate</div>
              <div className="text-xs text-gray-500 mt-1">school kindness level</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{sunnyZones}</div>
              <div className="text-sm text-gray-600">Sunny Zones</div>
              <div className="text-xs text-gray-500 mt-1">high kindness areas</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600 mb-2">{zonesNeedingHelp}</div>
              <div className="text-sm text-gray-600">Need Attention</div>
              <div className="text-xs text-gray-500 mt-1">areas needing support</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{recentEvents.length}</div>
              <div className="text-sm text-gray-600">Weather Events</div>
              <div className="text-xs text-gray-500 mt-1">today's updates</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Weather Map
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Forecast & Trends
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Weather Alerts
            </TabsTrigger>
          </TabsList>

          {/* Weather Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    School Kindness Weather Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={autoRefresh ? "default" : "outline"}>
                      {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Map Visualization */}
                  <div className="md:col-span-2">
                    <div className="relative bg-green-50 rounded-lg p-6 h-96 border-2 border-green-200">
                      <div className="absolute top-2 left-2 text-xs text-gray-600 font-medium">
                        🏫 Lincoln Elementary School
                      </div>
                      
                      {sampleZones.map((zone) => {
                        const weatherInfo = weatherTypes[zone.weather];
                        const IconComponent = weatherInfo.icon;
                        
                        return (
                          <button
                            key={zone.id}
                            onClick={() => setSelectedZone(zone.id)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110 ${
                              selectedZone === zone.id ? 'ring-4 ring-blue-400 shadow-lg scale-110' : 'shadow-md'
                            } ${weatherInfo.bg}`}
                            style={{
                              left: `${zone.coordinates.x}%`,
                              top: `${zone.coordinates.y}%`
                            }}
                          >
                            <IconComponent className={`w-6 h-6 ${weatherInfo.color}`} />
                          </button>
                        );
                      })}
                      
                      {/* Legend */}
                      <div className="absolute bottom-2 right-2 bg-white rounded-lg p-3 shadow-md">
                        <div className="text-xs font-medium text-gray-700 mb-2">Weather Legend</div>
                        <div className="space-y-1 text-xs">
                          {Object.entries(weatherTypes).map(([key, info]) => {
                            const IconComponent = info.icon;
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <IconComponent className={`w-3 h-3 ${info.color}`} />
                                <span>{info.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Zone Details */}
                  <div>
                    {selectedZoneData ? (
                      <Card className="h-96">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getWeatherEmoji(selectedZoneData.weather)}
                            {selectedZoneData.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={weatherTypes[selectedZoneData.weather].bg}>
                              {weatherTypes[selectedZoneData.weather].label}
                            </Badge>
                            {selectedZoneData.needsAttention && (
                              <Badge variant="destructive">Needs Attention</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Kindness Level</span>
                              <span className="text-sm font-bold">{selectedZoneData.kindnessLevel}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  selectedZoneData.kindnessLevel >= 80 ? 'bg-green-500' :
                                  selectedZoneData.kindnessLevel >= 60 ? 'bg-yellow-500' :
                                  selectedZoneData.kindnessLevel >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${selectedZoneData.kindnessLevel}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Current Conditions</h4>
                            <p className="text-sm text-gray-700">{selectedZoneData.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Suggestions</h4>
                            <div className="space-y-1">
                              {selectedZoneData.suggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Recent Activity: {selectedZoneData.recentActivity}</span>
                              <span>Updated: {new Date(selectedZoneData.lastUpdated).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="h-96 flex items-center justify-center">
                        <CardContent className="text-center text-gray-500">
                          <MapPin className="w-8 h-8 mx-auto mb-2" />
                          <p>Click on any weather icon on the map to see detailed information about that zone.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast & Trends Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Kindness Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">📈 Improving Areas</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-sm">Library (+12% this week)</div>
                          <div className="text-xs text-gray-600">Reading buddy program showing great results</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-sm">Mrs. Johnson's Class (+8% this week)</div>
                          <div className="text-xs text-gray-600">Consistent kindness activities paying off</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">📉 Areas Needing Support</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-sm">Bus Loading Zone (-5% this week)</div>
                          <div className="text-xs text-gray-600">End-of-day stress increasing conflicts</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-sm">Cafeteria (-2% this week)</div>
                          <div className="text-xs text-gray-600">Table exclusion incidents increasing</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5" />
                    Kindness Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{overallKindnessLevel}°</div>
                      <div className="text-sm text-gray-600">Current School Temperature</div>
                      <div className="text-xs text-gray-500">
                        {overallKindnessLevel >= 80 ? 'Hot kindness weather!' :
                         overallKindnessLevel >= 60 ? 'Warm and pleasant' :
                         overallKindnessLevel >= 40 ? 'Cool, could be warmer' : 'Cold - needs warming up'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Yesterday</span>
                        <span className="font-medium">{overallKindnessLevel - 3}°</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>This Week Avg</span>
                        <span className="font-medium">{overallKindnessLevel - 1}°</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Month Avg</span>
                        <span className="font-medium">{overallKindnessLevel - 8}°</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">7-Day Forecast</div>
                      <div className="grid grid-cols-7 gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                          <div key={day} className="text-center">
                            <div className="text-xs text-gray-600">{day}</div>
                            <div className="text-xs font-medium">{overallKindnessLevel + (index - 3)}°</div>
                            <div className="text-lg">{index < 3 ? '☀️' : index === 3 ? '⛅' : '☁️'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weather Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Weather Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg border-l-4 ${
                      event.impact === 'celebration' ? 'border-green-500 bg-green-50' :
                      event.impact === 'needs-help' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {getEventIcon(event.type)} {event.title}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>📍 {event.location}</span>
                            <span>🕐 {new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        {event.impact === 'needs-help' && (
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Weather Procedures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">⛈️ Stormy Weather Protocol</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Immediate adult intervention required
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Implement conflict resolution strategies
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Deploy peer mediators
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Schedule individual check-ins
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-600">🌧️ Rainy Weather Response</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Increase kindness reminders
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Organize team-building activities
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Provide additional support staff
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Create buddy systems
                      </div>
                    </div>
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