'use server';
/**
 * @fileOverview Detects mood from a facial image.
 *
 * - detectMoodFromImage - A function that handles the facial mood detection process.
 * - FacialMoodDetectionInput - The input type for the detectMoodFromImage function.
 * - FacialMoodDetectionOutput - The return type for the detectMoodFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FacialMoodDetectionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FacialMoodDetectionInput = z.infer<typeof FacialMoodDetectionInputSchema>;

const FacialMoodDetectionOutputSchema = z.object({
  mood: z.string().describe('The detected mood of the user. One of: happy, sad, angry, fear, disgust, neutral, surprise.'),
});
export type FacialMoodDetectionOutput = z.infer<typeof FacialMoodDetectionOutputSchema>;

export async function detectMoodFromImage(input: FacialMoodDetectionInput): Promise<FacialMoodDetectionOutput> {
  return facialMoodDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'facialMoodDetectionPrompt',
  input: {schema: FacialMoodDetectionInputSchema},
  output: {schema: FacialMoodDetectionOutputSchema},
  prompt: `You are an expert in analyzing facial expressions to determine a person's mood.

  Analyze the following image and determine the user's mood.
  The mood should be one of: happy, sad, angry, fear, disgust, neutral, surprise.

  Image: {{media url=imageDataUri}}`,
});

const facialMoodDetectionFlow = ai.defineFlow(
  {
    name: 'facialMoodDetectionFlow',
    inputSchema: FacialMoodDetectionInputSchema,
    outputSchema: FacialMoodDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
