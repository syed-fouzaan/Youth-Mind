"use client";

import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/career-roadmap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Map, Wand2, Lightbulb, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function RoadmapPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [avoid, setAvoid] = useState('');
  const [roadmap, setRoadmap] = useState<GenerateRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  const handleGenerateRoadmap = async () => {
    if (!interests.trim() || !skills.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please tell us about your interests and skills.',
      });
      return;
    }

    setIsLoading(true);
    setRoadmap(null);

    try {
      const response = await generateRoadmap({
        interests: interests.split(',').map(s => s.trim()),
        skills: skills.split(',').map(s => s.trim()),
        avoid: avoid.split(',').map(s => s.trim()).filter(s => s),
      });
      
      setRoadmap(response);
      
      if (response.flowchart) {
        setNodes(response.flowchart.nodes);
        setEdges(response.flowchart.edges);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate a roadmap. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Map className="text-primary" />
            AI Career Navigator
          </CardTitle>
          <CardDescription>
            Feeling lost? Describe your interests, skills, and what you want to avoid, and our AI will chart a personalized career path for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interests">Your Interests</Label>
              <Input
                id="interests"
                placeholder="e.g., coding, art, science"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Your Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., communication, basic math"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avoid">Things to Avoid (Optional)</Label>
              <Input
                id="avoid"
                placeholder="e.g., long medical school, intense sales"
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGenerateRoadmap} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Building Your Future...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate My Roadmap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is charting your course...</p>
          </CardContent>
        </Card>
      )}

      {roadmap && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Your Personalized Roadmap</CardTitle>
            <CardDescription>Here are the top career tracks we recommend for you. The first one is visualized below.</CardDescription>
          </CardHeader>
          <CardContent>
            {roadmap.explanation && (
                <Alert className="mb-6 bg-accent/50 border-accent">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Why this roadmap?</AlertTitle>
                    <AlertDescription>
                        {roadmap.explanation}
                    </AlertDescription>
                </Alert>
            )}

            <div className="w-full h-[500px] border rounded-lg bg-muted/30">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
            
            <Accordion type="single" collapsible className="w-full mt-6" defaultValue={roadmap.tracks[0]?.id}>
                {roadmap.tracks.map((track) => (
                    <AccordionItem value={track.id} key={track.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4 items-center gap-4">
                                <span className="text-lg font-semibold text-left">{track.name}</span>
                                <Badge>Confidence: {(track.confidence * 100).toFixed(0)}%</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-secondary/30 rounded-b-md space-y-4">
                           <div className="flex flex-wrap gap-2">
                             <p className="text-sm font-semibold">Skills Targeted:</p>
                             {track.skillsTargeted.map(skill => <Badge variant="secondary" key={skill}>{skill}</Badge>)}
                           </div>
                           <div className="flex flex-wrap gap-2">
                             <p className="text-sm font-semibold">Career Outcomes:</p>
                             {track.careerOutcomes.map(outcome => <Badge variant="outline" key={outcome}>{outcome}</Badge>)}
                           </div>
                           
                           <h4 className="font-bold pt-4 text-md">Learning Steps:</h4>
                            <ol className="relative border-l border-gray-400 dark:border-gray-700 ml-2">
                                {track.steps.map(step => (
                                    <li key={step.id} className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                        </span>
                                        <h3 className="flex items-center mb-1 text-lg font-semibold">{step.title}</h3>
                                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">Duration: {step.durationWeeks} weeks</time>
                                        <p className="mb-4 text-sm text-muted-foreground">Resources: {step.resources.join(', ')}</p>
                                        <div>
                                            <h5 className="font-semibold text-sm mb-1">Micro-Actions:</h5>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {step.microActions.map((action, i) => <li key={i}>{action}</li>)}
                                            </ul>
                                        </div>
                                        {step.dependencies && step.dependencies.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Requires: {track.steps.find(s => s.id === step.dependencies![0])?.title || step.dependencies.join(', ')}</p>}
                                    </li>
                                ))}
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
