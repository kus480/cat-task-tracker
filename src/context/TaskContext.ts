import { createContext } from 'react';
import type { CreateTaskDto, ITask, TaskDate } from '../types/task';
import type { Weekday } from '../utils/taskDate';

type TaskStatusUpdate = Partial<Pick<ITask, 'status' | 'completed'>>;

export interface TaskContextValue {
  tasks: ITask[];
  addTask: (task: CreateTaskDto) => void;
  deleteTask: (taskId: ITask['id']) => void;
  updateTaskStatus: (
    taskId: ITask['id'],
    updates: TaskStatusUpdate,
  ) => void;
  getTasksForDate: (date: TaskDate) => ITask[];
  getTasksForCurrentWeekday: (weekday: Weekday) => ITask[];
  countTasksForDate: (date: TaskDate) => number;
  countTasksForCurrentWeekday: (weekday: Weekday) => number;
}

export const TaskContext = createContext<TaskContextValue | undefined>(
  undefined,
);
