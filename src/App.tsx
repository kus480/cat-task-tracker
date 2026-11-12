import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskProvider } from './context/TaskProvider';
import { useTaskContext } from './hooks/useTaskContext';
import type { TaskDate, TaskStatus } from './types/task';
import {
  getLocalDateString,
  getMonthDates,
  getMonthYearLabel,
  getShortDateLabel,
  getTasksByDate,
  getWeekDates,
  getWeekOffsetForDate,
  getWeekdayName,
  getWeekdayShortName,
  shiftMonth,
  sortTasksByTime,
} from './utils/taskDate';
import './App.css';

function TaskTracker() {
  const { tasks, addTask, deleteTask, updateTaskStatus } = useTaskContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthDate, setMonthDate] = useState<TaskDate>(() =>
    getLocalDateString(),
  );
  const [isMonthExpanded, setIsMonthExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<TaskDate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({
    left: 12,
    top: 100,
    arrowLeft: 24,
    placement: 'below' as 'above' | 'below',
  });
  const dayButtonRefs = useRef(new Map<TaskDate, HTMLButtonElement>());
  const popoverRef = useRef<HTMLElement>(null);

  const today = getLocalDateString();
  const weekDates = useMemo(
    () => getWeekDates(new Date(), weekOffset),
    [weekOffset],
  );
  const monthDates = useMemo(() => getMonthDates(monthDate), [monthDate]);
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
    setWeekOffset(getWeekOffsetForDate(date));
    setMonthDate(shiftMonth(date, 0));
    setSelectedDate((currentDate) => (currentDate === date ? null : date));
    setIsCreateOpen(false);
  };

  const changeMonth = (offset: number) => {
    const nextMonth = shiftMonth(monthDate, offset);
    setMonthDate(nextMonth);
  };

  const toggleCalendarView = () => {
    if (isMonthExpanded) {
      setWeekOffset(0);
    }

    setIsMonthExpanded((isExpanded) => !isExpanded);
  };

  const closePopover = () => {
    setSelectedDate(null);
    setIsCreateOpen(false);
  };

  const handleAddTask = (task: Parameters<typeof addTask>[0]) => {
    addTask(task);
    setIsCreateOpen(false);
  };

  useLayoutEffect(() => {
    if (selectedDate === null) {
      return;
    }

    const updatePopoverPosition = () => {
      const anchor = dayButtonRefs.current.get(selectedDate);
      const popover = popoverRef.current;
      if (!anchor || !popover) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const horizontalPadding = 12;
      const left = Math.min(
        Math.max(horizontalPadding, anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2),
        window.innerWidth - popoverRect.width - horizontalPadding,
      );
      const belowTop = anchorRect.bottom + 12;
      const canPlaceBelow =
        belowTop + popoverRect.height <= window.innerHeight - horizontalPadding;
      const top = canPlaceBelow
        ? belowTop
        : Math.max(horizontalPadding, anchorRect.top - popoverRect.height - 12);

      setPopoverPosition({
        left,
        top,
        arrowLeft: Math.min(
          Math.max(18, anchorRect.left + anchorRect.width / 2 - left - 10),
          popoverRect.width - 30,
        ),
        placement: canPlaceBelow ? 'below' : 'above',
      });
    };

    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [selectedDate, selectedTasks.length]);

  useEffect(() => {
    if (selectedDate === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (isCreateOpen) {
        setIsCreateOpen(false);
      } else {
        setSelectedDate(null);
        setIsCreateOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreateOpen, selectedDate]);

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
                <h2 id="week-heading">
                  {getMonthYearLabel(
                    isMonthExpanded ? monthDate : weekDates[3],
                  )}
                </h2>
                <p>План на неделю</p>
              </div>
              {isMonthExpanded && (
                <div className="week-navigation month-navigation">
                  <button
                    type="button"
                    aria-label="Предыдущий месяц"
                    onClick={() => changeMonth(-1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Следующий месяц"
                    onClick={() => changeMonth(1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {!isMonthExpanded ? (
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
                    ref={(element) => {
                      if (element) {
                        dayButtonRefs.current.set(day.date, element);
                      } else {
                        dayButtonRefs.current.delete(day.date);
                      }
                    }}
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
                        {day.tasks.slice(0, 3).map((task) => (
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
                        {day.tasks.length > 3 && (
                          <span className="calendar-task-overflow">
                            +{day.tasks.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="month-calendar" aria-label="Календарь на месяц">
                <div className="month-weekdays" aria-hidden="true">
                  {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(
                    (weekday) => (
                      <span key={weekday}>{weekday}</span>
                    ),
                  )}
                </div>
                <div className="month-days-grid">
                  {monthDates.map((date) => {
                    const dateTasks = sortTasksByTime(
                      getTasksByDate(tasks, date),
                    );
                    const isCurrentMonth =
                      date.slice(0, 7) === monthDate.slice(0, 7);
                    const dayNumber = date.slice(-2);

                    return (
                      <button
                        key={date}
                        type="button"
                        className={[
                          'month-day-card',
                          isCurrentMonth ? '' : 'is-outside-month',
                          date === today ? 'is-today' : '',
                          selectedDate === date ? 'is-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-label={`${dayNumber} ${getWeekdayName(date)}, ${dateTasks.length} задач`}
                        aria-pressed={selectedDate === date}
                        ref={(element) => {
                          if (element) {
                            dayButtonRefs.current.set(date, element);
                          } else {
                            dayButtonRefs.current.delete(date);
                          }
                        }}
                        onClick={() => selectDate(date)}
                      >
                        <span className="month-day-number">{dayNumber}</span>
                        <span className="month-day-task-list">
                          {dateTasks.slice(0, 3).map((task) => (
                            <span
                              className="month-day-task"
                              key={task.id}
                              title={`${task.time ? `${task.time} ` : ''}${task.title}`}
                            >
                              <span aria-hidden="true">🧶</span>
                              <span className="month-day-task-title">
                                {task.title}
                              </span>
                            </span>
                          ))}
                          {dateTasks.length > 3 && (
                            <span className="calendar-task-overflow">
                              +{dateTasks.length - 3}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              className="calendar-view-toggle"
              type="button"
              aria-label={
                isMonthExpanded
                  ? 'Свернуть календарь до недели'
                  : 'Развернуть календарь на месяц'
              }
              aria-expanded={isMonthExpanded}
              onClick={toggleCalendarView}
            >
              <span
                className={`calendar-view-chevron${isMonthExpanded ? ' is-expanded' : ''}`}
                aria-hidden="true"
              />
            </button>
          </section>

          <TaskStats />
        </div>

      </div>

      {selectedDate !== null && (
        <div
          className="day-popover-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePopover();
            }
          }}
        >
          <section
            ref={popoverRef}
            className={`day-popover is-${popoverPosition.placement}`}
            style={
              {
                left: `${popoverPosition.left}px`,
                top: `${popoverPosition.top}px`,
                '--popover-arrow-left': `${popoverPosition.arrowLeft}px`,
              } as CSSProperties
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-popover-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="day-popover-header">
              <div>
                <h2 id="day-popover-heading">
                  {getShortDateLabel(selectedDate)}
                </h2>
                <p>
                  {selectedTasks.length}{' '}
                  {selectedTasks.length === 1
                    ? 'задача'
                    : selectedTasks.length >= 2 && selectedTasks.length <= 4
                      ? 'задачи'
                      : 'задач'}
                </p>
              </div>
              <button
                className="layer-close-button"
                type="button"
                aria-label="Закрыть список задач"
                onClick={closePopover}
              >
                ×
              </button>
            </header>

            {selectedTasks.length === 0 ? (
              <div className="day-popover-empty">
                <span aria-hidden="true">🐈ᶻᶻᶻ</span>
                <p>Пока нет задач на этот день</p>
              </div>
            ) : (
              <ul className="day-popover-list">
                {selectedTasks.map((task) => {
                  const isComplete =
                    task.completed || task.status === 'done';

                  return (
                    <li className="day-popover-task" key={task.id}>
                      <button
                        className={`task-complete-toggle${isComplete ? ' is-complete' : ''}`}
                        type="button"
                        aria-label={
                          isComplete
                            ? `Вернуть задачу «${task.title}» к выполнению`
                            : `Отметить задачу «${task.title}» выполненной`
                        }
                        aria-pressed={isComplete}
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            isComplete ? 'todo' : 'done',
                          )
                        }
                      >
                        {isComplete ? '✓' : '🧶'}
                      </button>
                      <span
                        className={`day-popover-task-title${isComplete ? ' is-complete' : ''}`}
                        title={task.title}
                      >
                        {task.title}
                      </span>
                      <span className="day-popover-task-time">
                        {task.time || '—'}
                      </span>
                      <button
                        className="day-popover-delete"
                        type="button"
                        aria-label={`Удалить задачу «${task.title}»`}
                        onClick={() => deleteTask(task.id)}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              className="day-popover-add"
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              <span aria-hidden="true">+</span>
              Добавить задачу
            </button>
          </section>
        </div>
      )}

      {selectedDate !== null && isCreateOpen && (
        <div
          className="task-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateOpen(false);
            }
          }}
        >
          <section
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="task-modal-header">
              <div>
                <p>Новая задача</p>
                <h2 id="task-modal-heading">
                  {getShortDateLabel(selectedDate)}
                </h2>
              </div>
              <button
                className="layer-close-button"
                type="button"
                aria-label="Отменить добавление задачи"
                onClick={() => setIsCreateOpen(false)}
              >
                ×
              </button>
            </header>
            <TaskForm
              key={selectedDate}
              className="task-modal-form"
              date={selectedDate}
              onSubmit={handleAddTask}
              submitLabel="Сохранить задачу"
              autoFocus
            />
          </section>
        </div>
      )}
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
