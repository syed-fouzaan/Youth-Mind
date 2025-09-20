"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Game: Angry Shooter
const AngryShooter = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const targetRef = useRef({ x: 50, y: 50, size: 30 });
    const animationFrameId = useRef<number>();

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(targetRef.current.x, targetRef.current.y, targetRef.current.size, 0, Math.PI * 2);
        ctx.fill();
        animationFrameId.current = requestAnimationFrame(() => draw(ctx));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        draw(context);

        const handleClick = (e: MouseEvent) => {
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
        const createBalloon = () => {
            const gameArea = gameAreaRef.current;
            if (!gameArea) return;

            const balloon = document.createElement("div");
            balloon.className = "balloon absolute w-[30px] h-[40px] bg-pink-400 rounded-full cursor-pointer";
            balloon.style.left = Math.random() * (gameArea.clientWidth - 30) + "px";
            balloon.style.top = (gameArea.clientHeight - 40) + "px";

            balloon.onclick = () => {
                setScore(prev => prev + 1);
                balloon.remove();
            };

            gameArea.appendChild(balloon);

            let moveUp = setInterval(() => {
                if (parseInt(balloon.style.top) < -40) {
                    balloon.remove();
                    clearInterval(moveUp);
                } else {
                    balloon.style.top = parseInt(balloon.style.top) - 2 + "px";
                }
            }, 30);
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

    const startGame = useCallback(() => {
        setMessage("Wait for GREEN, then click FAST!");
        setBgColor("bg-red-500");
        reactionStartRef.current = null;

        const timeoutId = setTimeout(() => {
            setBgColor("bg-green-500");
            reactionStartRef.current = Date.now();
        }, Math.random() * 3000 + 2000);

        return () => clearTimeout(timeoutId);
    }, []);
    
    useEffect(() => {
        return startGame();
    }, [startGame]);

    const handleClick = () => {
        if (reactionStartRef.current) {
            const reactionTime = Date.now() - reactionStartRef.current;
            setMessage(`Reaction Time: ${reactionTime} ms`);
            reactionStartRef.current = null;
        } else {
            setMessage("Too soon! Click 'Play Again' to retry.");
        }
    };

    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Reaction Test</h3>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div
                className={`w-full max-w-[400px] h-[300px] border rounded-md mx-auto flex items-center justify-center cursor-pointer text-white font-bold text-2xl transition-colors ${bgColor}`}
                onClick={handleClick}
            >
                Click Me!
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
                        className={`aspect-square flex items-center justify-center rounded-md cursor-pointer text-4xl transition-transform transform-gpu ${card.flipped || card.matched ? 'bg-card rotate-y-180' : 'bg-secondary'}`}
                        onClick={() => handleCardClick(card.id)}
                    >
                        {(card.flipped || card.matched) && card.emoji}
                    </div>
                ))}
            </div>
             {matches === 8 && <p className="mt-4 text-green-500 font-bold">You found them all!</p>}
            <Button onClick={initializeGame} className="mt-4">Reset Game</Button>
        </div>
    );
};

const games: Record<string, { component: React.FC; title: string }> = {
    angry: { component: AngryShooter, title: "Shooting Game" },
    sad: { component: SadPop, title: "Balloon Pop" },
    tired: { component: TiredReaction, title: "Reaction Game" },
    happy: { component: HappyMemory, title: "Memory Game" },
};

export default function GamesPage() {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    
    const renderGame = () => {
        if (!selectedGame || !games[selectedGame]) return <p className="text-center text-muted-foreground">Select a mood to start a game.</p>;
        const GameComponent = games[selectedGame].component;
        return <GameComponent />;
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
                        Take a short break with a calming activity. Select a mood to play a game tailored for it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center max-w-xs">
                        <Select onValueChange={setSelectedGame}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your mood..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="angry">😡 Angry</SelectItem>
                                <SelectItem value="sad">😢 Sad</SelectItem>
                                <SelectItem value="tired">😴 Tired</SelectItem>
                                <SelectItem value="happy">😃 Happy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedGame && (
                <Card className="animate-in fade-in-50">
                    <CardContent className="p-4 sm:p-6">
                        {renderGame()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
