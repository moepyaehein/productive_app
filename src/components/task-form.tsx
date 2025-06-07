"use client";

import type { Task } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, SparklesIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { suggestTaskDetails, type SuggestTaskDetailsInput } from "@/ai/flows/suggest-task-details";
import { useToast } from "@/hooks/use-toast";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedCompletionTime: z.string().optional().refine(val => !val || /^\d*\.?\d*$/.test(val), {
    message: "Must be a valid number (e.g., 2 or 1.5)",
  }),
  labels: z.string().optional(), // Comma-separated
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  initialData?: Task | null;
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      estimatedCompletionTime: "",
      labels: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        dueDate: initialData.dueDate ? parseISO(initialData.dueDate) : undefined,
        estimatedCompletionTime: initialData.estimatedCompletionTime || "",
        labels: initialData.labels ? initialData.labels.join(", ") : "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        dueDate: undefined,
        estimatedCompletionTime: "",
        labels: "",
      });
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = (values: TaskFormValues) => {
    const taskData: Partial<Task> = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
      estimatedCompletionTime: values.estimatedCompletionTime || undefined,
      labels: values.labels ? values.labels.split(",").map(label => label.trim()).filter(label => label) : [],
    };
    if (initialData?.id) {
      taskData.id = initialData.id;
    }
    onSubmit(taskData);
    onClose();
  };

  const handleSuggestDetails = async () => {
    const taskDescription = form.getValues("description") || form.getValues("title");
    if (!taskDescription) {
      toast({
        title: "Suggestion Error",
        description: "Please provide a title or description to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestTaskDetails({ taskDescription } as SuggestTaskDetailsInput);
      if (result.suggestedLabels && result.suggestedLabels.length > 0) {
        const currentLabels = form.getValues("labels") || "";
        const newLabels = result.suggestedLabels.join(", ");
        form.setValue("labels", currentLabels ? `${currentLabels}, ${newLabels}` : newLabels, { shouldValidate: true });
      }
      // Subtasks could be handled by adding them to description or a new field if UI supports it
      if (result.suggestedSubtasks && result.suggestedSubtasks.length > 0) {
         const currentDescription = form.getValues("description") || "";
         const subtasksText = "\n\nSuggested Subtasks:\n" + result.suggestedSubtasks.map(s => `- ${s}`).join("\n");
         form.setValue("description", currentDescription + subtasksText, {shouldValidate: true});
      }
      toast({
        title: "AI Suggestions Applied",
        description: "Labels and subtasks (in description) have been updated.",
      });
    } catch (error) {
      console.error("Error suggesting task details:", error);
      toast({
        title: "AI Suggestion Failed",
        description: "Could not get suggestions at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedCompletionTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Est. Time (hrs)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="e.g., 2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="labels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labels (Optional, comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., work, personal, urgent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestDetails} disabled={isSuggesting} className="w-full">
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SparklesIcon className="mr-2 h-4 w-4" />}
              Suggest Details with AI
            </Button>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">{initialData ? "Save Changes" : "Add Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
