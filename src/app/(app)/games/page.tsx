

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gamepad2, Lightbulb, Bomb, Smile, Frown } from 'lucide-react';
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

const EmojiCatch = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [emojis, setEmojis] = useState<{ id: number; x: number; y: number; type: 'positive' | 'negative'; char: string }[]>([]);
  const [catcherX, setCatcherX] = useState(50);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const isGameOverRef = useRef(false);

  const positiveEmojis = ['😊', '😂', '😍', '🥳', '🤩'];
  const negativeEmojis = ['😡', '😭', '🤢', '💀', '👿'];

  const resetGame = useCallback(() => {
    setScore(0);
    setEmojis([]);
    setGameOver(false);
    isGameOverRef.current = false;
    if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(gameTick);
  }, []);

  const gameTick = useCallback(() => {
    if (isGameOverRef.current) {
        if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }

    setEmojis(prev => {
        let newEmojis = [...prev];
        // Create new emojis
        if (Math.random() < 0.05) {
            const type = Math.random() > 0.3 ? 'positive' : 'negative';
            newEmojis.push({
                id: Date.now() + Math.random(),
                x: Math.random() * 90 + 5,
                y: -5,
                type,
                char: type === 'positive'
                    ? positiveEmojis[Math.floor(Math.random() * positiveEmojis.length)]
                    : negativeEmojis[Math.floor(Math.random() * negativeEmojis.length)],
            });
        }

        let hasCollisionOccurred = false;
        // Move emojis and check for collisions
        newEmojis = newEmojis
            .map(emoji => ({ ...emoji, y: emoji.y + 2 }))
            .filter(emoji => {
                const catcherRect = { left: catcherX - 5, right: catcherX + 5, top: 85, bottom: 95 };
                const emojiRect = { left: emoji.x - 2.5, right: emoji.x + 2.5, top: emoji.y - 5, bottom: emoji.y + 5 };

                if (emojiRect.bottom > catcherRect.top && emojiRect.top < catcherRect.bottom && emojiRect.right > catcherRect.left && emojiRect.left < catcherRect.right) {
                    if (emoji.type === 'positive') {
                        setScore(s => s + 10);
                    } else {
                        isGameOverRef.current = true;
                        setGameOver(true);
                        hasCollisionOccurred = true;
                    }
                    return false; // remove emoji
                }
                return emoji.y < 100; // keep emoji if it's on screen
            });

        return newEmojis;
    });

    if (!isGameOverRef.current) {
        gameLoopRef.current = requestAnimationFrame(gameTick);
    }
  }, [catcherX]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newX = ((e.clientX - rect.left) / rect.width) * 100;
        setCatcherX(Math.max(5, Math.min(95, newX)));
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    resetGame();

    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resetGame]);
  
  if (gameOver) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-green-100 dark:bg-green-900/50 rounded-lg h-[400px]">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Game Over!</h3>
            <p className="text-xl my-4">Your score: <span className="font-bold">{score}</span></p>
            <Button onClick={resetGame}>Play Again</Button>
        </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center bg-green-100 dark:bg-green-900/50 rounded-lg">
      <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Emoji Catch</h3>
      <p className="text-green-600 dark:text-green-300 mb-2">Catch the good vibes! Score: {score}</p>
      <div ref={gameAreaRef} className="relative w-full h-[400px] bg-green-200 dark:bg-green-800/50 rounded-md overflow-hidden cursor-none">
        {emojis.map(emoji => (
          <div key={emoji.id} className="absolute text-4xl" style={{ left: `${emoji.x}%`, top: `${emoji.y}%`, transform: 'translateX(-50%)' }}>
            {emoji.char}
          </div>
        ))}
        <div className="absolute bottom-0 w-20 h-10 bg-green-500 dark:bg-green-600 rounded-t-lg" style={{ left: `${catcherX}%`, transform: 'translateX(-50%)' }}></div>
      </div>
    </div>
  );
};

