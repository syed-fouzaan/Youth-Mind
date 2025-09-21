'use server';
/**
 * @fileOverview A flow that finds a relevant image based on a user's mood and a descriptive prompt.
 *
 * - generateMoodArt - A function that handles the mood art generation process.
 * - GenerateMoodArtInput - The input type for the generateMoodArt function.
 * - GenerateMoodArtOutput - The return type for the generateMoodArt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMoodArtInputSchema = z.object({
  mood: z.string().describe("The user's current mood."),
  prompt: z.string().describe('A descriptive prompt from the user about their feelings or what they want to see.'),
  language: z.string().optional().describe('The language of the prompt.'),
});
export type GenerateMoodArtInput = z.infer<typeof GenerateMoodArtInputSchema>;

const GenerateMoodArtOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of a relevant, royalty-free image from Unsplash.'),
  altText: z.string().describe('A descriptive alt text for the image.'),
});
export type GenerateMoodArtOutput = z.infer<typeof GenerateMoodArtOutputSchema>;

export async function generateMoodArt(input: GenerateMoodArtInput): Promise<GenerateMoodArtOutput> {
  return generateMoodArtFlow(input);
}

const generateMoodArtFlow = ai.defineFlow(
  {
    name: 'generateMoodArtFlow',
    inputSchema: GenerateMoodArtInputSchema,
    outputSchema: GenerateMoodArtOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `Find a royalty-free image from Unsplash that visually represents the feeling of '${input.mood}' combined with the creative direction: '${input.prompt}'.

      Your response must be a JSON object containing the direct image URL and descriptive alt text.
      IMPORTANT: The imageUrl must be a direct, valid, and publicly accessible link to an image file (e.g., ending in .jpg or from images.unsplash.com), not a link to a webpage.
      The image URL must be in the format: https://images.unsplash.com/photo-<PHOTO_ID>?...
      For example: { "imageUrl": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?...", "altText": "A serene forest path after rain" }`,
      output: {
        schema: GenerateMoodArtOutputSchema,
      },
    });

    if (!output) {
      throw new Error('Image suggestion failed to produce a result.');
    }

    return output;
  }
);
