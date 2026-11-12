import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CreateTaskDto, ITask, TaskDate, TaskStatus } from '../types/task';
import {
  countTasksForCurrentWeekday as countWeekdayTasks,
  countTasksForDate as countDateTasks,
  getLocalDateString,
  getTasksByDate,
  getTasksForCurrentWeekday as getWeekdayTasks,
  isTaskDate,
  type Weekday,
} from '../utils/taskDate';
import { migrateStoredTasks } from '../utils/taskStorage';
import { TaskContext } from './TaskContext';

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useLocalStorage<ITask[]>(
    'task-tracker-tasks',
    [],
    migrateStoredTasks,
  );

  const addTask = useCallback(
    (task: CreateTaskDto) => {
      const date = task.date ?? getLocalDateString();
      if (!isTaskDate(date)) {
        throw new RangeError(`Invalid task date: "${date}"`);
      }

      if (
        task.time !== undefined &&
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(task.time)
      ) {
        throw new RangeError(`Invalid task time: "${task.time}"`);
      }

      const newTask: ITask = {
        id: crypto.randomUUID(),
        title: task.title,
        ...(task.description === undefined
          ? {}
          : { description: task.description }),
        date,
        ...(task.time === undefined ? {} : { time: task.time }),
        completed: false,
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
    (
      taskId: ITask['id'],
      updates: Partial<Pick<ITask, 'status' | 'completed'>>,
    ) => {
      if (updates.status === undefined && updates.completed === undefined) {
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const status: TaskStatus =
            updates.status ??
            (updates.completed
              ? 'done'
              : task.status === 'done'
                ? 'todo'
                : task.status);

          return { ...task, status, completed: status === 'done' };
        }),
      );
    },
    [setTasks],
  );

  const getTasksForDate = useCallback(
    (date: TaskDate) => getTasksByDate(tasks, date),
    [tasks],
  );

  const getTasksForCurrentWeekday = useCallback(
    (weekday: Weekday) => getWeekdayTasks(tasks, weekday),
    [tasks],
  );

  const countTasksForDate = useCallback(
    (date: TaskDate) => countDateTasks(tasks, date),
    [tasks],
  );

  const countTasksForCurrentWeekday = useCallback(
    (weekday: Weekday) => countWeekdayTasks(tasks, weekday),
    [tasks],
  );

  const contextValue = useMemo(
    () => ({
      tasks,
      addTask,
      deleteTask,
      updateTaskStatus,
      getTasksForDate,
      getTasksForCurrentWeekday,
      countTasksForDate,
      countTasksForCurrentWeekday,
    }),
    [
      tasks,
      addTask,
      deleteTask,
      updateTaskStatus,
      getTasksForDate,
      getTasksForCurrentWeekday,
      countTasksForDate,
      countTasksForCurrentWeekday,
    ],
  );

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}
