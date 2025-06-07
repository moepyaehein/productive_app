
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Task } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Header } from "@/components/header";
import { TaskForm } from "@/components/task-form";
import { TaskItem } from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, Loader2, ListChecks, User } from "lucide-react";
import { prioritizeTasks, type PrioritizeTasksInput, type Task as AITask } from "@/ai/flows/prioritize-tasks";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const SETTINGS_STORAGE_KEY = 'dailyflow-settings';

export default function HomePage() {
  const { tasks, setTasks, addTask, updateTask, deleteTask, toggleComplete, isInitialized } = useLocalStorage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");

  useEffect(() => {
    // Load user settings from local storage on client mount
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setUserName(parsedSettings.userName || "User");
          setProfilePictureUrl(parsedSettings.profilePictureUrl || "");
        } catch (e) {
          console.error("Failed to parse settings from local storage", e);
          setUserName("User"); // Default in case of error
        }
      } else {
        setUserName("User"); // Default if no settings found
      }
    }
  }, []);

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (taskData: Partial<Task>) => {
    if (taskData.id) {
      updateTask(taskData as Task);
      toast({ title: "Task Updated", description: `"${taskData.title}" has been updated.` });
    } else {
      addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'priority'>);
      toast({ title: "Task Added", description: `"${taskData.title}" has been added.` });
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return (a.priority ?? Infinity) - (b.priority ?? Infinity);
    });
  }, [tasks]);

  const completedTasksCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const handlePrioritizeTasks = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No Tasks",
        description: "Add some tasks before prioritizing.",
        variant: "default",
      });
      return;
    }

    setIsPrioritizing(true);
    try {
      const aiTasksInput: AITask[] = tasks
        .filter(task => !task.completed)
        .map(task => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
          estimatedCompletionTime: task.estimatedCompletionTime || "1",
      }));

      if (aiTasksInput.length === 0) {
        toast({ title: "All tasks completed!", description: "No pending tasks to prioritize."});
        setIsPrioritizing(false);
        return;
      }

      const prioritizedAITasks = await prioritizeTasks({ tasks: aiTasksInput } as PrioritizeTasksInput);
      
      const priorityMap = new Map<string, number>();
      prioritizedAITasks.forEach((aiTask, index) => {
        priorityMap.set(aiTask.id, index + 1);
      });

      const updatedTasks = tasks.map(task => {
        const newPriority = priorityMap.get(task.id);
        if (newPriority !== undefined) {
          return { ...task, priority: newPriority, updatedAt: Date.now() };
        }
        return { ...task, priority: task.completed ? Infinity : (task.priority || Infinity) };
      });
      
      setTasks(updatedTasks);
      toast({
        title: "Tasks Prioritized",
        description: "Your tasks have been re-ordered by AI.",
      });

    } catch (error) {
      console.error("Error prioritizing tasks:", error);
      toast({
        title: "Prioritization Failed",
        description: "Could not prioritize tasks at this time.",
        variant: "destructive",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };


  if (!isInitialized) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 mb-4" /> {/* Skeleton for profile area */}
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Profile Display Section */}
        {userName && (
            <div className="mb-8 flex items-center gap-4 p-4 bg-card rounded-lg shadow">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profilePictureUrl} alt={userName} />
                <AvatarFallback>
                  {userName && userName !== "User" ? userName.substring(0, 2).toUpperCase() : <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-2xl font-semibold font-headline">
                  Welcome back, {userName === "User" ? "there" : userName}!
                </p>
                <p className="text-sm text-muted-foreground">Ready to organize your day?</p>
              </div>
            </div>
          )}

        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-semibold font-headline">Your Tasks</h2>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenForm()} aria-label="Add new task">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Task
            </Button>
            <Button variant="outline" onClick={handlePrioritizeTasks} disabled={isPrioritizing} aria-label="Prioritize tasks with AI">
              {isPrioritizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ListFilter className="mr-2 h-5 w-5" />}
              Prioritize
            </Button>
          </div>
        </div>

        {totalTasksCount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-primary">{`${Math.round(progressPercentage)}%`}</span>
            </div>
            <Progress value={progressPercentage} className="w-full" aria-label={`Task completion progress: ${Math.round(progressPercentage)}%`} />
          </div>
        )}

        {sortedTasks.length === 0 ? (
          <Alert>
            <ListChecks className="h-4 w-4"/>
            <AlertTitle>No Tasks Yet!</AlertTitle>
            <AlertDescription>
              Click "Add Task" to get started and organize your day.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onEdit={handleOpenForm}
                onDelete={(id) => {
                  deleteTask(id);
                  toast({ title: "Task Deleted", description: "The task has been removed." });
                }}
              />
            ))}
          </div>
        )}
      </main>
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
    </>
  );
}
