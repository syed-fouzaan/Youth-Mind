
"use client";

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Mic, Square, AlertTriangle } from 'lucide-react';
import { counselorChatWithVoice, type CounselorChatWithVoiceOutput } from '@/ai/flows/voice-counselor-chat';
import {type Message} from 'genkit';


type DisplayableMessage = {
    role: 'user' | 'model';
    text: string;
    tone?: string;
}

export default function CounselorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<DisplayableMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';
  
  useEffect(() => {
    if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
    }

    const checkMicPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setHasMicrophonePermission(false);
            return;
        }
        try {
            // A quick check without fully acquiring the stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the tracks immediately to not keep the mic active
            stream.getTracks().forEach(track => track.stop());
            setHasMicrophonePermission(true);
        } catch (error) {
            setHasMicrophonePermission(false);
        }
    };
    checkMicPermission();

  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);


  const handleStartRecording = async () => {
    if (hasMicrophonePermission === false) {
        toast({
            variant: 'destructive',
            title: 'Microphone access denied',
            description: 'Please enable microphone permissions in your browser to use voice input.',
        });
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophonePermission(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleSendAudio;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasMicrophonePermission(false);
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
      // The onstop event will trigger handleSendAudio
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const handleSendAudio = async () => {
    if (audioChunksRef.current.length === 0) {
        setIsLoading(false);
        return;
    };
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      
      try {
        const history: Message[] = conversation.map(m => ({role: m.role, content: [{text: m.text}]}));

        const response = await counselorChatWithVoice({ audioDataUri: base64Audio, language: lang, history });
        
        const userMessage: DisplayableMessage = {
          role: 'user',
          text: response.userTranscript,
          tone: response.detectedTone,
        };
        const aiMessage: DisplayableMessage = {
          role: 'model',
          text: response.responseText,
        };

        setConversation(prev => [...prev, userMessage, aiMessage]);

        if (audioPlayerRef.current && response.responseAudioDataUri) {
          audioPlayerRef.current.src = response.responseAudioDataUri;
          audioPlayerRef.current.play();
        }

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
            Talk through your feelings with an AI companion that listens and responds with its voice. This is a safe space for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4 border rounded-lg bg-muted/50 min-h-[300px]">
              {hasMicrophonePermission === false ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                    <p className="font-bold text-lg text-foreground">Microphone Access Required</p>
                    <p>Please enable microphone permissions in your browser settings to use this feature.</p>
                </div>
              ) : conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>Your conversation will appear here. Press the mic to start.</p>
                </div>
              ) : (
                conversation.map((entry, index) => (
                    <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`inline-block rounded-lg p-3 max-w-[80%] ${entry.role === 'user' ? 'bg-primary text-primary-foreground text-left' : 'bg-card border'}`}>
                            <p>{entry.text}</p>
                            {entry.role === 'user' && entry.tone && <p className="text-xs opacity-80 mt-1">Tone: {entry.tone}</p>}
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
               <div ref={conversationEndRef} />
            </div>
            <div className="flex justify-center items-center gap-2">
              <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isLoading || hasMicrophonePermission === false} size="icon" className="h-16 w-16 rounded-full">
                {isRecording ? <Square /> : <Mic />}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
                {hasMicrophonePermission === false ? "Microphone access is denied" : (isRecording ? "Tap to stop recording" : (isLoading ? "Processing..." : "Tap the microphone to speak"))}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
