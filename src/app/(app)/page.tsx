"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';
import { detectMoodAndRespond, type MoodDetectionAndResponseOutput } from '@/ai/flows/mood-detection-and-response';
import { personalizedRecommendations, type PersonalizedRecommendationsOutput } from '@/ai/flows/personalized-recommendations';
import { CrisisDialog } from '@/components/crisis-dialog';
import Link from 'next/link';

const crisisKeywords = ["suicidal", "self-harm", "can't go on", "end my life", "kill myself"];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userMood, setUserMood] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<MoodDetectionAndResponseOutput | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  const checkForCrisis = (text: string) => {
    const lowercasedText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowercasedText.includes(keyword));
  };
  
  const getInsights = async (mood: string) => {
    setIsLoading(true);
    setAiResponse(null);
    setRecommendations(null);

    const moodText = `I'm feeling ${mood} today.`;
    if (checkForCrisis(moodText)) {
      setShowCrisisDialog(true);
      setIsLoading(false);
      return;
    }

    try {
      const moodResponse = await detectMoodAndRespond({ text: moodText, language: lang });
      setAiResponse(moodResponse);

      if (moodResponse.mood) {
        const recsResponse = await personalizedRecommendations({ mood: moodResponse.mood });
        setRecommendations(recsResponse);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response from the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedMood = localStorage.getItem('userMood');
      if (storedMood) {
        setUserMood(storedMood);
        getInsights(storedMood);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
        console.warn('Could not read mood from localStorage:', error);
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="space-y-8 animate-in fade-in-50">
      <CrisisDialog open={showCrisisDialog} onOpenChange={setShowCrisisDialog} />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
          <CardDescription>
            {userMood 
              ? `We've detected your current mood as ${userMood}. Here are some insights for you.`
              : "How are you feeling today? Visit the Mood Tracker to get started."
            }
          </CardDescription>
        </CardHeader>
        {!userMood && !isLoading && (
            <CardContent>
                <Link href="/mood-tracker">
                    <Button>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Go to Mood Tracker
                    </Button>
                </Link>
            </CardContent>
        )}
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is preparing your insights...</p>
          </CardContent>
        </Card>
      )}

      {aiResponse && (
        <Card className="animate-in fade-in-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">A Moment of Reflection</CardTitle>
              <CardDescription>Detected Mood: <span className="font-semibold text-primary">{aiResponse.mood}</span></CardDescription>
            </div>
             <Button variant="ghost" size="icon" onClick={() => userMood && getInsights(userMood)} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{aiResponse.response}</p>
          </CardContent>
        </Card>
      )}

      {recommendations && (
         <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Here's a suggestion for you</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{recommendations.recommendation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
