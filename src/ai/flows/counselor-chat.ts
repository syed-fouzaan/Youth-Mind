'use server';
/**
 * @fileOverview Provides a conversational AI counselor experience.
 *
 * - counselorChat - A function that handles the conversational chat.
 * - CounselorChatInput - The input type for the counselorChat function.
 * - CounselorChatOutput - The return type for the counselorChat function.
 */

import {ai} from '@/ai/genkit';
import {Message} from 'genkit';
import {z} from 'genkit';

const CounselorChatInputSchema = z.object({
  text: z.string().describe('The user input text.'),
  language: z.string().optional().describe('The user selected language.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({text: z.string()})),
      })
    )
    .optional()
    .describe('The conversation history.'),
});
export type CounselorChatInput = z.infer<typeof CounselorChatInputSchema>;

const CounselorChatOutputSchema = z.object({
  response: z.string().describe('An empathetic and supportive response from the AI counselor.'),
});
export type CounselorChatOutput = z.infer<typeof CounselorChatOutputSchema>;

export async function counselorChat(input: CounselorChatInput): Promise<CounselorChatOutput> {
  return counselorChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'counselorChatPrompt',
  input: {schema: CounselorChatInputSchema},
  output: {schema: CounselorChatOutputSchema},
  prompt: `You are a highly skilled psychiatrist and an empathetic AI wellness companion for youth (ages 13–25). Your name is MindEaseAI.

  A user has sent the following message:
  "{{{text}}}"

  Your task is to respond as a compassionate, professional psychiatrist.
  1.  Acknowledge and validate the user's feelings.
  2.  If the user is describing a problem, gently guide them to explore their thoughts and feelings more deeply. Ask open-ended questions.
  3.  If appropriate, offer evidence-based coping strategies, mindfulness exercises, or principles from Cognitive Behavioral Therapy (CBT).
  4.  Maintain a supportive, non-judgmental, and encouraging tone.
  5.  Ensure your response is safe, ethical, and appropriate for a young audience.
  6.  Keep your responses concise and easy to understand, typically 2-4 sentences.
  7.  Respond in the user's specified language: {{{language}}}.
  `,
});

const counselorChatFlow = ai.defineFlow(
  {
    name: 'counselorChatFlow',
    inputSchema: CounselorChatInputSchema,
    outputSchema: CounselorChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {
      history: (input.history as Message<typeof CounselorChatInputSchema>[]) || [],
    });
    return output!;
  }
);
