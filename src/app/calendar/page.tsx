
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Task } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Header } from "@/components/header";
import { Calendar } from "@/components/ui/calendar";
import { TaskItem } from "@/components/task-item";
import { format, parseISO, isSameDay, startOfDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarCheck2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function CalendarPage() {
  const { tasks, toggleComplete, deleteTask, updateTask, isInitialized } = useLocalStorage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tasksOnSelectedDate = useMemo(() => {
    if (!selectedDate || !isClient) return [];
    return tasks.filter(task => 
      task.dueDate && isSameDay(parseISO(task.dueDate), selectedDate)
    );
  }, [selectedDate, tasks, isClient]);

  const daysWithTasks = useMemo(() => {
    if (!isClient) return [];
    return tasks
      .filter(task => task.dueDate)
      .map(task => startOfDay(parseISO(task.dueDate as string)));
  }, [tasks, isClient]);

  const handleEditTask = (task: Task) => {
    // For now, redirect to home page with a toast, as TaskForm is modal there.
    // A more integrated solution would involve a global modal or a dedicated edit page.
    toast({
      title: "Edit Task",
      description: `Editing tasks is currently done on the main page. Task: "${task.title}"`,
    });
    // Potentially navigate or open a modal here in a future enhancement.
  };
  
  if (!isInitialized || !isClient) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-8">
          <h2 className="text-2xl font-semibold mb-6 font-headline">Task Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-[350px] w-full rounded-md" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 font-headline">
                Tasks for <Skeleton className="inline-block h-6 w-32" />
              </h3>
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 font-headline">Task Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card p-4 rounded-lg shadow">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
            modifiers={{ highlighted: daysWithTasks }}
             modifiersStyles={{
                highlighted: { 
                  border: "2px solid hsl(var(--primary))",
                 borderRadius: 'var(--radius)',
                },
             }}
             disabled={(date) => date < new Date("1900-01-01")}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline">
              Tasks for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "selected date"}
            </h3>
            {tasksOnSelectedDate.length > 0 ? (
              tasksOnSelectedDate.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onEdit={handleEditTask} // Simplified edit handler for calendar page
                  onDelete={(id) => {
                    deleteTask(id);
                    toast({ title: "Task Deleted", description: "The task has been removed." });
                  }}
                />
              ))
            ) : (
              <Alert>
                <CalendarCheck2 className="h-4 w-4" />
                <AlertTitle>No Tasks</AlertTitle>
                <AlertDescription>
                  There are no tasks scheduled for this day.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
