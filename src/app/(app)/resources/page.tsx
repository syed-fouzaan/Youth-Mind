import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const mockResources = [
  {
    id: 1,
    title: "The Uninvited Guest Named Anxiety",
    category: "Anxiety",
    excerpt: `Imagine your mind is a peaceful room, and one day, an uninvited guest named **Anxiety** shows up. At first, it just whispers worries, but soon its voice gets louder, making your heart race and your thoughts spin. This guest doesn't play fair; it makes you feel restless, on edge, and can even bring physical signs like a racing heart or trembling hands.

But here's a secret: **you have the power to quiet this guest.**

When Anxiety starts talking, try this trick called the **5-4-3-2-1 Grounding Method**. It's like a secret code to bring you back to the present moment. Pause and find:
*   **5 things you can see** (a book, a tree outside, the color of your socks)
*   **4 things you can touch** (the soft fabric of your shirt, a cool glass of water)
*   **3 things you can hear** (birds chirping, distant traffic, your own steady breath)
*   **2 things you can smell** (a nearby flower, the scent of rain)
*   **1 thing you can taste** (a sip of water, a piece of mint)

With each item you find, you're telling Anxiety, "Not right now. I'm in charge here." This simple act is your first step to reclaiming your peaceful room.`,
    imageUrl: "https://picsum.photos/seed/resource1/600/400",
    imageHint: "calm nature"
  },
  {
    id: 2,
    title: "The Art of Being a Mindful Explorer",
    category: "Mindfulness",
    excerpt: `Picture yourself as an explorer, but instead of charting new lands, you're discovering the world of the **present moment**. This is the art of **Mindfulness**. It’s not about emptying your mind, but about watching your thoughts and feelings drift by like clouds in the sky, without getting caught in a storm.

Being a mindful explorer has incredible rewards:
*   It can **calm the storms** of stress and worry.
*   It sharpens your focus, like a spyglass for your mind.
*   It helps you understand your own heart and emotions better.

Ready for your first expedition? Try this **Mindful Observation** quest:
1.  **Choose an ordinary object:** a pen, a leaf, a simple cup.
2.  **Become a detective:** For one full minute, examine it as if you've never seen it before.
3.  **Notice everything:** Its true colors, the tiny lines and textures, the way light dances on its surface.

You're not just looking at a pen; you're discovering a universe of detail. By focusing completely on one thing, you give your mind a break from its usual chatter. This is mindfulness in action—a small adventure that leads to a great sense of peace.`,
    imageUrl: "https://picsum.photos/seed/resource2/600/400",
    imageHint: "meditation sunset"
  },
  {
    id: 3,
    title: "The Secret World of Sleep",
    category: "Wellness",
    excerpt: `Think of your mind as a bustling city. During the day, it’s full of traffic, noise, and activity. At night, it needs to quiet down for repairs and cleaning. This magical time is called **sleep**, and it's one of the most powerful tools for your well-being.

When you sleep, your brain is like a team of tiny librarians, sorting through the day's events and filing away important memories. It also helps **wash away the stress** and regulate your emotions. Without good sleep, the city of your mind becomes chaotic and prone to traffic jams of sad or anxious thoughts.

Here's the treasure map to the secret world of good sleep:
*   **Set a Rhythm:** Try to go to bed and wake up around the same time each day. Your body loves a predictable schedule.
*   **Create a Calm-Down Hour:** Before bed, put away the bright screens. The blue light from phones is like a loud siren telling your brain to stay awake. Instead, read a book, listen to calming music, or take a warm bath.
*   **Build Your Sleep Cave:** Make your room as dark, quiet, and cool as possible. It signals to your brain that it's time to power down.

Protecting your sleep is like giving your mind a superhero's cape. It prepares you to face the next day with strength, clarity, and calm.`,
    imageUrl: "https://picsum.photos/seed/resource3/600/400",
    imageHint: "peaceful night"
  },
  {
    id: 4,
    title: "Unlocking Your Feelings with Creativity",
    category: "Creativity",
    excerpt: `Sometimes, feelings like sadness or anger are like tangled knots inside you, too messy for words. But what if you could **unlock them without speaking**? This is the magic of **creative expression**. It's not about being a great artist; it’s about letting your emotions flow into something you can see and touch.

Think of it this way:
*   It gives your feelings a **voice** when you can't find the words.
*   It provides a **safe playground** for difficult emotions to be released.
*   It helps you discover things about yourself you never knew.

Ready to become a feelings artist? Here are some ideas:
*   **The Scribble Drawing:** Grab a crayon, close your eyes, and think about how you feel. Let your hand move across the paper, scribbling and looping. Don't try to draw anything specific. Just let the feeling guide your hand. When you're done, look at the shapes and colors. What do you see?
*   **Mood Music:** Create a playlist that tells the story of your day. What song is your morning? What track is your frustration? What melody is your peace?
*   **Word Collage:** Cut out words and pictures from a magazine that jump out at you. Arrange them on a page to create a visual poem about your inner world.

Creativity is your secret key. Use it to unlock the knots inside, turning messy feelings into something beautiful and understood.`,
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
                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: resource.excerpt.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
