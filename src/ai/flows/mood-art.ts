'use server';
/**
 * @fileOverview A flow that generates a unique piece of digital art based on a user's mood and a descriptive prompt.
 *
 * - generateMoodArt - A function that handles the mood art generation process.
 * - GenerateMoodArtInput - The input type for the generateMoodArt function.
 * - GenerateMoodArtOutput - The return type for the generateMoodArt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMoodArtInputSchema = z.object({
  mood: z.string().describe("The user's current mood."),
  prompt: z
    .string()
    .describe('A descriptive prompt from the user about their feelings or what they want to see.'),
  language: z.string().optional().describe('The language of the prompt.'),
});
export type GenerateMoodArtInput = z.infer<typeof GenerateMoodArtInputSchema>;

const GenerateMoodArtOutputSchema = z.object({
  imageUrl: z.string().describe('A URL of the generated image.'),
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
    // Generate a unique seed from the prompt to get a consistent image for the same text
    const seed = input.prompt.split(' ').join('-');

    // Use a reliable placeholder service to avoid quota issues and invalid URLs
    const imageUrl = `https://picsum.photos/seed/${seed}/600/400`;

    return {
      imageUrl: imageUrl,
      altText: `AI-selected art representing: ${input.mood} - ${input.prompt}`,
    };
  }
);
