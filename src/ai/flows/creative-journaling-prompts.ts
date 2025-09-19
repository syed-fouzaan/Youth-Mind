// src/ai/flows/creative-journaling-prompts.ts
'use server';
/**
 * @fileOverview Provides creative journaling prompts to users.
 *
 * - generateJournalingPrompt - A function that generates a journaling prompt.
 * - GenerateJournalingPromptInput - The input type for the generateJournalingPrompt function.
 * - GenerateJournalingPromptOutput - The return type for the generateJournalingPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateJournalingPromptInputSchema = z.object({
  mood: z.string().describe('The current mood of the user.'),
  language: z.string().describe('The language to respond in.'),
});
export type GenerateJournalingPromptInput = z.infer<typeof GenerateJournalingPromptInputSchema>;

const GenerateJournalingPromptOutputSchema = z.object({
  prompt: z.string().describe('A creative journaling prompt.'),
});
export type GenerateJournalingPromptOutput = z.infer<typeof GenerateJournalingPromptOutputSchema>;

export async function generateJournalingPrompt(input: GenerateJournalingPromptInput): Promise<GenerateJournalingPromptOutput> {
  return generateJournalingPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalingPromptPrompt',
  input: {schema: GenerateJournalingPromptInputSchema},
  output: {schema: GenerateJournalingPromptOutputSchema},
  prompt: `You are a creative writing assistant that helps users express their feelings through journaling.

  Generate a creative journaling prompt tailored to the user's mood, which is: {{{mood}}}.
  Respond in the user's selected language: {{{language}}}.

  The prompt should encourage self-reflection and emotional expression.
  The prompt should be no more than two sentences long.
  `,
});

const generateJournalingPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalingPromptFlow',
    inputSchema: GenerateJournalingPromptInputSchema,
    outputSchema: GenerateJournalingPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
