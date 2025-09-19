'use server';
/**
 * @fileOverview A flow that generates art based on a user's mood and a descriptive prompt.
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
  imageUrl: z.string().describe('The data URI of the generated image.'),
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
    const fullPrompt = `Generate a piece of digital art that visually represents the feeling of '${input.mood}'. The user has provided the following creative direction: '${input.prompt}'. The art should be abstract, visually striking, and suitable for a youth audience.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: fullPrompt,
    });

    if (!media.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
