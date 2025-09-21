import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';

const features = [
  {
    title: 'Real-time Mood Tracker',
    description: 'Uses your camera to detect your mood, helping you build self-awareness.',
    imageUrl: 'https://picsum.photos/seed/feature1/600/400',
    imageHint: 'face recognition technology'
  },
  {
    title: 'AI Counselor',
    description: 'Have a voice conversation with an empathetic AI companion to talk through your feelings.',
    imageUrl: 'https://picsum.photos/seed/feature2/600/400',
    imageHint: 'voice wave abstract'
  },
  {
    title: 'Career Navigator',
    description: 'Get a personalized career and education roadmap with a visual flowchart.',
    imageUrl: 'https://picsum.photos/seed/feature3/600/400',
    imageHint: 'flowchart diagram'
  },
  {
    title: 'AI Art Therapy',
    description: 'Express your emotions by generating unique AI art based on your mood and prompts.',
    imageUrl: 'https://picsum.photos/seed/feature4/600/400',
    imageHint: 'digital art canvas'
  },
  {
    title: 'Wellness Games',
    description: 'Play games designed to help with different moods like anxiety, stress, and sadness.',
    imageUrl: 'https://picsum.photos/seed/feature5/600/400',
    imageHint: 'fun game controller'
  },
  {
    title: 'Peer Support Community',
    description: 'Connect anonymously with other users, share experiences, and offer support.',
    imageUrl: 'https://picsum.photos/seed/feature6/600/400',
    imageHint: 'community people connecting'
  },
  {
    title: 'Creative Journaling',
    description: 'Receive personalized prompts to inspire self-reflection and creative writing.',
    imageUrl: 'https://picsum.photos/seed/feature7/600/400',
    imageHint: 'journal writing'
  },
  {
    title: 'Wellness Resources',
    description: 'Explore a library of articles and guides on mental wellness topics.',
    imageUrl: 'https://picsum.photos/seed/feature8/600/400',
    imageHint: 'library books'
  }
];

export default function FeaturesPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold flex items-center justify-center gap-3">
          <Star className="w-8 h-8 text-primary" />
          Features
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Everything you need for your mental wellness journey.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative aspect-video w-full">
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint={feature.imageHint}
              />
            </div>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
