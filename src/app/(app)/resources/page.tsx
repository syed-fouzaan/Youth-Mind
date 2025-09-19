import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const mockResources = [
  {
    id: 1,
    title: "Understanding Anxiety",
    category: "Anxiety",
    excerpt: "Learn about the common signs of anxiety and discover simple techniques to manage it in your daily life. Anxiety can manifest as excessive worry, fear, and nervousness. Common physical symptoms include a rapid heartbeat, sweating, and trembling. One simple technique to manage anxiety is the 4-7-8 breathing exercise: inhale for 4 seconds, hold your breath for 7 seconds, and exhale slowly for 8 seconds. Repeating this can help calm your nervous system.",
    imageUrl: "https://picsum.photos/seed/resource1/600/400",
    imageHint: "calm nature"
  },
  {
    id: 2,
    title: "The Power of Mindfulness",
    category: "Mindfulness",
    excerpt: "Explore how mindfulness can help you stay present and reduce stress. Mindfulness is the practice of paying attention to the present moment without judgment. A simple exercise is to focus on your senses: notice five things you can see, four things you can feel, three things you can hear, two things you can smell, and one thing you can taste. This helps ground you in the present.",
    imageUrl: "https://picsum.photos/seed/resource2/600/400",
    imageHint: "meditation sunset"
  },
  {
    id: 3,
    title: "Tips for Better Sleep",
    category: "Wellness",
    excerpt: "Good sleep is crucial for mental health. Find out how to improve your sleep hygiene for more restful nights. Establish a regular sleep schedule, even on weekends. Create a relaxing bedtime routine, such as reading a book or taking a warm bath. Ensure your bedroom is dark, quiet, and cool. Avoid screens (phones, tablets, TVs) for at least an hour before bed, as the blue light can interfere with sleep.",
    imageUrl: "https://picsum.photos/seed/resource3/600/400",
    imageHint: "peaceful night"
  },
  {
    id: 4,
    title: "Creative Expression for Emotions",
    category: "Creativity",
    excerpt: "Discover how art, writing, or music can be powerful outlets for processing your feelings and fostering self-expression. You don't need to be an artist to benefit. Try journaling your thoughts, doodling whatever comes to mind, or creating a playlist that matches your mood. These activities can provide a healthy escape and a deeper understanding of your emotions.",
    imageUrl: "https://picsum.photos/seed/resource4/600/400",
    imageHint: "art supplies"
  }
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div>
        <h1 className="font-headline text-3xl">Wellness Resources</h1>
        <p className="text-muted-foreground mt-1">Explore articles and guides to support your mental wellness journey.</p>
      </div>

      <Tabs defaultValue={mockResources[0].title} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-auto">
          {mockResources.map((resource) => (
            <TabsTrigger key={resource.id} value={resource.title} className="text-center sm:text-left">{resource.title}</TabsTrigger>
          ))}
        </TabsList>
        {mockResources.map((resource) => (
          <TabsContent key={resource.id} value={resource.title}>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="aspect-video relative rounded-t-lg overflow-hidden -mt-6 -mx-6">
                        <Image
                            src={resource.imageUrl}
                            alt={resource.title}
                            fill
                            className="object-cover"
                            data-ai-hint={resource.imageHint}
                        />
                    </div>
                    <CardTitle className="pt-4">{resource.title}</CardTitle>
                    <CardDescription>{resource.category}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{resource.excerpt}</p>
                </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
