'use server';

/**
 * @fileOverview Task detail suggestion AI agent.
 *
 * - suggestTaskDetails - A function that handles the task detail suggestion process.
 * - SuggestTaskDetailsInput - The input type for the suggestTaskDetails function.
 * - SuggestTaskDetailsOutput - The return type for the suggestTaskDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskDetailsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest details.'),
});
export type SuggestTaskDetailsInput = z.infer<typeof SuggestTaskDetailsInputSchema>;

const SuggestTaskDetailsOutputSchema = z.object({
  suggestedLabels: z
    .array(z.string())
    .describe('Suggested labels for the task based on the description.'),
  suggestedSubtasks: z
    .array(z.string())
    .describe('Suggested subtasks to break down the task into smaller steps.'),
});
export type SuggestTaskDetailsOutput = z.infer<typeof SuggestTaskDetailsOutputSchema>;

export async function suggestTaskDetails(input: SuggestTaskDetailsInput): Promise<SuggestTaskDetailsOutput> {
  return suggestTaskDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDetailsPrompt',
  input: {schema: SuggestTaskDetailsInputSchema},
  output: {schema: SuggestTaskDetailsOutputSchema},
  prompt: `You are a task management assistant that suggests labels and subtasks for a given task description.

  Based on the task description, provide a list of suggested labels and a list of suggested subtasks to help the user organize and break down the task.

  Task Description: {{{taskDescription}}}
  `,
});

const suggestTaskDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTaskDetailsFlow',
    inputSchema: SuggestTaskDetailsInputSchema,
    outputSchema: SuggestTaskDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
