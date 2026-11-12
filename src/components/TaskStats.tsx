import { useMemo } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import { getLocalDateString } from '../utils/taskDate';

export function TaskStats() {
  const { tasks } = useTaskContext();
  const today = getLocalDateString();

  const stats = useMemo(() => {
    const todayTasks = tasks.filter((task) => task.date === today);
    const completed = todayTasks.filter((task) => task.completed).length;
    const total = todayTasks.length;

    return {
      completed,
      total,
      completionPercentage:
        total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks, today]);

  return (
    <section className="stats-grid" aria-label="Статистика задач">
      <article className="panel stat-card">
        <span className="stat-label">Всего задач</span>
        <strong className="stat-value">{stats.total}</strong>
      </article>
      <article className="panel stat-card">
        <span className="stat-label">Выполнено</span>
        <strong className="stat-value">{stats.completed}</strong>
      </article>
      <article className="panel stat-card">
        <span className="stat-label">Общий прогресс</span>
        <strong className="stat-value">{stats.completionPercentage}%</strong>
        <div
          className="stat-progress"
          role="progressbar"
          aria-label="Процент выполненных задач"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.completionPercentage}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={
                index < Math.round(stats.completionPercentage / 10)
                  ? 'paw-step is-active'
                  : 'paw-step'
              }
              aria-hidden="true"
              style={{ transitionDelay: `${index * 35}ms` }}
            >
              🐾
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
