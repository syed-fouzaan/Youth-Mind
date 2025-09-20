
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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

const EmojiCatch = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [emojis, setEmojis] = useState<{ id: number; x: number; y: number; type: 'positive' | 'negative'; char: string }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();

  // Refs for game state to use in requestAnimationFrame
  const catcherXRef = useRef(50);
  const scoreRef = useRef(score);
  const emojisRef = useRef(emojis);
  const gameOverRef = useRef(gameOver);

  const positiveEmojis = ['😊', '😂', '😍', '🥳', '🤩'];
  const negativeEmojis = ['😡', '😭', '🤢', '💀', '👿'];

  const resetGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setEmojis([]);
    emojisRef.current = [];
    setGameOver(false);
    gameOverRef.current = false;
    
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(gameTick);
  }, []);

  const gameTick = useCallback(() => {
    if (gameOverRef.current) {
        setGameOver(true);
        if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }

    let newEmojis = [...emojisRef.current];
    let newScore = scoreRef.current;
    
    // Move emojis and check for collisions
    newEmojis = newEmojis
        .map(emoji => ({ ...emoji, y: emoji.y + 1 }))
        .filter(emoji => {
            if (emoji.y > 100) return false;
            
            const catcherRect = { left: catcherXRef.current - 5, right: catcherXRef.current + 5, top: 85, bottom: 95 };
            const emojiRect = { left: emoji.x - 2.5, right: emoji.x + 2.5, top: emoji.y - 5, bottom: emoji.y + 5 };

            if (emojiRect.bottom > catcherRect.top && emojiRect.top < catcherRect.bottom && emojiRect.right > catcherRect.left && emojiRect.left < catcherRect.right) {
                if (emoji.type === 'positive') {
                    newScore += 10;
                } else {
                    gameOverRef.current = true;
                }
                return false; // remove emoji
            }
            return true;
        });

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

    emojisRef.current = newEmojis;
    scoreRef.current = newScore;
    setEmojis(newEmojis);
    setScore(newScore);

    gameLoopRef.current = requestAnimationFrame(gameTick);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newX = ((e.clientX - rect.left) / rect.width) * 100;
        catcherXRef.current = Math.max(5, Math.min(95, newX));
      }
    };
    
    resetGame();
    const currentRef = gameAreaRef.current;
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if(currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
      }
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
        <div className="absolute bottom-0 w-20 h-10 bg-green-500 dark:bg-green-600 rounded-t-lg" style={{ left: `${catcherXRef.current}%`, transform: 'translateX(-50%)' }}></div>
        {emojis.map(emoji => (
          <div key={emoji.id} className="absolute text-4xl" style={{ left: `${emoji.x}%`, top: `${emoji.y}%`, transform: 'translateX(-50%)' }}>
            {emoji.char}
          </div>
        ))}
      </div>
    </div>
  );
};

