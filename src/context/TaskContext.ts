import { createContext } from 'react';
import type { CreateTaskDto, ITask } from '../types/task';

type TaskStatusUpdate = Partial<Pick<ITask, 'status'>>;

export interface TaskContextValue {
  tasks: ITask[];
  addTask: (task: CreateTaskDto) => void;
  deleteTask: (taskId: ITask['id']) => void;
  updateTaskStatus: (
    taskId: ITask['id'],
    updates: TaskStatusUpdate,
  ) => void;
}

export const TaskContext = createContext<TaskContextValue | undefined>(
  undefined,
);
