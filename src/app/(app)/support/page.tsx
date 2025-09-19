import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockThreads = [
  {
    id: 1,
    title: "Feeling overwhelmed with school work",
    author: "User123",
    replies: 12,
    likes: 25,
    tags: ["anxiety", "school"],
    excerpt: "Lately I've been feeling so stressed about my exams and assignments. It feels like I'm drowning. Does anyone else feel this way or have tips?",
  },
  {
    id: 2,
    title: "How to make new friends in college?",
    author: "SocialButterfly99",
    replies: 8,
    likes: 42,
    tags: ["social", "college"],
    excerpt: "I just started college and I'm finding it hard to connect with people. It's a bit lonely. Any advice on making friends in a new place?",
  },
  {
    id: 3,
    title: "A small win today!",
    author: "SunshineSeeker",
    replies: 5,
    likes: 18,
    tags: ["positivity", "celebration"],
    excerpt: "I wanted to share something good! I was feeling down this morning but I went for a walk and it really helped clear my head. Feeling much better now!",
  }
];

export default function SupportPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline text-3xl">Peer Support Community</h1>
          <p className="text-muted-foreground mt-1">Connect with others, share experiences, and find support. You are not alone.</p>
        </div>
        <Button className="w-full sm:w-auto">Start a New Thread</Button>
      </div>

      <div className="space-y-6">
        {mockThreads.map((thread) => (
          <Card key={thread.id} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2">
                <CardTitle className="mt-2 sm:mt-0">{thread.title}</CardTitle>
                <div className="flex gap-2 self-start sm:self-center">
                  {thread.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{thread.author.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>Posted by {thread.author} (Anonymous)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{thread.excerpt}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{thread.replies} Replies</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{thread.likes} Likes</span>
                </div>
              </div>
              <Button variant="outline">View Thread</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
