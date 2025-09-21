
"use client";

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { counselorChat, type CounselorChatOutput } from '@/ai/flows/counselor-chat';
import { Input } from '@/components/ui/input';
import {type Message} from 'genkit';
import { CrisisDialog } from '@/components/crisis-dialog';

type ConversationEntry = {
  role: 'user' | 'model';
  content: { text: string }[];
}

const crisisKeywords = ["suicidal", "self-harm", "can't go on", "end my life", "kill myself"];

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';
  
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  const checkForCrisis = (text: string) => {
    const lowercasedText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowercasedText.includes(keyword));
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
    
    if (checkForCrisis(inputText)) {
      setShowCrisisDialog(true);
      return;
    }

    const userMessage: ConversationEntry = { role: 'user', content: [{text: inputText}] };
    
    // Immediately update the UI with the user's message
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Pass the entire conversation history to the AI
      const response = await counselorChat({ 
          text: userMessage.content[0].text, 
          language: lang, 
          history: conversation as Message[] 
      });
      
      const aiMessage: ConversationEntry = { role: 'model', content: [{text: response.response}] };
      // Update the conversation with the AI's response
      setConversation(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response. Please try again.',
      });
      // If the AI fails, remove the user's last message to allow them to try again.
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[85vh] flex flex-col animate-in fade-in-50">
      <CrisisDialog open={showCrisisDialog} onOpenChange={setShowCrisisDialog} />
      <Card className="shadow-lg flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <MessageCircle className="text-primary" />
            AI Chat Counselor
          </CardTitle>
          <CardDescription>
            Type your thoughts below. The AI is here to listen and help you reflect.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 overflow-y-auto p-4 border-t bg-muted/50">
          {conversation.length === 0 ? (
            <p className="text-muted-foreground text-center">Your conversation will appear here. Start by typing a message.</p>
          ) : (
            conversation.map((entry, index) => (
              <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block rounded-lg p-3 max-w-[80%] ${entry.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                  <p>{entry.content[0].text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
             <div className="flex justify-start items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">AI is typing...</p>
             </div>
           )}
           <div ref={conversationEndRef} />
        </CardContent>
        <CardFooter className="pt-6 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
