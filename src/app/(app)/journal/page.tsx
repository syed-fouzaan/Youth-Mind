"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PenSquare } from 'lucide-react';
import { generateJournalingPrompt, type GenerateJournalingPromptOutput } from '@/ai/flows/creative-journaling-prompts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const moods = ["Happy", "Sad", "Anxious", "Excited", "Stressed", "Calm", "Angry"];

export default function JournalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<GenerateJournalingPromptOutput | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  async function getPrompt() {
    if (!selectedMood) {
      toast({
        variant: 'destructive',
        title: 'Select a mood',
        description: 'Please select a mood to get a tailored prompt.',
      });
      return;
    }

    setIsLoading(true);
    setPrompt(null);

    try {
      const promptResponse = await generateJournalingPrompt({ mood: selectedMood, language: lang });
      setPrompt(promptResponse);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a journaling prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Creative Journaling</CardTitle>
          <CardDescription>Select a mood to get a personalized journaling prompt and start expressing yourself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select onValueChange={setSelectedMood} value={selectedMood}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select your mood..." />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood} value={mood.toLowerCase()}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={getPrompt} disabled={isLoading || !selectedMood} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Get a Prompt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[150px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Finding inspiration for you...</p>
          </CardContent>
        </Card>
      )}

      {prompt && (
        <Card className="bg-card/80 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Your Journaling Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
              {prompt.prompt}
            </blockquote>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
