'use server';
/**
 * @fileOverview Generates a personalized career and education roadmap.
 *
 * - generateRoadmap - A function that creates a career roadmap based on user inputs.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoadmapInputSchema = z.object({
  interests: z.array(z.string()).describe('A list of the student\'s interests (e.g., "coding", "design").'),
  skills: z.array(z.string()).describe('A list of the student\'s current skills (e.g., "basic math", "communication").'),
  avoid: z.array(z.string()).optional().describe('A list of things the student wants to avoid (e.g., "long medical school").'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
  id: z.string().describe('A unique ID for this step (e.g., "html-css").'),
  title: z.string().describe('The title of the roadmap step (e.g., "Learn HTML & CSS basics").'),
  durationWeeks: z.number().describe('The estimated duration of this step in weeks.'),
  resources: z.array(z.string()).describe('A list of suggested learning resources.'),
  dependencies: z.array(z.string()).optional().describe('A list of step IDs that must be completed before this one.'),
});

const CareerTrackSchema = z.object({
  id: z.string().describe('A unique ID for this career track (e.g., "web-dev").'),
  name: z.string().describe('The name of the career track (e.g., "Web Developer").'),
  confidence: z.number().describe('The AI\'s confidence that this track is a good fit, from 0.0 to 1.0.'),
  steps: z.array(RoadmapStepSchema).describe('A list of the steps involved in this career track.'),
});

const ReactFlowNodeSchema = z.object({
    id: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.object({ label: z.string() }),
    type: z.enum(['input', 'output', 'default']).optional(),
});

const ReactFlowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    animated: z.boolean().optional(),
});

const GenerateRoadmapOutputSchema = z.object({
  roadmapId: z.string().describe('A unique ID for the entire roadmap.'),
  tracks: z.array(CareerTrackSchema).describe('An array of 2-3 recommended career tracks.'),
  flowchart: z.object({
      nodes: z.array(ReactFlowNodeSchema),
      edges: z.array(ReactFlowEdgeSchema),
  }).describe('A flowchart representation of the highest-confidence career track, compatible with React Flow.'),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;


export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor for high school and college students. Your goal is to reduce their stress by providing clear, actionable, and personalized career roadmaps.

  A student has provided the following profile:
  - Interests: {{{interests}}}
  - Current Skills: {{{skills}}}
  - Things to Avoid: {{{avoid}}}

  Based on this profile, your tasks are:
  1.  **Analyze Profile:** Synthesize the student's interests and skills.
  2.  **Recommend Career Tracks:** Identify 2-3 top career tracks that are a good fit. For each track, provide a confidence score (0.0 to 1.0) indicating how good of a match it is.
  3.  **Generate Roadmap Steps:** For each career track, create a step-by-step study and action plan. Each step should be a manageable module of 2-6 weeks, with a title, duration, and a list of online resources (like freeCodeCamp, Coursera, Kaggle, etc.). Define dependencies where one step must be completed before another.
  4.  **Create Flowchart Data:** For the **highest confidence** career track, generate a JSON object representing a simple, left-to-right flowchart for rendering with React Flow. The flowchart should visualize the steps and their dependencies.
      - Create a 'Start' node.
      - For each step in the roadmap, create a node. The node 'id' must match the step 'id'.
      - Create edges connecting the nodes based on the 'dependencies' array. For example, if step 'js-fund' depends on 'html-css', create an edge from 'html-css' to 'js-fund'.
      - Position nodes in a clear, sequential, left-to-right layout. Start node at (0,0). Subsequent nodes should be spaced out horizontally.

  Provide the final output in the specified JSON format.
  `,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
