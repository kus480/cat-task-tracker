import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CreateTaskDto, ITask, TaskStatus } from '../types/task';
import { TaskContext } from './TaskContext';

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useLocalStorage<ITask[]>(
    'task-tracker-tasks',
    [],
  );

  const addTask = useCallback(
    (task: CreateTaskDto) => {
      const newTask: ITask = {
        ...task,
        id: crypto.randomUUID(),
        status: 'todo',
        createdAt: new Date().toISOString(),
      };

      setTasks((currentTasks) => [...currentTasks, newTask]);
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (taskId: ITask['id']) => {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    },
    [setTasks],
  );

  const updateTaskStatus = useCallback(
    (taskId: ITask['id'], updates: Partial<Pick<ITask, 'status'>>) => {
      if (updates.status === undefined) {
        return;
      }

      const status: TaskStatus = updates.status;
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, status } : task,
        ),
      );
    },
    [setTasks],
  );

  const contextValue = useMemo(
    () => ({ tasks, addTask, deleteTask, updateTaskStatus }),
    [tasks, addTask, deleteTask, updateTaskStatus],
  );

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}
