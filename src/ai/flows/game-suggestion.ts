'use server';
/**
 * @fileOverview A flow that suggests a game based on the user's mood.
 *
 * - getGameSuggestion - A function that suggests a game.
 * - GameSuggestionInput - The input type for the getGameSuggestion function.
 * - GameSuggestionOutput - The return type for the getGameSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GameSuggestionInputSchema = z.object({
  mood: z.string().describe("The user's current mood."),
  language: z.string().optional().describe('The user selected language.'),
});
export type GameSuggestionInput = z.infer<typeof GameSuggestionInputSchema>;

const GameSuggestionOutputSchema = z.object({
  gameId: z
    .enum(['breathing', 'gratitude', 'shooter', 'balloon', 'reaction', 'memory'])
    .describe('The ID of the suggested game.'),
  title: z.string().describe('The title of the suggested game.'),
  description: z.string().describe('A brief, encouraging description of the game and why it might help.'),
});
export type GameSuggestionOutput = z.infer<typeof GameSuggestionOutputSchema>;

export async function getGameSuggestion(input: GameSuggestionInput): Promise<GameSuggestionOutput> {
  return getGameSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getGameSuggestionPrompt',
  input: {schema: GameSuggestionInputSchema},
  output: {schema: GameSuggestionOutputSchema},
  prompt: `You are MindEaseAI, an empathetic AI wellness companion for youth.

Your task is to recommend a simple, calming game based on the user's current mood.
The available games are:
- 'breathing': A guided breathing exercise. Good for moods like 'anxious', 'stressed'.
- 'gratitude': A gratitude wall exercise. Good for moods like 'sad', 'low'.
- 'shooter': A fast-paced target shooting game. Good for 'angry', 'stressed'.
- 'balloon': A gentle balloon popping game. Good for 'sad', 'bored'.
- 'reaction': A simple reaction time test. Good for 'tired', 'unfocused'.
- 'memory': A classic card matching game. Good for 'happy', 'calm', 'neutral'.


Based on the user's mood, select one game ID and provide a title and a short, encouraging description for it in the specified language.

User Mood: {{{mood}}}
Language: {{{language}}}
`,
});

const getGameSuggestionFlow = ai.defineFlow(
  {
    name: 'getGameSuggestionFlow',
    inputSchema: GameSuggestionInputSchema,
    outputSchema: GameSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
