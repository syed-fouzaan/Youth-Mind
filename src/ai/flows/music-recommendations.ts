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

const SongSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  url: z.string().url().describe('A direct link to listen to the song (e.g., on YouTube).'),
});

const MusicRecommendationOutputSchema = z.object({
  intro: z.string().describe('A short introductory sentence for the recommendations, in the specified language.'),
  recommendations: z.array(SongSchema).describe('A list of 3-5 music recommendations for the user based on their mood.'),
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

  Based on the user's mood, provide a list of 3-5 music recommendations.
  The recommendations should be suitable for the user's mood and in the specified language.
  For each song, provide a title, artist, and a valid YouTube URL.
  Also provide a short introductory sentence for the recommendations.
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
