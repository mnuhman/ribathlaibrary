'use server';
/**
 * @fileOverview A generative AI tool to assist librarians by automatically generating concise, engaging book descriptions or summarizing key plot points based on title and author inputs.
 *
 * - generateBookDescription - A function that handles the book description generation process.
 * - GenerateBookDescriptionInput - The input type for the generateBookDescription function.
 * - GenerateBookDescriptionOutput - The return type for the generateBookDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
});
export type GenerateBookDescriptionInput = z.infer<typeof GenerateBookDescriptionInputSchema>;

const GenerateBookDescriptionOutputSchema = z.object({
  description: z.string().describe('A concise and engaging description of the book.'),
});
export type GenerateBookDescriptionOutput = z.infer<typeof GenerateBookDescriptionOutputSchema>;

export async function generateBookDescription(
  input: GenerateBookDescriptionInput
): Promise<GenerateBookDescriptionOutput> {
  return generateBookDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookDescriptionPrompt',
  input: {schema: GenerateBookDescriptionInputSchema},
  output: {schema: GenerateBookDescriptionOutputSchema},
  prompt: `You are an expert book describer for a library. Your goal is to create concise and engaging book descriptions or summarize key plot points based on the provided title and author.

Generate a description for the following book:

Title: {{{title}}}
Author: {{{author}}}`,
});

const generateBookDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBookDescriptionFlow',
    inputSchema: GenerateBookDescriptionInputSchema,
    outputSchema: GenerateBookDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
