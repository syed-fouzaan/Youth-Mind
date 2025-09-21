
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGameSuggestion, type GameSuggestionOutput } from '@/ai/flows/game-suggestion';
import { Loader2, Wand2 } from 'lucide-react';
import Link from 'next/link';

// --- GAME COMPONENTS ---

// Game: Angry Shooter
const AngryShooter = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const targetRef = useRef({ x: Math.random() * 370, y: Math.random() * 370, size: 30 });
    const animationFrameId = useRef<number>();

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!ctx.canvas) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "hsl(var(--destructive))";
        ctx.beginPath();
        ctx.arc(targetRef.current.x, targetRef.current.y, targetRef.current.size, 0, Math.PI * 2);
        ctx.fill();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const gameLoop = () => {
            draw(context);
            animationFrameId.current = requestAnimationFrame(gameLoop);
        };
        gameLoop();

        const handleClick = (e: MouseEvent) => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const dx = (e.clientX - rect.left) - targetRef.current.x;
            const dy = (e.clientY - rect.top) - targetRef.current.y;
            if (Math.sqrt(dx * dx + dy * dy) < targetRef.current.size) {
                setScore(prev => prev + 1);
                targetRef.current = {
                    ...targetRef.current,
                    x: Math.random() * (canvas.width - targetRef.current.size * 2) + targetRef.current.size,
                    y: Math.random() * (canvas.height - targetRef.current.size * 2) + targetRef.current.size,
                };
            }
        };

        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('click', handleClick);
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [draw]);

    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Shooting Game</h3>
            <p className="text-muted-foreground mb-4">Click the red targets to blast them away!</p>
            <p className="font-bold text-xl mb-4">Score: {score}</p>
            <canvas ref={canvasRef} width="400" height="400" className="mx-auto block border rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
    );
};

// Game: Sad Pop
const SadPop = () => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const gameArea = gameAreaRef.current;
        if (!gameArea) return;

        const createBalloon = () => {
            if (!gameAreaRef.current) return;
            const balloon = document.createElement("div");
            balloon.className = "balloon absolute w-[30px] h-[40px] bg-accent rounded-full cursor-pointer";
            balloon.style.left = Math.random() * (gameArea.clientWidth - 30) + "px";
            balloon.style.bottom = "0px";

            balloon.onclick = () => {
                setScore(prev => prev + 1);
                balloon.remove();
            };

            gameArea.appendChild(balloon);

            let start = Date.now();
            const moveUp = () => {
                const elapsed = (Date.now() - start) / 30;
                const newBottom = elapsed * 2;
                if (newBottom > gameArea.clientHeight) {
                    balloon.remove();
                } else {
                    balloon.style.bottom = newBottom + "px";
                    requestAnimationFrame(moveUp);
                }
            }
            requestAnimationFrame(moveUp);
        };

        const timer = setInterval(createBalloon, 1000);
        return () => {
            clearInterval(timer);
            if(gameAreaRef.current) gameAreaRef.current.innerHTML = "";
        };
    }, []);

    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Balloon Pop</h3>
            <p className="text-muted-foreground mb-4">Pop the balloons as they float up.</p>
            <p className="font-bold text-xl mb-4">Score: {score}</p>
            <div ref={gameAreaRef} className="relative w-full max-w-[400px] h-[400px] border rounded-md mx-auto bg-sky-100 dark:bg-sky-900 overflow-hidden" />
        </div>
    );
};

// Game: Tired Reaction
const TiredReaction = () => {
    const [message, setMessage] = useState("Wait for GREEN, then click FAST!");
    const [bgColor, setBgColor] = useState("bg-red-500");
    const reactionStartRef = useRef<number | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    
    const startGame = useCallback(() => {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        setMessage("Wait for GREEN...");
        setBgColor("bg-red-500");
        reactionStartRef.current = null;

        timeoutIdRef.current = setTimeout(() => {
            setBgColor("bg-green-500");
            setMessage("CLICK NOW!");
            reactionStartRef.current = Date.now();
        }, Math.random() * 3000 + 2000);
    }, []);
    
    useEffect(() => {
        startGame();
        return () => {
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        }
    }, [startGame]);

    const handleClick = () => {
        if (reactionStartRef.current) {
            const reactionTime = Date.now() - reactionStartRef.current;
            setMessage(`Reaction Time: ${reactionTime} ms. Click 'Play Again' to retry.`);
            setBgColor("bg-primary");
            reactionStartRef.current = null;
        } else {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                setMessage("Too soon! Click 'Play Again' to retry.");
                setBgColor("bg-yellow-500");
            }
        }
    };

    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Reaction Test</h3>
            <div
                className={`w-full max-w-[400px] h-[300px] border rounded-md mx-auto flex items-center justify-center cursor-pointer text-white font-bold text-2xl transition-colors p-4 ${bgColor}`}
                onClick={handleClick}
            >
                {message}
            </div>
            <Button onClick={startGame} className="mt-4">Play Again</Button>
        </div>
    );
};

