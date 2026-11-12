import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskProvider } from './context/TaskProvider';
import { useTaskContext } from './hooks/useTaskContext';
import type { TaskDate, TaskStatus } from './types/task';
import {
  getLocalDateString,
  getMonthYearLabel,
  getTasksByDate,
  getWeekDates,
  getWeekdayName,
  getWeekdayShortName,
  sortTasksByTime,
} from './utils/taskDate';
import './App.css';

function TaskTracker() {
  const { tasks, addTask, deleteTask, updateTaskStatus } = useTaskContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<TaskDate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const today = getLocalDateString();
  const weekDates = useMemo(
    () => getWeekDates(new Date(), weekOffset),
    [weekOffset],
  );
  const days = useMemo(
    () =>
      weekDates.map((date) => ({
        date,
        dayNumber: date.slice(-2),
        weekdayName: getWeekdayName(date),
        weekdayShortName: getWeekdayShortName(date),
        tasks: sortTasksByTime(getTasksByDate(tasks, date)),
      })),
    [tasks, weekDates],
  );
  const selectedTasks = useMemo(
    () =>
      selectedDate === null
        ? []
        : sortTasksByTime(getTasksByDate(tasks, selectedDate)),
    [selectedDate, tasks],
  );

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskStatus(taskId, { status });
    },
    [updateTaskStatus],
  );

  const selectDate = (date: TaskDate) => {
    setSelectedDate(selectedDate === date ? null : date);
    setIsFormOpen(false);
  };

  const changeWeek = (offset: number) => {
    setWeekOffset((currentOffset) => currentOffset + offset);
    setSelectedDate(null);
    setIsFormOpen(false);
  };

  return (
    <main
      className="app-shell"
      style={{
        width: '100%',
        maxWidth: 'none',
        minHeight: '100vh',
        margin: 0,
        padding: 'clamp(24px, 5vw, 64px) max(12px, calc((100% - 1120px) / 2)) 64px',
        boxSizing: 'border-box',
        background: '#FDFBF7',
        color: '#4A3E3D',
        '--text-primary': '#4A3E3D',
        '--text-secondary': '#6D4C41',
        '--text-muted': '#8A7770',
        '--text-faint': '#A9968E',
        '--surface': '#FFFFFF',
        '--surface-raised': '#FFFFFF',
        '--border': '#F0E8E1',
        '--border-hover': '#E3D5CA',
        '--accent': '#C9B29B',
        '--accent-soft': 'rgba(201, 178, 155, 0.22)',
      } as CSSProperties}
    >
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🐾</span>
          <span>Личный планировщик</span>
        </div>
        <h1>
          Кото-Продуктивность{' '}
          <span
            style={{
              color: '#B89B83',
              filter: 'grayscale(0.6) sepia(0.45) saturate(0.65)',
            }}
          >
            🐾
          </span>
        </h1>
        <p className="app-subtitle">
          Разматываем клубки задач шаг за шагом 🧶
        </p>
      </header>

      <div className="workspace">
        <div className="overview-grid">
          <section className="panel week-panel" aria-labelledby="week-heading">
            <div className="section-heading week-heading">
              <div>
                <h2 id="week-heading">{getMonthYearLabel(weekDates[3])}</h2>
                <p>План на неделю</p>
              </div>
              <div className="week-navigation">
                <button
                  type="button"
                  aria-label="Предыдущая неделя"
                  onClick={() => changeWeek(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Следующая неделя"
                  onClick={() => changeWeek(1)}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="week-days-grid" aria-label="Дни текущей недели">
              {days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  className={[
                    'week-day-card',
                    day.date === today ? 'is-today' : '',
                    selectedDate === day.date ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`${day.dayNumber} ${day.weekdayName}, ${day.tasks.length} задач`}
                  aria-pressed={selectedDate === day.date}
                  onClick={() => selectDate(day.date)}
                >
                  <span className="week-day-date">
                    <strong>{day.dayNumber}</strong>
                    <span>{day.weekdayShortName}</span>
                  </span>
                  {day.tasks.length === 0 ? (
                    <span className="week-day-empty">Нет задач</span>
                  ) : (
                    <span className="week-day-task-list">
                      {day.tasks.map((task) => (
                        <span
                          className="week-day-task"
                          key={task.id}
                          title={`${task.time ? `${task.time} ` : ''}${task.title}`}
                        >
                          <span aria-hidden="true">🧶</span>
                          <span className="week-day-task-title">
                            {task.title}
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <TaskStats />
        </div>

        <section
          className={[
            'selected-day-reveal',
            selectedDate !== null ? 'is-open' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={selectedDate === null}
          aria-label="Задачи выбранного дня"
        >
          <div className="selected-day-reveal-inner">
            {selectedDate !== null && (
              <div className="panel selected-day-panel">
                <div className="section-heading selected-day-heading">
                  <div>
                    <h2>
                      {getWeekdayName(selectedDate)}, {selectedDate}
                    </h2>
                    <p>
                      {selectedTasks.length}{' '}
                      {selectedTasks.length === 1
                        ? 'задача'
                        : selectedTasks.length >= 2 &&
                            selectedTasks.length <= 4
                          ? 'задачи'
                          : 'задач'}
                    </p>
                  </div>
                  <button
                    className="selected-day-add"
                    type="button"
                    aria-label={
                      isFormOpen ? 'Скрыть форму задачи' : 'Добавить задачу'
                    }
                    aria-expanded={isFormOpen}
                    onClick={() => setIsFormOpen((isOpen) => !isOpen)}
                  >
                    {isFormOpen ? '×' : '+'}
                  </button>
                </div>

                {isFormOpen && (
                  <TaskForm
                    key={selectedDate}
                    date={selectedDate}
                    onSubmit={addTask}
                  />
                )}

                {selectedTasks.length === 0 ? (
                  <div className="empty-state selected-day-empty">
                    <span className="empty-icon" aria-hidden="true">
                      🐈ᶻᶻᶻ
                    </span>
                    <h3>Пока нет задач</h3>
                    <p>Нажмите «+», чтобы добавить задачу на этот день.</p>
                  </div>
                ) : (
                  <ul className="task-list selected-day-task-list">
                    {selectedTasks.map((task) => (
                      <li key={task.id}>
                        <TaskCard
                          task={task}
                          onDelete={deleteTask}
                          onStatusChange={handleStatusChange}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <TaskTracker />
    </TaskProvider>
  );
}
