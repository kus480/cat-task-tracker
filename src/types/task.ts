export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}

export type CreateTaskDto = Omit<ITask, 'id' | 'status' | 'createdAt'>;
