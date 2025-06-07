"use client";

import type { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CalendarDays, Tag, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const { id, title, description, completed, dueDate, labels, estimatedCompletionTime } = task;

  return (
    <Card className={cn("mb-4 transition-all duration-300 ease-in-out", completed ? "bg-muted/50 opacity-70" : "bg-card")}>
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        <Checkbox
          id={`task-${id}`}
          checked={completed}
          onCheckedChange={() => onToggleComplete(id)}
          aria-label={`Mark task ${title} as ${completed ? 'incomplete' : 'complete'}`}
          className="mt-1 shrink-0"
        />
        <div className="flex-1">
          <CardTitle className={cn("text-lg leading-tight", completed && "line-through text-muted-foreground")}>
            {title}
          </CardTitle>
          {description && (
            <p className={cn("text-sm text-muted-foreground mt-1", completed && "line-through")}>
              {description}
            </p>
          )}
        </div>
      </CardHeader>
      {(dueDate || labels?.length || estimatedCompletionTime) && (
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {dueDate && (
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Due: {format(parseISO(dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
            {estimatedCompletionTime && (
               <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Est. Time: {estimatedCompletionTime} hr(s)</span>
              </div>
            )}
            {labels && labels.length > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-2 h-4 w-4" />
                <div className="flex flex-wrap gap-1">
                  {labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
      <CardFooter className="flex justify-end space-x-2 p-4 pt-0">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)} aria-label={`Edit task ${title}`}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(id)} aria-label={`Delete task ${title}`}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
