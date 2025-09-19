"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paintbrush, Sparkles } from 'lucide-react';
import { generateMoodArt, type GenerateMoodArtOutput } from '@/ai/flows/mood-art';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ArtTherapyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedArt, setGeneratedArt] = useState<GenerateMoodArtOutput | null>(null);
  const [prompt, setPrompt] = useState('');
  const [userMood, setUserMood] = useState<string | null>(null);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  useEffect(() => {
    try {
      const storedMood = localStorage.getItem('userMood');
      if (storedMood) {
        setUserMood(storedMood);
      }
    } catch (error) {
        console.warn('Could not read mood from localStorage:', error);
    }
  }, []);

  async function getArt() {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please describe what you want to create.',
      });
      return;
    }
    
    if (!userMood) {
        toast({
            variant: 'destructive',
            title: 'Mood not set',
            description: 'Please visit the Mood Tracker page first to set your mood.',
        });
        return;
    }

    setIsLoading(true);
    setGeneratedArt(null);

    try {
      const artResponse = await generateMoodArt({ mood: userMood, prompt, language: lang });
      setGeneratedArt(artResponse);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate art. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Paintbrush className="text-primary" />
            AI Art Therapy
          </CardTitle>
          <CardDescription>
            Express your feelings through art. Describe what's on your mind, and let our AI create a unique image that represents your emotions.
            {userMood && <span className="block mt-1">Current detected mood: <strong className="text-primary capitalize">{userMood}</strong></span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
             <Label htmlFor="art-prompt">Creative Prompt</Label>
             <Textarea
                id="art-prompt"
                placeholder="e.g., 'a quiet forest after the rain' or 'a burst of colors in a dark room'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
                disabled={isLoading}
             />
          </div>
          <Button onClick={getArt} disabled={isLoading || !prompt.trim() || !userMood}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Art
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">The AI is painting your vision...</p>
            <p className="text-sm text-muted-foreground">(This can take up to 30 seconds)</p>
          </CardContent>
        </Card>
      )}

      {generatedArt && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Your Mood-Art</CardTitle>
            <CardDescription>Here is the visual representation of your feelings. Right-click to save.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden border">
                <Image
                    src={generatedArt.imageUrl}
                    alt="Generated mood art"
                    fill
                    className="object-contain"
                />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
