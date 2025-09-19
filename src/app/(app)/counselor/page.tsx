"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { counselorChat, type CounselorChatOutput } from '@/ai/flows/counselor-chat';

export default function CounselorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{userInput: string, aiResponse: CounselorChatOutput}[]>([]);
  const [userInput, setUserInput] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  async function handleSend() {
    if (!userInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input is empty',
        description: 'Please type a message to the AI counselor.',
      });
      return;
    }

    setIsLoading(true);
    const currentInput = userInput;
    setUserInput('');

    try {
      const response = await counselorChat({ text: currentInput, language: lang });
      setConversation(prev => [...prev, { userInput: currentInput, aiResponse: response }]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response. Please try again.',
      });
      setUserInput(currentInput); // Restore input if error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Counselor
          </CardTitle>
          <CardDescription>
            Talk through your feelings with an AI companion trained to listen and provide supportive guidance. This is a safe space for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto p-4 border rounded-lg bg-muted/50">
              {conversation.length === 0 ? (
                <p className="text-muted-foreground text-center">Your conversation will appear here.</p>
              ) : (
                conversation.map((entry, index) => (
                  <div key={index} className="space-y-4">
                    <div className="text-right">
                      <p className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                        {entry.userInput}
                      </p>
                    </div>
                    <div>
                       <p className="inline-block bg-card rounded-lg p-3 max-w-[80%] border">
                        {entry.aiResponse.response}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