const MindfulSlice = () => {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [items, setItems] = useState<{ id: number; x: number; y: number; vx: number; vy: number; type: 'positive' | 'negative'; char: string }[]>([]);
    const gameLoopRef = useRef<number>();
    const gameOverRef = useRef(false);

    const positiveEmojis = ['😊', '✨', '💖', '🎉', '🌟'];
    const negativeEmojis = ['😠', '⛈️', '💀', '🔥', '👿'];

    const resetGame = useCallback(() => {
        setScore(0);
        setItems([]);
        setGameOver(false);
        gameOverRef.current = false;
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, []);

    const gameTick = useCallback(() => {
        if(gameOverRef.current) {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            setGameOver(true);
            return;
        }

        setItems(prevItems => {
            let newItems = prevItems
                .map(item => ({ ...item, x: item.x + item.vx, y: item.y + item.vy, vy: item.vy + 0.05 }))
                .filter(item => item.y < 110);

            if (Math.random() < 0.04) {
                const type = Math.random() > 0.4 ? 'negative' : 'positive';
                newItems.push({
                    id: Date.now() + Math.random(),
                    x: Math.random() * 80 + 10,
                    y: 110,
                    vy: -3 - Math.random() * 1.5,
                    vx: Math.random() * 2 - 1,
                    type: type,
                    char: type === 'negative'
                        ? negativeEmojis[Math.floor(Math.random() * negativeEmojis.length)]
                        : positiveEmojis[Math.floor(Math.random() * positiveEmojis.length)],
                });
            }
            return newItems;
        });

        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, []);

    const handleSlice = (id: number, type: 'positive' | 'negative') => {
        if (gameOverRef.current) return;

        if (type === 'negative') {
            setScore(s => s + 10);
            setItems(items => items.filter(item => item.id !== id));
        } else {
            gameOverRef.current = true;
        }
    };
    
    useEffect(() => {
        resetGame();
        return () => {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [resetGame]);

    if (gameOver) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-100 dark:bg-red-900/50 rounded-lg h-[400px]">
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-200">Game Over!</h3>
            <p className="text-xl my-4">You sliced a positive thought! Your score: <span className="font-bold">{score}</span></p>
            <Button onClick={resetGame}>Play Again</Button>
        </div>
      )
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Mindful Slice</h3>
            <p className="text-purple-600 dark:text-purple-300 mb-2">Slice the negative thoughts, avoid the positive ones! Score: {score}</p>
            <div className="relative w-full h-[400px] bg-purple-200 dark:bg-purple-800/50 rounded-md overflow-hidden cursor-crosshair">
                {items.map(item => (
                    <div 
                        key={item.id} 
                        className="absolute text-5xl cursor-pointer select-none" 
                        style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                        onMouseEnter={() => handleSlice(item.id, item.type)}
                    >
                        {item.char}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PathToCalm = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameLoopRef = useRef<number>();
    
    const playerRef = useRef<{ x: number; y: number; width: number; height: number; } | null>(null);
    const pathRef = useRef<{x: number, width: number}[]>([]);
    const frameRef = useRef(0);
    const gameOverRef = useRef(false);

    const resetGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setScore(0);
        setGameOver(false);
        gameOverRef.current = false;
        frameRef.current = 0;
        
        playerRef.current = { x: canvas.width / 2, y: canvas.height - 30, width: 20, height: 20 };
        pathRef.current = [];
        for (let i = 0; i < canvas.height; i++) {
            pathRef.current.push({ x: canvas.width / 2, width: 80 });
        }
        
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, []);

    const gameTick = useCallback(() => {
        if(gameOverRef.current) {
            setGameOver(true);
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const player = playerRef.current;
        if (!canvas || !ctx || !player) return;

        frameRef.current++;

        // Move path up
        pathRef.current.shift();
        
        // Add new path segment
        const lastSegment = pathRef.current[pathRef.current.length - 1];
        let newX = lastSegment.x + (Math.random() - 0.5) * 8;
        if (newX < 50) newX = 50;
        if (newX > canvas.width - 50) newX = canvas.width - 50;
        pathRef.current.push({x: newX, width: 80});
        
        // Player collision
        const playerPathSegment = pathRef.current[Math.floor(player.y)];
        if (player.x < playerPathSegment.x - playerPathSegment.width / 2 || player.x > playerPathSegment.x + playerPathSegment.width / 2) {
            gameOverRef.current = true;
        }
        
        setScore(s => s + 1);

        // Draw
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background') || '#FFF';
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#1a202c' : '#E0F2F1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = isDark ? '#B2DFDB' : '#80CBC4';
        for (let i = 0; i < pathRef.current.length; i++) {
            const seg = pathRef.current[i];
            ctx.fillRect(seg.x - seg.width / 2, i, seg.width, 1);
        }
        
        ctx.fillStyle = isDark ? '#FFFFFF' : '#00796B';
        ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
        
        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            if (playerRef.current) {
                const rect = canvas.getBoundingClientRect();
                playerRef.current.x = e.clientX - rect.left;
            }
        };

        resetGame();
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [resetGame]);

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-teal-100 dark:bg-teal-900/50 rounded-lg h-[400px]">
                <h3 className="text-2xl font-bold text-teal-800 dark:text-teal-200">Game Over!</h3>
                <p className="text-xl my-4">You strayed from the path. Your score: <span className="font-bold">{score}</span></p>
                <Button onClick={resetGame}>Try Again</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-teal-100 dark:bg-teal-900/50 rounded-lg">
            <h3 className="text-2xl font-bold text-teal-800 dark:text-teal-200">Path to Calm</h3>
            <p className="text-teal-600 dark:text-teal-300 mb-2">Stay on the path. Score: {score}</p>
            <canvas ref={canvasRef} width="500" height="350" className="bg-white dark:bg-gray-800 rounded-md cursor-none"></canvas>
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
    } catch (error) => {
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
      case 'mindful-slice':
        return <MindfulSlice />;
      case 'path-to-calm':
        return <PathToCalm />;
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

    