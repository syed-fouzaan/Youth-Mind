"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';
import { fetchThreads, type Thread } from '@/lib/support-services';
import { useToast } from '@/hooks/use-toast';
import { CreateThreadForm } from '@/components/create-thread-form';

export default function SupportPage() {
  const [userMood, setUserMood] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedMood = localStorage.getItem('userMood');
        if (storedMood) {
            setUserMood(storedMood.toLowerCase());
        }
    } catch (error) {
        console.warn('Could not read mood from localStorage:', error);
    }
  }, []);
  
  useEffect(() => {
    const loadThreads = async () => {
        setIsLoading(true);
        try {
            const fetchedThreads = await fetchThreads();
            setThreads(fetchedThreads);
        } catch (error) {
            console.error("Failed to fetch threads:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load support threads. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    loadThreads();
  }, [toast]);

  const moodSuggestions: Record<string, string> = {
    happy: "Share your positive vibes! What's making you smile today?",
    sad: "It's okay to feel down. Maybe you could talk about what's on your mind?",
    anxious: "Feeling anxious is tough. How about starting a thread on coping with anxiety?",
    stressed: "Stress is a common challenge. You could share your experience or ask for tips.",
    angry: "Feeling angry? Venting can sometimes help. What's bothering you?",
    calm: "Feeling calm is wonderful. You could share your peace and what helps you stay centered."
  };

  const filteredThreads = userMood
    ? threads.filter(thread => thread.tags.includes(userMood))
    : threads;
  
  const displayThreads = filteredThreads.length > 0 ? filteredThreads : threads;
  
  const handleThreadCreated = (newThread: Thread) => {
    setThreads(prev => [newThread, ...prev]);
    setIsFormOpen(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline text-3xl">Peer Support Community</h1>
          <p className="text-muted-foreground mt-1">Connect with others, share experiences, and find support. You are not alone.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>Start a New Thread</Button>
      </div>
      
      <CreateThreadForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onThreadCreated={handleThreadCreated}
      />

      {userMood && moodSuggestions[userMood] && (
        <Alert className="bg-accent/50 border-accent">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Feeling {userMood}?</AlertTitle>
            <AlertDescription>
                {moodSuggestions[userMood]}
            </AlertDescription>
        </Alert>
      )}

      {userMood && filteredThreads.length > 0 && (
          <p className="text-sm text-muted-foreground">We've highlighted some threads based on your current mood.</p>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading community threads...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayThreads.map((thread) => (
            <Card key={thread.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2">
                  <CardTitle className="mt-2 sm:mt-0">{thread.title}</CardTitle>
                  <div className="flex gap-2 self-start sm:self-center">
                    {thread.tags.map(tag => (
                      <Badge key={tag} variant={userMood === tag ? "default" : "secondary"}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{thread.author.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>Posted by {thread.author} (Anonymous)</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{thread.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{thread.replies} Replies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{thread.likes} Likes</span>
                  </div>
                </div>
                <Button variant="outline">View Thread</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
