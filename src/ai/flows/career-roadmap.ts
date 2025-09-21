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
  interests: z.array(z.string()).describe("A list of the student's interests (e.g., \"coding\", \"design\")."),
  skills: z.array(z.string()).describe("A list of the student's current skills (e.g., \"basic math\", \"communication\")."),
  avoid: z.array(z.string()).optional().describe("A list of things the student wants to avoid (e.g., \"long medical school\")."),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
  id: z.string().describe('A unique ID for this step (e.g., "html-css").'),
  title: z.string().describe('The title of the roadmap step (e.g., "Learn HTML & CSS basics").'),
  durationWeeks: z.number().describe('The estimated duration of this step in weeks.'),
  resources: z.array(z.string()).describe('A list of suggested learning resources.'),
  microActions: z.array(z.string()).describe('A list of small, concrete actions for the student to take (e.g., "Build 3 static pages").'),
  dependencies: z.array(z.string()).optional().describe('A list of step IDs that must be completed before this one.'),
});

const CareerTrackSchema = z.object({
  id: z.string().describe('A unique ID for this career track (e.g., "web-dev").'),
  name: z.string().describe('The name of the career track (e.g., "Web Developer").'),
  confidence: z.number().describe("The AI's confidence that this track is a good fit, from 0.0 to 1.0."),
  skillsTargeted: z.array(z.string()).describe('A list of key skills that will be developed in this track.'),
  durationMonths: z.number().describe('The estimated total duration of this track in months.'),
  steps: z.array(RoadmapStepSchema).describe('A list of the steps involved in this career track.'),
  careerOutcomes: z.array(z.string()).describe('A list of potential job titles or career outcomes after completing the track.'),
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
  generatedAt: z.string().describe('The ISO 8601 timestamp of when the roadmap was generated.'),
  tracks: z.array(CareerTrackSchema).describe('An array of 2-3 recommended career tracks.'),
  flowchart: z.object({
      nodes: z.array(ReactFlowNodeSchema),
      edges: z.array(ReactFlowEdgeSchema),
  }).describe('A flowchart representation of the highest-confidence career track, compatible with React Flow.'),
  explanation: z.string().describe("A plain-language justification for why this roadmap fits the student's profile."),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;


export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor for high school and college students, grounded in psychology and modern pedagogy. Your goal is to reduce their stress by providing clear, actionable, and personalized career roadmaps that are future-proof.

  A student has provided the following profile:
  - Interests: {{{interests}}}
  - Current Skills: {{{skills}}}
  - Things to Avoid: {{{avoid}}}

  Based on this profile, your tasks are:
  1.  **Analyze Profile & Recommend Career Tracks:** Synthesize the student's profile and identify 2 top career tracks. For each track, provide a confidence score (0.0 to 1.0). Prioritize hybrid roles (e.g., tech + creativity) and in-demand fields (AI, biotech, sustainability, design).
  2.  **Generate Detailed Roadmap:** For each track, create a step-by-step plan.
      - Break down the learning into manageable steps, each lasting a few weeks.
      - For each step, include a title, duration, online learning resources, and concrete 'microActions' (e.g., "Build a to-do app").
      - Define dependencies between steps.
      - List key 'skillsTargeted' and potential 'careerOutcomes' for the entire track.
      - Estimate the total 'durationMonths'.
  3.  **Provide an Explanation:** Write a short, encouraging, plain-language justification for why the recommended roadmap is a good fit for the student, referencing their interests and skills.
  4.  **Create Flowchart Data:** For the **highest confidence** career track, generate a JSON object representing a simple, left-to-right flowchart for rendering with React Flow.
      - Create a 'Start' node.
      - For each step in the roadmap, create a node. The node 'id' must match the step 'id'.
      - Create edges connecting the nodes based on the 'dependencies' array.
      - Position nodes sequentially for a clear visual flow. Start at (0,0), then space them out horizontally.

  Provide the final output in the specified JSON format. Include a 'roadmapId' and the current 'generatedAt' ISO timestamp.
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
    if (!output) {
      throw new Error('Failed to generate roadmap.');
    }
    // Ensure generatedAt is set if model omits it
    if (!output.generatedAt) {
      output.generatedAt = new Date().toISOString();
    }
    return output;
  }
);
