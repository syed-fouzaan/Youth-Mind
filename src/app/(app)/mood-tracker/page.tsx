"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Smile, AlertTriangle } from 'lucide-react';
import { detectMoodFromImage, type FacialMoodDetectionOutput } from '@/ai/flows/facial-mood-detection';

export default function MoodTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }

  }, [toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && hasCameraPermission && !isProcessing) {
        captureAndProcessFrame();
      }
    }, 5000); // Process every 5 seconds

    return () => clearInterval(interval);
  }, [hasCameraPermission, isProcessing]);

  async function captureAndProcessFrame() {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setIsProcessing(false);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result: FacialMoodDetectionOutput = await detectMoodFromImage({ imageDataUri });
      if (result && result.mood) {
        setDetectedMood(result.mood);
      }
    } catch (error) {
      console.error('Mood detection error:', error);
       toast({
        variant: 'destructive',
        title: 'Mood Detection Failed',
        description: 'Could not analyze the frame. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Real-time Mood Tracker</CardTitle>
          <CardDescription>Our AI is analyzing your expression to understand your mood. This is processed securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video w-full max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden"></canvas>
            {hasCameraPermission === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Initializing camera...</p>
              </div>
            )}
            
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 p-4">
                 <AlertTriangle className="h-10 w-10 text-destructive" />
                 <p className="mt-4 text-center font-semibold text-destructive">Camera access is required.</p>
                 <p className="text-center text-sm text-destructive/80">Please allow camera permissions in your browser to use the mood tracker.</p>
              </div>
            )}
             {(isProcessing && hasCameraPermission) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 text-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}
          </div>
          
          {hasCameraPermission === false && (
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  This feature needs access to your camera to function. Please enable camera permissions in your browser settings and refresh the page.
                </AlertDescription>
              </Alert>
          )}

          {detectedMood && (
            <div className="text-center pt-4 animate-in fade-in">
              <p className="text-muted-foreground">Detected Mood</p>
              <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2 capitalize">
                <Smile /> {detectedMood}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
