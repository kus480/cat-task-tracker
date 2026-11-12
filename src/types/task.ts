export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskDate = string;
export type TaskTime = string;

export interface ITask {
  id: string;
  title: string;
  description?: string;
  date: TaskDate;
  time?: TaskTime;
  completed: boolean;
  status: TaskStatus;
  createdAt: string;
}

export type CreateTaskDto = Omit<
  ITask,
  'id' | 'status' | 'completed' | 'date' | 'time' | 'createdAt'
> &
  Partial<Pick<ITask, 'date' | 'time'>>;
