import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Coffee, 
  MapPin, 
  DollarSign, 
  Lightbulb, 
  MessageCircle, 
  RefreshCw,
  Heart,
  BookOpen,
  Camera,
  Utensils,
  Mountain,
  Music
} from 'lucide-react';

interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  location_type: string;
  cost_level: string;
}

interface Icebreaker {
  id: string;
  question: string;
  category: string;
}

const DateIdeas = () => {
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [icebreakers, setIcebreakers] = useState<Icebreaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIcebreaker, setCurrentIcebreaker] = useState<Icebreaker | null>(null);
  const { toast } = useToast();

  const categoryIcons = {
    casual: Heart,
    active: Mountain,
    cultural: Camera,
    food: Utensils,
    study: BookOpen,
    adventure: Mountain
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'on-campus': return '🏫';
      case 'near-campus': return '🚶‍♀️';
      case 'city': return '🏙️';
      case 'virtual': return '💻';
      default: return '📍';
    }
  };

  useEffect(() => {
    fetchDateIdeas();
    fetchIcebreakers();
  }, []);

  const fetchDateIdeas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('date_ideas')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading date ideas",
        description: "Please try again later",
        variant: "destructive"
      });
    } else {
      setDateIdeas(data || []);
    }
    setLoading(false);
  };

  const fetchIcebreakers = async () => {
    const { data, error } = await supabase
      .from('icebreakers')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading icebreakers:', error);
    } else {
      setIcebreakers(data || []);
      if (data && data.length > 0) {
        setCurrentIcebreaker(data[Math.floor(Math.random() * data.length)]);
      }
    }
  };

  const getRandomIcebreaker = () => {
    if (icebreakers.length > 0) {
      const randomIcebreaker = icebreakers[Math.floor(Math.random() * icebreakers.length)];
      setCurrentIcebreaker(randomIcebreaker);
      toast({
        title: "New conversation starter! 💬",
        description: "Perfect for breaking the ice!"
      });
    }
  };

  const copyIcebreaker = () => {
    if (currentIcebreaker) {
      navigator.clipboard.writeText(currentIcebreaker.question);
      toast({
        title: "Copied to clipboard! 📋",
        description: "Ready to use in your chat!"
      });
    }
  };

  const filterDateIdeas = (category: string) => {
    return dateIdeas.filter(idea => category === 'all' || idea.category === category);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Date Ideas & Icebreakers ✨
        </h1>
        <p className="text-muted-foreground">
          Perfect conversation starters and date ideas for university students
        </p>
      </div>

      <Tabs defaultValue="icebreakers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="icebreakers" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Icebreakers
          </TabsTrigger>
          <TabsTrigger value="date-ideas" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Date Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="icebreakers" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Conversation Starter
              </CardTitle>
              <CardDescription>
                Great questions to break the ice and start meaningful conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentIcebreaker ? (
                <div className="text-center space-y-4">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <p className="text-lg text-foreground font-medium leading-relaxed">
                      "{currentIcebreaker.question}"
                    </p>
                    <Badge variant="outline" className="mt-3 capitalize">
                      {currentIcebreaker.category}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={getRandomIcebreaker}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      New Question
                    </Button>
                    <Button
                      onClick={copyIcebreaker}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Copy to Use
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading conversation starters...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use Icebreakers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">💬</div>
                  <h4 className="font-medium mb-1">Start Conversations</h4>
                  <p className="text-muted-foreground">Perfect for new matches or when conversation stalls</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🤔</div>
                  <h4 className="font-medium mb-1">Learn About Each Other</h4>
                  <p className="text-muted-foreground">Discover interests, values, and personality</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">💡</div>
                  <h4 className="font-medium mb-1">Keep It Natural</h4>
                  <p className="text-muted-foreground">Use as inspiration, adapt to your style</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="date-ideas" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['all', 'casual', 'study', 'food', 'active'].map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => {}}
                className="capitalize"
              >
                {category === 'all' ? 'All Ideas' : category}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading amazing date ideas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterDateIdeas('all').map((idea) => {
                const IconComponent = categoryIcons[idea.category as keyof typeof categoryIcons] || Heart;
                
                return (
                  <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg leading-tight">
                            {idea.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {idea.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {idea.category}
                        </Badge>
                        <Badge className={`text-xs ${getCostColor(idea.cost_level)}`}>
                          {idea.cost_level === 'free' ? 'Free' : `${idea.cost_level} cost`}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getLocationIcon(idea.location_type)}</span>
                        <span className="capitalize">{idea.location_type.replace('-', ' ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  💡 Pro Tips for Great University Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Start with low-pressure activities like coffee or study dates</li>
                      <li>• Take advantage of free campus events and activities</li>
                      <li>• Consider your schedules - study dates can be productive</li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Group dates can be less intimidating for first meetings</li>
                      <li>• Campus locations are convenient and safe</li>
                      <li>• Be flexible with student budgets - many great dates are free!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DateIdeas;