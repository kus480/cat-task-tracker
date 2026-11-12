import type { ITask, TaskStatus } from '../types/task';
import { getLocalDateString, isTaskDate } from './taskDate';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done';
}

function getLegacyDate(createdAt: unknown): string | undefined {
  if (typeof createdAt !== 'string') {
    return undefined;
  }

  const parsedDate = new Date(createdAt);
  return Number.isNaN(parsedDate.getTime())
    ? undefined
    : getLocalDateString(parsedDate);
}

function migrateTask(value: unknown, index: number): ITask {
  if (!isRecord(value)) {
    throw new TypeError(`Saved task at index ${index} must be an object`);
  }

  if (typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new TypeError(`Saved task at index ${index} must have an id and title`);
  }

  if (
    value.description !== undefined &&
    typeof value.description !== 'string'
  ) {
    throw new TypeError(`Saved task at index ${index} has an invalid description`);
  }

  if (value.status !== undefined && !isTaskStatus(value.status)) {
    throw new TypeError(`Saved task at index ${index} has an invalid status`);
  }

  if (value.completed !== undefined && typeof value.completed !== 'boolean') {
    throw new TypeError(`Saved task at index ${index} has an invalid completion flag`);
  }

  if (
    value.time !== undefined &&
    (typeof value.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time))
  ) {
    throw new TypeError(`Saved task at index ${index} has an invalid time`);
  }

  const createdAt =
    typeof value.createdAt === 'string' &&
    !Number.isNaN(new Date(value.createdAt).getTime())
      ? value.createdAt
      : new Date().toISOString();
  const migratedDate =
    getLegacyDate(createdAt) ?? getLocalDateString();
  const date = isTaskDate(value.date) ? value.date : migratedDate;
  const status = isTaskStatus(value.status)
    ? value.status
    : value.completed === true
      ? 'done'
      : 'todo';

  return {
    id: value.id,
    title: value.title,
    ...(typeof value.description === 'string'
      ? { description: value.description }
      : {}),
    date,
    ...(typeof value.time === 'string' ? { time: value.time } : {}),
    completed: status === 'done',
    status,
    createdAt,
  };
}

export function migrateStoredTasks(value: unknown): ITask[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Saved tasks must be an array');
  }

  return value.map(migrateTask);
}
