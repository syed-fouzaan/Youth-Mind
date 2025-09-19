"use client";

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles, Mic, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { counselorChatWithVoice, type CounselorChatWithVoiceOutput } from '@/ai/flows/voice-counselor-chat';

type ConversationEntry = {
  userInput: string;
  detectedTone: string;
  aiResponse: string;
}

export default function CounselorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleSendAudio;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone access denied',
        description: 'Please enable microphone permissions in your browser to use voice input.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const handleSendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      
      try {
        const response: CounselorChatWithVoiceOutput = await counselorChatWithVoice({ audioDataUri: base64Audio, language: lang });
        setConversation(prev => [...prev, {
          userInput: response.userTranscript,
          detectedTone: response.detectedTone,
          aiResponse: response.response,
        }]);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: 'Failed to get a response. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
  };

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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4 border rounded-lg bg-muted/50">
              {conversation.length === 0 ? (
                <p className="text-muted-foreground text-center">Your conversation will appear here. Press the mic to start.</p>
              ) : (
                conversation.map((entry, index) => (
                  <div key={index} className="space-y-4">
                    <div className="text-right">
                       <div className="inline-block bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%] text-left">
                        <p>{entry.userInput}</p>
                        <p className="text-xs opacity-80 mt-1">Tone: {entry.detectedTone}</p>
                      </div>
                    </div>
                    <div>
                       <p className="inline-block bg-card rounded-lg p-3 max-w-[80%] border">
                        {entry.aiResponse}
                      </p>
                    </div>
                  </div>
                ))
              )}
               {isLoading && (
                 <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">AI is thinking...</p>
                 </div>
               )}
            </div>
            <div className="flex justify-center items-center gap-2">
              <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isLoading} size="icon" className="h-16 w-16 rounded-full">
                {isRecording ? <Square /> : <Mic />}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
                {isRecording ? "Tap to stop recording" : (isLoading ? "Processing..." : "Tap the microphone to speak")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
