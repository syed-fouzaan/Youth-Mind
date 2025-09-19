import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const mockResources = [
  {
    id: 1,
    title: "Understanding Anxiety",
    category: "Anxiety",
    excerpt: `Anxiety is a natural response to stress, but when it becomes persistent and overwhelming, it can interfere with daily life. It often involves feelings of intense worry, fear, or dread about future events.

**Common Signs of Anxiety:**
* **Emotional:** Feeling restless, irritable, or constantly on edge. Difficulty concentrating or your mind going blank.
* **Physical:** Rapid heartbeat, sweating, trembling, feeling weak or tired, stomach upset, or dizziness.

**Practical Techniques to Manage Anxiety:**
* **Grounding (5-4-3-2-1 Method):** When you feel overwhelmed, pause and identify: 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This pulls your focus to the present moment.
* **Progressive Muscle Relaxation:** Tense a group of muscles (like your hands) as you breathe in, and relax them as you breathe out. Work your way through different muscle groups in your body.
* **Mindful Breathing:** Focus on your breath. Inhale slowly for 4 seconds, hold for 4 seconds, and exhale slowly for 6 seconds. This can calm your nervous system.
* **Schedule Worry Time:** Set aside a specific, limited time each day to think about your worries. When anxious thoughts arise outside this time, gently remind yourself you'll deal with them later.`,
    imageUrl: "https://picsum.photos/seed/resource1/600/400",
    imageHint: "calm nature"
  },
  {
    id: 2,
    title: "The Power of Mindfulness",
    category: "Mindfulness",
    excerpt: `Mindfulness is the practice of intentionally paying attention to the present moment without judgment. It's about observing your thoughts, feelings, and bodily sensations as they are, rather than getting swept away by them.

**Benefits of Mindfulness:**
* Reduces stress and anxiety by helping you detach from negative thought patterns.
* Improves focus and attention.
* Enhances emotional regulation and self-awareness.
* Can lead to a greater sense of calm and well-being.

**Simple Mindfulness Exercises:**
* **Mindful Observation:** Choose an object in your room and observe it for a minute. Notice its color, texture, shape, and the way light hits it.
* **Mindful Listening:** Close your eyes and listen to the sounds around you. Try to identify each sound without labeling it as "good" or "bad."
* **Body Scan Meditation:** Lie down and bring your attention to your toes. Notice any sensations without trying to change them. Slowly move your focus up through your body—feet, legs, torso, arms, and head.
* **Mindful Eating:** When you eat, pay full attention to the experience. Notice the colors, smells, textures, and flavors of your food. Eat slowly and savor each bite.`,
    imageUrl: "https://picsum.photos/seed/resource2/600/400",
    imageHint: "meditation sunset"
  },
  {
    id: 3,
    title: "Tips for Better Sleep",
    category: "Wellness",
    excerpt: `Quality sleep is fundamental to mental and physical health. Poor sleep can worsen anxiety, mood swings, and stress. Improving your sleep hygiene can make a significant difference.

**Why Sleep Matters:**
* **Emotional Regulation:** During sleep, your brain processes emotions. A lack of sleep can make you more irritable and emotionally reactive.
* **Cognitive Function:** Sleep is crucial for concentration, problem-solving, and memory.
* **Physical Health:** It supports a healthy immune system and allows your body to repair itself.

**Actionable Tips for Better Sleep:**
* **Consistent Schedule:** Go to bed and wake up around the same time every day, even on weekends. This helps regulate your body's internal clock.
* **Create a Relaxing Routine:** About an hour before bed, do something calming like reading a book, listening to soft music, or taking a warm bath.
* **Optimize Your Environment:** Make sure your bedroom is dark, quiet, and cool. Use blackout curtains or an eye mask if needed.
* **Limit Screen Time:** Avoid phones, tablets, and computers for at least an hour before bed. The blue light they emit can suppress melatonin production, the hormone that controls sleep.
* **Avoid Stimulants:** Steer clear of caffeine and nicotine in the late afternoon and evening.`,
    imageUrl: "https://picsum.photos/seed/resource3/600/400",
    imageHint: "peaceful night"
  },
  {
    id: 4,
    title: "Creative Expression for Emotions",
    category: "Creativity",
    excerpt: `Expressing your emotions through creative outlets can be a powerful way to process feelings that are hard to put into words. It's not about creating a masterpiece; it's about the act of creation itself.

**Why Creative Expression Helps:**
* **Externalizes Feelings:** It moves difficult emotions from inside you to an external form, making them feel more manageable.
* **Provides a Healthy Outlet:** It's a constructive way to deal with feelings like anger, sadness, or frustration.
* **Promotes Self-Discovery:** It can help you understand your own feelings on a deeper level.

**Ways to Get Started:**
* **Journaling:** Write down whatever comes to mind without censoring yourself. You can use prompts, write a letter to someone (that you don't send), or just list things you're grateful for.
* **Doodling and Drawing:** You don't need to be an artist. Simply grab a pen and paper and let your hand move. Draw shapes, patterns, or whatever you feel.
* **Music:** Create a playlist that matches your current mood. If you play an instrument, try improvising. Or, try writing down lyrics that express how you feel.
* **Collage Making:** Cut out pictures and words from old magazines that resonate with you and arrange them on a page. This can be a very symbolic and insightful activity.`,
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
