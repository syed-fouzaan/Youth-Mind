"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { detectMoodAndRespond, type MoodDetectionAndResponseOutput } from '@/ai/flows/mood-detection-and-response';
import { personalizedRecommendations, type PersonalizedRecommendationsOutput } from '@/ai/flows/personalized-recommendations';
import { CrisisDialog } from '@/components/crisis-dialog';

const crisisKeywords = ["suicidal", "self-harm", "can't go on", "end my life", "kill myself"];

const formSchema = z.object({
  moodText: z.string().min(10, { message: 'Please share a bit more about how you are feeling.' }),
});

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<MoodDetectionAndResponseOutput | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodText: '',
    },
  });

  const checkForCrisis = (text: string) => {
    const lowercasedText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowercasedText.includes(keyword));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (checkForCrisis(values.moodText)) {
      setShowCrisisDialog(true);
      return;
    }

    setIsLoading(true);
    setAiResponse(null);
    setRecommendations(null);

    try {
      const moodResponse = await detectMoodAndRespond({ text: values.moodText, language: lang });
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
  }
  
  return (
    <div className="space-y-8 animate-in fade-in-50">
      <CrisisDialog open={showCrisisDialog} onOpenChange={setShowCrisisDialog} />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">How are you feeling today?</CardTitle>
          <CardDescription>Share your thoughts and feelings, and let our AI companion help you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="moodText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Your thoughts</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="For example: I'm feeling a bit anxious about my exams..."
                        className="min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get Insights
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is thinking...</p>
          </CardContent>
        </Card>
      )}

      {aiResponse && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">A Moment of Reflection</CardTitle>
            <CardDescription>Detected Mood: <span className="font-semibold text-primary">{aiResponse.mood}</span></CardDescription>
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
