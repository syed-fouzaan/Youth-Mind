"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gamepad2, Lightbulb } from 'lucide-react';
import { getGameSuggestion, type GameSuggestionOutput } from '@/ai/flows/game-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Game Components
const BreathingExercise = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-blue-100 dark:bg-blue-900/50 rounded-lg">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200">Guided Breathing</h3>
        <p className="text-blue-600 dark:text-blue-300 mb-6">Follow the animation to steady your breath.</p>
        <div className="relative flex items-center justify-center w-48 h-48">
          <div className="absolute w-full h-full bg-blue-300 dark:bg-blue-600 rounded-full animate-pulse-slow opacity-50"></div>
          <div className="relative w-32 h-32 bg-blue-400 dark:bg-blue-700 rounded-full flex items-center justify-center animate-breathe">
            <p className="font-semibold text-white">Breathe</p>
          </div>
        </div>
        <style jsx>{`
            @keyframes breathe {
                0%, 100% { transform: scale(0.8); }
                50% { transform: scale(1.1); }
            }
            .animate-breathe {
                animation: breathe 8s ease-in-out infinite;
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.2; }
            }
            .animate-pulse-slow {
                animation: pulse-slow 8s ease-in-out infinite;
            }
        `}</style>
      </div>
    );
};

const GratitudeWall = () => {
    const [entries, setEntries] = useState<string[]>([]);
    const [newEntry, setNewEntry] = useState('');

    useEffect(() => {
        try {
            const storedEntries = localStorage.getItem('gratitude-wall');
            if (storedEntries) {
                setEntries(JSON.parse(storedEntries));
            }
        } catch (error) {
            console.warn('Could not load gratitude entries:', error);
        }
    }, []);

    const addEntry = () => {
        if (!newEntry.trim()) return;
        const updatedEntries = [...entries, newEntry];
        setEntries(updatedEntries);
        setNewEntry('');
        try {
            localStorage.setItem('gratitude-wall', JSON.stringify(updatedEntries));
        } catch (error) {
            console.warn('Could not save gratitude entry:', error);
        }
    };

    return (
      <div className="p-8 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 text-center mb-4">Gratitude Wall</h3>
        <p className="text-yellow-700 dark:text-yellow-300 text-center mb-6">What is something you're grateful for today?</p>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            placeholder="e.g., A sunny morning"
            className="flex-1 p-2 border rounded-md border-yellow-300 dark:bg-yellow-800/50"
          />
          <Button onClick={addEntry} className="bg-yellow-500 hover:bg-yellow-600 text-white">Post</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {entries.map((entry, index) => (
            <div key={index} className="bg-yellow-100 dark:bg-yellow-800/80 p-4 rounded-lg shadow-sm -rotate-2 hover:rotate-0 transition-transform">
              <p className="text-yellow-900 dark:text-yellow-100">{entry}</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && <p className="text-center text-yellow-600 dark:text-yellow-400">Your gratitude posts will appear here.</p>}
      </div>
    );
};


export default function GamesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<GameSuggestionOutput | null>(null);
  const [userMood, setUserMood] = useState<string | null>(null);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  useEffect(() => {
    try {
      const storedMood = localStorage.getItem('userMood');
      if (storedMood) {
        setUserMood(storedMood);
        fetchSuggestion(storedMood);
      }
    } catch (error) {
        console.warn('Could not read mood from localStorage:', error);
    }
  }, [lang]);

  const fetchSuggestion = async (mood: string) => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const response = await getGameSuggestion({ mood, language: lang });
      setSuggestion(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a game suggestion. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderGame = () => {
    if (!suggestion) return null;
    switch (suggestion.gameId) {
      case 'breathing':
        return <BreathingExercise />;
      case 'gratitude':
        return <GratitudeWall />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Gamepad2 className="text-primary" />
            Wellness Games
          </CardTitle>
          <CardDescription>
            Take a short break with a calming activity. We've suggested a game for you based on your current mood.
            {userMood && <span className="block mt-1">Current detected mood: <strong className="text-primary capitalize">{userMood}</strong></span>}
          </CardDescription>
        </CardHeader>
        {!userMood && (
            <CardContent>
                <p className="text-muted-foreground">Visit the Mood Tracker page to get a personalized game suggestion!</p>
            </CardContent>
        )}
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Picking the right game for you...</p>
          </CardContent>
        </Card>
      )}

      {suggestion && (
        <>
            <Alert className="bg-accent/50 border-accent">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{suggestion.title}</AlertTitle>
                <AlertDescription>
                    {suggestion.description}
                </AlertDescription>
            </Alert>

            <Card className="animate-in fade-in-50">
                <CardContent className="p-4 sm:p-6">
                    {renderGame()}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
