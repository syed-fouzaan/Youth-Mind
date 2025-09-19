// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview A flow that suggests coping tips, mindfulness exercises, or creative prompts tailored to the user's detected mood.
 *
 * - personalizedRecommendations - A function that suggests coping tips, mindfulness exercises, or creative prompts tailored to the user's detected mood.
 * - PersonalizedRecommendationsInput - The input type for the personalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the personalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  mood: z.string().describe('The current mood of the user.'),
  language: z.string().optional().describe('The user selected language.'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('A personalized recommendation for the user based on their mood.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function personalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are MindEaseAI, an empathetic AI wellness companion for youth.

  Based on the user's mood, provide a personalized recommendation for a coping tip, mindfulness exercise, or creative prompt.
  Respond in the user's specified language: {{{language}}}.

  User Mood: {{{mood}}}
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
