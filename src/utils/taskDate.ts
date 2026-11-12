import type { ITask, TaskDate } from '../types/task';

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const WEEKDAY_NAMES = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
] as const;

const WEEKDAY_SHORT_NAMES = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const;

export function isTaskDate(value: unknown): value is TaskDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getLocalDateString(date: Date = new Date()): TaskDate {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateParts(date: TaskDate): [number, number, number] {
  if (!isTaskDate(date)) {
    throw new RangeError(`Invalid task date: "${date}"`);
  }

  return date.split('-').map(Number) as [number, number, number];
}

function createLocalDate(date: TaskDate): Date {
  const [year, month, day] = getDateParts(date);
  const result = new Date(0);
  result.setFullYear(year, month - 1, day);
  result.setHours(12, 0, 0, 0);
  return result;
}

export function getWeekday(date: TaskDate): Weekday {
  const day = createLocalDate(date).getDay();
  return (day === 0 ? 7 : day) as Weekday;
}

export function getWeekdayName(date: TaskDate): string {
  return WEEKDAY_NAMES[getWeekday(date) - 1];
}

export function getMonthName(date: TaskDate): string {
  return new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(
    createLocalDate(date),
  );
}

export function getTasksByDate(tasks: readonly ITask[], date: TaskDate): ITask[] {
  getDateParts(date);
  return tasks.filter((task) => task.date === date);
}

export function getDateForCurrentWeekday(
  weekday: Weekday,
  referenceDate: Date = new Date(),
): TaskDate {
  const startOfWeek = new Date(referenceDate);
  const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday + weekday - 1);
  return getLocalDateString(startOfWeek);
}

export function getWeekDates(
  referenceDate: Date = new Date(),
  weekOffset = 0,
): TaskDate[] {
  const monday = new Date(referenceDate);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(
    monday.getDate() - ((monday.getDay() + 6) % 7) + weekOffset * 7,
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return getLocalDateString(date);
  });
}

export function getMonthYearLabel(date: TaskDate): string {
  const [year, month, day] = date.split('-').map(Number);
  const label = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day, 12));
  return label.charAt(0).toLocaleUpperCase('ru-RU') + label.slice(1);
}

export function getWeekdayShortName(date: TaskDate): string {
  const day = new Date(`${date}T12:00:00`).getDay();
  return WEEKDAY_SHORT_NAMES[(day + 6) % 7];
}

export function sortTasksByTime(tasks: readonly ITask[]): ITask[] {
  return [...tasks].sort((first, second) => {
    if (first.time === undefined) {
      return second.time === undefined ? 0 : 1;
    }

    if (second.time === undefined) {
      return -1;
    }

    return first.time.localeCompare(second.time);
  });
}

export function getTasksForCurrentWeekday(
  tasks: readonly ITask[],
  weekday: Weekday,
  referenceDate: Date = new Date(),
): ITask[] {
  return getTasksByDate(tasks, getDateForCurrentWeekday(weekday, referenceDate));
}

export function countTasksForDate(
  tasks: readonly ITask[],
  date: TaskDate,
): number {
  return getTasksByDate(tasks, date).length;
}

export function countTasksForCurrentWeekday(
  tasks: readonly ITask[],
  weekday: Weekday,
  referenceDate: Date = new Date(),
): number {
  return getTasksForCurrentWeekday(tasks, weekday, referenceDate).length;
}
