import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const mockResources = [
  {
    id: 1,
    title: "Understanding Anxiety",
    category: "Anxiety",
    excerpt: "Learn about the common signs of anxiety and discover simple techniques to manage it in your daily life.",
    imageUrl: "https://picsum.photos/seed/resource1/600/400",
    imageHint: "calm nature"
  },
  {
    id: 2,
    title: "The Power of Mindfulness",
    category: "Mindfulness",
    excerpt: "Explore how mindfulness can help you stay present and reduce stress. Includes a simple breathing exercise to get you started.",
    imageUrl: "https://picsum.photos/seed/resource2/600/400",
    imageHint: "meditation sunset"
  },
  {
    id: 3,
    title: "Tips for Better Sleep",
    category: "Wellness",
    excerpt: "Good sleep is crucial for mental health. Find out how to improve your sleep hygiene for more restful nights.",
    imageUrl: "https://picsum.photos/seed/resource3/600/400",
    imageHint: "peaceful night"
  },
  {
    id: 4,
    title: "Creative Expression for Emotions",
    category: "Creativity",
    excerpt: "Discover how art, writing, or music can be powerful outlets for processing your feelings and fostering self-expression.",
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {mockResources.map((resource) => (
          <Card key={resource.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
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
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{resource.excerpt}</p>
            </CardContent>
            <div className="p-6 pt-0">
               <Button variant="outline" className="w-full sm:w-auto">
                Read More <ArrowRight className="ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