// Game: Happy Memory
const HappyMemory = () => {
    const [cards, setCards] = useState<{emoji: string, id: number, flipped: boolean, matched: boolean}[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    const initializeGame = useCallback(() => {
        const emojis = ["😀", "🐶", "🍎", "⚽", "😊", "💖", "🌟", "🎉"];
        const gameCards = [...emojis, ...emojis]
            .sort(() => 0.5 - Math.random())
            .map((emoji, i) => ({ emoji, id: i, flipped: false, matched: false }));
        setCards(gameCards);
        setFlipped([]);
        setMatches(0);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        if (flipped.length === 2) {
            const [firstId, secondId] = flipped;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
                setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c)));
                setMatches(prev => prev + 1);
                setFlipped([]);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c)));
                    setFlipped([]);
                }, 1000);
            }
        }
    }, [flipped, cards]);

    const handleCardClick = (id: number) => {
        if (flipped.length < 2) {
            const card = cards.find(c => c.id === id);
            if (card && !card.flipped && !card.matched) {
                setCards(prev => prev.map(c => (c.id === id ? { ...c, flipped: true } : c)));
                setFlipped(prev => [...prev, id]);
            }
        }
    };

    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Memory Game</h3>
            <p className="text-muted-foreground mb-4">Find all the matching pairs!</p>
            <p className="font-bold text-xl mb-4">Matches: {matches}</p>
            <div className="grid grid-cols-4 gap-4 w-full max-w-sm mx-auto">
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={`aspect-square flex items-center justify-center rounded-md cursor-pointer text-4xl transition-transform ${card.flipped || card.matched ? 'bg-card' : 'bg-secondary'}`}
                        onClick={() => handleCardClick(card.id)}
                    >
                        {(card.flipped || card.matched) ? card.emoji : ''}
                    </div>
                ))}
            </div>
             {matches === 8 && <p className="mt-4 text-green-500 font-bold">You found them all!</p>}
            <Button onClick={initializeGame} className="mt-4">Reset Game</Button>
        </div>
    );
};

// --- Main Page Component ---

const gameMap: Record<string, { component: React.FC; label: string }> = {
    shooter: { component: AngryShooter, label: '😡 Angry → Shooting Game' },
    balloon: { component: SadPop, label: '😢 Sad → Balloon Pop' },
    reaction: { component: TiredReaction, label: '😴 Tired → Reaction Test' },
    memory: { component: HappyMemory, label: '😃 Happy → Memory Game' },
    breathing: { component: () => <p>Breathing exercise coming soon!</p>, label: 'Anxious -> Breathing' },
    gratitude: { component: () => <p>Gratitude exercise coming soon!</p>, label: 'Low -> Gratitude Wall' }
};

const gameMoodMapping: Record<string, string> = {
    happy: 'memory',
    sad: 'balloon',
    angry: 'shooter',
    anxious: 'breathing',
    stressed: 'shooter',
    tired: 'reaction',
    neutral: 'memory',
    surprise: 'memory'
}


export default function GamesPage() {
    const [userMood, setUserMood] = useState<string | null>(null);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'en';

    useEffect(() => {
        try {
            const storedMood = localStorage.getItem('userMood');
            if (storedMood) {
                setUserMood(storedMood);
                const gameIdForMood = gameMoodMapping[storedMood.toLowerCase()];
                if (gameIdForMood) {
                    setSelectedGameId(gameIdForMood);
                } else {
                    setSelectedGameId('memory'); // Default to memory game
                }
            } else {
                setSelectedGameId('memory'); // Default if no mood
            }
        } catch (error) {
            console.warn('Could not read mood from localStorage:', error);
            setSelectedGameId('memory'); // Default on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const GameComponent = selectedGameId ? gameMap[selectedGameId]?.component : null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in-50">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Wellness Games</CardTitle>
                    {userMood ? (
                        <CardDescription>We've suggested a game for your current mood: <strong className="capitalize text-primary">{userMood}</strong>. You can also choose another one.</CardDescription>
                    ) : (
                         <CardDescription>Select a mood to play a game designed to help you feel better.</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={setSelectedGameId} value={selectedGameId ?? ''}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Select a game..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(gameMap).map(([id, { label }]) => (
                            <SelectItem key={id} value={id}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     {!userMood && (
                        <div className="flex items-center gap-4 pt-2">
                             <p className="text-sm text-muted-foreground">Or, get a personalized suggestion:</p>
                             <Link href="/mood-tracker">
                                <Button variant="outline">
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Go to Mood Tracker
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="animate-in fade-in-50">
                <CardContent className="p-4 sm:p-6 min-h-[500px] flex items-center justify-center">
                    {GameComponent ? <GameComponent /> : <p>Please select a game to start.</p>}
                </CardContent>
            </Card>
        </div>
    );
}

    