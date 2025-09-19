'use server';
/**
 * @fileOverview A flow that suggests music tailored to the user's detected mood.
 *
 * - getMusicRecommendation - A function that suggests music tailored to the user's detected mood.
 * - MusicRecommendationInput - The input type for the getMusicRecommendation function.
 * - MusicRecommendationOutput - The return type for the getMusicRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MusicRecommendationInputSchema = z.object({
  mood: z.string().describe('The current mood of the user.'),
  language: z.string().describe('The language for the recommendation.'),
});
export type MusicRecommendationInput = z.infer<typeof MusicRecommendationInputSchema>;

const MusicRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('A music recommendation for the user based on their mood, including genre or style.'),
});
export type MusicRecommendationOutput = z.infer<typeof MusicRecommendationOutputSchema>;

export async function getMusicRecommendation(input: MusicRecommendationInput): Promise<MusicRecommendationOutput> {
  return musicRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'musicRecommendationPrompt',
  input: {schema: MusicRecommendationInputSchema},
  output: {schema: MusicRecommendationOutputSchema},
  prompt: `You are MindEaseAI, an empathetic AI wellness companion for youth.

  Based on the user's mood, provide a music recommendation.
  The recommendation should be a short sentence suggesting a genre or style of music.
  Respond in the user's selected language: {{{language}}}.

  User Mood: {{{mood}}}
  `,
});

const musicRecommendationFlow = ai.defineFlow(
  {
    name: 'musicRecommendationFlow',
    inputSchema: MusicRecommendationInputSchema,
    outputSchema: MusicRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
