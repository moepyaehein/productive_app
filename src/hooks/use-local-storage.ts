"use client";

import type { Task } from '@/types';
import { useState, useEffect, useCallback } from 'react';

const TASKS_STORAGE_KEY = 'dailyflow-tasks';

export function useLocalStorage() {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
          setTasksState(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error reading tasks from local storage:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  const updateLocalStorage = useCallback((updatedTasks: Task[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      } catch (error) {
        console.error("Error writing tasks to local storage:", error);
      }
    }
  }, []);

  const setTasks = useCallback((newTasks: Task[] | ((prevTasks: Task[]) => Task[])) => {
    setTasksState(prevTasks => {
      const updated = typeof newTasks === 'function' ? newTasks(prevTasks) : newTasks;
      updateLocalStorage(updated);
      return updated;
    });
  }, [updateLocalStorage]);

  const addTask = useCallback((newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'priority'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: newTaskData.dueDate ? new Date(newTaskData.dueDate).getTime() : Date.now() + 1000000000, // Default priority
    };
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      return updatedTasks;
    });
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((updatedTaskData: Partial<Task> & { id: string }) => {
    setTasks(prevTasks => 
      prevTasks.map(task =>
        task.id === updatedTaskData.id ? { ...task, ...updatedTaskData, updatedAt: Date.now() } : task
      )
    );
  }, [setTasks]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, [setTasks]);

  const toggleComplete = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed, updatedAt: Date.now() } : task
      )
    );
  }, [setTasks]);

  return { tasks, setTasks, addTask, updateTask, deleteTask, toggleComplete, isInitialized };
}
