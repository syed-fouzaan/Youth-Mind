'use server';
/**
 * @fileOverview Detects the user's mood from text input and provides an empathetic and supportive response.
 *
 * - detectMoodAndRespond - A function that handles the mood detection and response process.
 * - MoodDetectionAndResponseInput - The input type for the detectMoodAndRespond function.
 * - MoodDetectionAndResponseOutput - The return type for the detectMoodAndRespond function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodDetectionAndResponseInputSchema = z.object({
  text: z.string().describe('The user input text.'),
  language: z.string().optional().describe('The user selected language.'),
});
export type MoodDetectionAndResponseInput = z.infer<typeof MoodDetectionAndResponseInputSchema>;

const MoodDetectionAndResponseOutputSchema = z.object({
  mood: z.string().describe('The detected mood of the user.'),
  response: z.string().describe('An empathetic and supportive response.'),
});
export type MoodDetectionAndResponseOutput = z.infer<typeof MoodDetectionAndResponseOutputSchema>;

export async function detectMoodAndRespond(input: MoodDetectionAndResponseInput): Promise<MoodDetectionAndResponseOutput> {
  return detectMoodAndRespondFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodDetectionAndResponsePrompt',
  input: {schema: MoodDetectionAndResponseInputSchema},
  output: {schema: MoodDetectionAndResponseOutputSchema},
  prompt: `You are MindEaseAI, an empathetic AI wellness companion for youth (ages 13–25).

  A user has provided the following text input:
  {{text}}

  Detect the user's mood from the text input. Provide an empathetic and supportive response in the same language as the user input if specified, or english by default. The response should:
  1. Acknowledge the user's feelings.
  2. Offer a brief coping tip, mindfulness exercise, or creative prompt.
  3. Be encouraging and supportive.

  Ensure that the response is appropriate for a young audience and avoids any harmful or unethical content.

  Output the detected mood and the response in JSON format.
  {
    "mood": "detected mood",
    "response": "empathetic and supportive response"
  }`,
});

const detectMoodAndRespondFlow = ai.defineFlow(
  {
    name: 'detectMoodAndRespondFlow',
    inputSchema: MoodDetectionAndResponseInputSchema,
    outputSchema: MoodDetectionAndResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
