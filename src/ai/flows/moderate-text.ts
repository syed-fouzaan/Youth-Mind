'use server';
/**
 * @fileOverview A flow that moderates user-generated text for safety.
 *
 * - moderateText - A function that checks text for harmful content.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTextInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the text is considered safe or not.'),
  reason: z.string().optional().describe('The reason why the text was flagged, if it was not safe.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `Review the following text for harmful content such as hate speech, harassment, self-harm, or sexually explicit material appropriate for a youth wellness app.
      Text: "${input.text}"
      Is this text safe? Respond in JSON.`,
      output: {
        schema: z.object({
          isSafe: z.boolean(),
          reason: z.string().optional(),
        }),
      },
      config: {
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      }
    });

    if (!output) {
      return { isSafe: false, reason: 'Analysis failed.' };
    }

    return output;
  }
);
