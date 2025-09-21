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
    // 1. Create a detailed prompt for the image generation model.
    const fullPrompt = `Generate a piece of digital art that visually represents the feeling of '${input.mood}'. The user has provided the following creative direction: '${input.prompt}'. The art should be abstract, visually striking, and suitable for a youth audience.`;

    // 2. Call the image generation model.
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: fullPrompt,
    });
    
    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed. The model did not return an image.");
    }

    // 3. Return the image URL and alt text.
    return {
      imageUrl: imageUrl,
      altText: `AI-generated art representing: ${input.mood} - ${input.prompt}`,
    };
  }
);