const StarBlaster = () => {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [playerX, setPlayerX] = useState(50);
    const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);
    const [targets, setTargets] = useState<{ id: number; x: number; y: number }[]>([]);
    const keysPressedRef = useRef<Record<string, boolean>>({});
    const gameLoopRef = useRef<number>();
    const lastShootTimeRef = useRef(0);
    const SHOOT_COOLDOWN = 200; // ms

    const resetGame = useCallback(() => {
        setScore(0);
        setLevel(1);
        setProjectiles([]);
        setTargets([]);
        setPlayerX(50);
        setGameOver(false);
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, []);

    const gameTick = useCallback((timestamp: number) => {
        if (gameOver) {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            return;
        }

        let newPlayerX = playerX;
        if (keysPressedRef.current['ArrowLeft']) {
            newPlayerX = Math.max(5, newPlayerX - 2.5);
        }
        if (keysPressedRef.current['ArrowRight']) {
            newPlayerX = Math.min(95, newPlayerX + 2.5);
        }

        let newProjectiles = projectiles.map(p => ({ ...p, y: p.y - 5 })).filter(p => p.y > 0);
        if (keysPressedRef.current[' '] && timestamp - lastShootTimeRef.current > SHOOT_COOLDOWN) {
            lastShootTimeRef.current = timestamp;
            const currentLevel = Math.floor(score / 100) + 1;
            if (currentLevel === 1) {
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX, y: 90 });
            } else if (currentLevel === 2) {
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX - 5, y: 90 });
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX + 5, y: 90 });
            } else {
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX - 8, y: 90 });
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX, y: 90 });
                newProjectiles.push({ id: timestamp + Math.random(), x: newPlayerX + 8, y: 90 });
            }
        }

        let newTargets = targets.map(t => ({ ...t, y: t.y + 0.5 }));
        if (Math.random() < 0.03) {
            newTargets.push({ id: timestamp + Math.random() + 1, x: Math.random() * 90 + 5, y: -5 });
        }

        const hitProjectileIds = new Set<number>();
        const hitTargetIds = new Set<number>();
        let scoreToAdd = 0;
        let shouldEndGame = false;

        newProjectiles.forEach(proj => {
            newTargets.forEach(target => {
                if (hitProjectileIds.has(proj.id) || hitTargetIds.has(target.id)) return;
                const distance = Math.sqrt(Math.pow(proj.x - target.x, 2) + Math.pow(proj.y - target.y, 2));
                if (distance < 4) { // Collision radius
                    hitProjectileIds.add(proj.id);
                    hitTargetIds.add(target.id);
                    scoreToAdd += 10;
                }
            });
        });

        newProjectiles = newProjectiles.filter(p => !hitProjectileIds.has(p.id));
        newTargets = newTargets.filter(t => !hitTargetIds.has(t.id));

        newTargets.forEach(target => {
            if (target.y > 100) {
                shouldEndGame = true;
            }
        });
        
        if (shouldEndGame) {
            setGameOver(true);
        } else {
            setPlayerX(newPlayerX);
            setProjectiles(newProjectiles);
            setTargets(newTargets);
            if (scoreToAdd > 0) {
                setScore(s => s + scoreToAdd);
                setLevel(l => Math.floor((score + scoreToAdd) / 100) + 1);
            }
            gameLoopRef.current = requestAnimationFrame(gameTick);
        }
    }, [gameOver, playerX, projectiles, targets, score]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressedRef.current[e.key] = true;
            if (e.key === ' ') e.preventDefault();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressedRef.current[e.key] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        resetGame();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [resetGame]);

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-indigo-100 dark:bg-indigo-900/50 rounded-lg h-[400px]">
                <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">Game Over!</h3>
                <p className="text-xl my-4">Your score: <span className="font-bold">{score}</span></p>
                <Button onClick={resetGame}>Play Again</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">Star Blaster</h3>
            <p className="text-indigo-600 dark:text-indigo-300 mb-2">Score: {score} | Level: {level} | Use Arrow Keys & Spacebar</p>
            <div className="relative w-full h-[400px] bg-gray-800 dark:bg-black rounded-md overflow-hidden cursor-none">
                {/* Player */}
                <div className="absolute bottom-0 w-10 h-5 bg-indigo-400 rounded-t-md" style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}></div>
                
                {/* Projectiles */}
                {projectiles.map(p => (
                    <div key={p.id} className="absolute w-2 h-4 bg-yellow-300 rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translateX(-50%)' }}></div>
                ))}
                
                {/* Targets */}
                {targets.map(t => (
                     <div key={t.id} className="absolute w-6 h-6 bg-red-500 rounded-full" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}></div>
                ))}
            </div>
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
      case 'emoji-catch':
        return <EmojiCatch />;
      case 'star-blaster':
        return <StarBlaster />;
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
