"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createThread, type NewThread, type Thread } from '@/lib/support-services';
import { Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';

const allTags = ["anxiety", "school", "stress", "social", "lonely", "positivity", "celebration", "happy", "sad", "angry"];

interface CreateThreadFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onThreadCreated: (newThread: Thread) => void;
}

export function CreateThreadForm({ isOpen, onOpenChange, onThreadCreated }: CreateThreadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
        if (selectedTags.length < 3) {
            setSelectedTags([...selectedTags, tag]);
        } else {
            toast({
                variant: 'destructive',
                title: "Tag Limit Reached",
                description: "You can select up to 3 tags.",
            });
        }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || selectedTags.length === 0) {
        toast({
            variant: 'destructive',
            title: "Missing fields",
            description: "Please fill out the title, content, and select at least one tag.",
        });
        return;
    }
    
    setIsLoading(true);

    try {
        const newThread: NewThread = { title, content, tags: selectedTags };
        const createdThread = await createThread(newThread);
        
        toast({
            title: "Success!",
            description: "Your thread has been posted.",
        });

        onThreadCreated(createdThread);
        // Reset form
        setTitle('');
        setContent('');
        setSelectedTags([]);

    } catch (error: any) {
        console.error("Failed to create thread:", error);
        toast({
            variant: 'destructive',
            title: "Error creating post",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Share what's on your mind with the community. Your post is anonymous.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="A short, clear title"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              placeholder="Share your thoughts and experiences here."
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
                Tags
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
                {allTags.map(tag => (
                    <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                        onClick={() => !isLoading && handleTagClick(tag)}
                        className="cursor-pointer"
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post Anonymously
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
