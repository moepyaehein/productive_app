// prioritize-tasks.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for prioritizing tasks based on estimated completion time and due date.
 *
 * - prioritizeTasks - A function that takes a list of tasks and returns a prioritized list.
 * - Task - The interface for a task object.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the task.'),
  dueDate: z.string().describe('The due date of the task in ISO format (YYYY-MM-DD).'),
  estimatedCompletionTime: z
    .string()
    .describe('The estimated completion time of the task in hours.'),
});

export type Task = z.infer<typeof TaskSchema>;

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('An array of tasks to prioritize.'),
});

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(TaskSchema);

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are a task prioritization expert. Given the following list of tasks, prioritize them based on their due date and estimated completion time. Tasks with earlier due dates and longer estimated completion times should be prioritized higher.

Tasks:
{{#each tasks}}
- Title: {{this.title}}, Due Date: {{this.dueDate}}, Estimated Completion Time: {{this.estimatedCompletionTime}} hours
{{/each}}

Return the tasks in a prioritized order.`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
