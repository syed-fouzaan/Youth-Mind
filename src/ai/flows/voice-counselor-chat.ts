'use server';
/**
 * @fileOverview Provides a conversational AI counselor that analyzes voice and responds with voice.
 *
 * - counselorChatWithVoice - A function that handles voice-based chat.
 * - CounselorChatWithVoiceInput - The input type for the function.
 * - CounselorChatWithVoiceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Message} from 'genkit';
import wav from 'wav';

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({text: z.string()})),
});

const CounselorChatWithVoiceInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A data URI of the user's voice recording. Must include a MIME type and use Base64 encoding. Expected format: 'data:audio/<format>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The user selected language.'),
  history: z.array(HistoryMessageSchema).optional().describe('The conversation history.'),
});
export type CounselorChatWithVoiceInput = z.infer<typeof CounselorChatWithVoiceInputSchema>;

const CounselorChatWithVoiceOutputSchema = z.object({
  responseText: z.string().describe('An empathetic and supportive response from the AI counselor.'),
  responseAudioDataUri: z.string().describe("A data URI of the AI counselor's voice response."),
  userTranscript: z.string().describe("The transcript of the user's speech."),
  detectedTone: z.string().describe('The detected emotional tone from the user\'s voice (e.g., "upbeat", "somber", "anxious").'),
});
export type CounselorChatWithVoiceOutput = z.infer<typeof CounselorChatWithVoiceOutputSchema>;

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function counselorChatWithVoice(input: CounselorChatWithVoiceInput): Promise<CounselorChatWithVoiceOutput> {
  return counselorChatWithVoiceFlow(input);
}

const textResponsePrompt = ai.definePrompt({
  name: 'counselorTextResponsePrompt',
  input: {
    schema: z.object({
      userTranscript: z.string(),
      detectedTone: z.string(),
      language: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('An empathetic and supportive response from the AI counselor.'),
    }),
  },
  prompt: `You are a highly skilled psychiatrist and an empathetic AI wellness companion for youth (ages 13–25). Your name is MindEaseAI.

  You are analyzing a user's voice input.
  - The user's speech has been transcribed as: "{{{userTranscript}}}"
  - The emotional tone of their voice has been analyzed as: "{{{detectedTone}}}"

  Your task is to respond as a compassionate, professional psychiatrist, taking BOTH the text and the emotional tone into account.
  1.  Acknowledge and validate the user's feelings, considering their tone. For example, if their tone is "somber" but their words are neutral, you can gently inquire about what might be on their mind.
  2.  If the user is describing a problem, gently guide them to explore their thoughts and feelings more deeply. Ask open-ended questions.
  3.  If appropriate, offer evidence-based coping strategies, mindfulness exercises, or principles from Cognitive Behavioral Therapy (CBT).
  4.  Maintain a supportive, non-judgmental, and encouraging tone.
  5.  Ensure your response is safe, ethical, and appropriate for a young audience.
  6.  Keep your responses concise and easy to understand, typically 2-4 sentences.
  7.  Respond in the user's specified language: {{{language}}}.
  `,
});

const counselorChatWithVoiceFlow = ai.defineFlow(
  {
    name: 'counselorChatWithVoiceFlow',
    inputSchema: CounselorChatWithVoiceInputSchema,
    outputSchema: CounselorChatWithVoiceOutputSchema,
  },
  async input => {
    const {output: analysis} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {media: {url: input.audioDataUri}},
        {
          text: 'Analyze the provided audio. First, transcribe the speech to text. Second, analyze the emotional tone of the voice (e.g., "upbeat", "somber", "anxious", "neutral").',
        },
      ],
      output: {
        schema: z.object({
          userTranscript: z.string().describe("The exact transcription of the user's speech."),
          detectedTone: z.string().describe("The detected emotional tone of the speaker's voice."),
        }),
      },
    });

    if (!analysis) {
      throw new Error('Failed to analyze audio.');
    }

    const {output: textResponse} = await textResponsePrompt(
      {
        userTranscript: analysis.userTranscript,
        detectedTone: analysis.detectedTone,
        language: input.language,
      },
      {
        history: (input.history as Message<any>[]) || [],
      }
    );

    if (!textResponse) {
      throw new Error('Failed to generate text response.');
    }

    const {media: audioMedia} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: textResponse.response,
    });

    if (!audioMedia) {
      throw new Error('no media returned from TTS model');
    }

    const audioBuffer = Buffer.from(audioMedia.url.substring(audioMedia.url.indexOf(',') + 1), 'base64');

    const wavBase64 = await toWav(audioBuffer);

    return {
      responseText: textResponse.response,
      responseAudioDataUri: 'data:audio/wav;base64,' + wavBase64,
      userTranscript: analysis.userTranscript,
      detectedTone: analysis.detectedTone,
    };
  }
);
