export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // ISO string YYYY-MM-DD
  estimatedCompletionTime?: string; // In hours, as a string for AI
  labels?: string[];
  subtasks?: string[];
  priority?: number; // Lower number means higher priority
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}
