'use server';
/**
 * @fileOverview A flow that generates a unique piece of digital art based on a feature description.
 *
 * - generateImageForFeature - A function that handles the image generation process.
 * - GenerateImageForFeatureInput - The input type for the generateImageForFeature function.
 * - GenerateImageForFeatureOutput - The return type for the generateImageForFeature function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageForFeatureInputSchema = z.object({
  featureTitle: z.string().describe("The title of the feature."),
  featureDescription: z
    .string()
    .describe('A description of the feature for which to generate an image.'),
});
export type GenerateImageForFeatureInput = z.infer<typeof GenerateImageForFeatureInputSchema>;

const GenerateImageForFeatureOutputSchema = z.object({
  imageUrl: z.string().describe('A URL of the generated image.'),
  altText: z.string().describe('A descriptive alt text for the image.'),
});
export type GenerateImageForFeatureOutput = z.infer<typeof GenerateImageForFeatureOutputSchema>;

export async function generateImageForFeature(input: GenerateImageForFeatureInput): Promise<GenerateImageForFeatureOutput> {
  return generateImageForFeatureFlow(input);
}

const generateImageForFeatureFlow = ai.defineFlow(
  {
    name: 'generateImageForFeatureFlow',
    inputSchema: GenerateImageForFeatureInputSchema,
    outputSchema: GenerateImageForFeatureOutputSchema,
  },
  async input => {
    const fullPrompt = `Generate an illustration for a feature in a youth mental wellness app. The feature is '${input.featureTitle}'. Description: '${input.featureDescription}'. The illustration should be in a modern, flat, vector style with a calming color palette. It should be visually appealing and clearly represent the feature's purpose.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: fullPrompt,
    });
    
    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed. The model did not return an image.");
    }

    return {
      imageUrl: imageUrl,
      altText: `Illustration for ${input.featureTitle}`,
    };
  }
);
