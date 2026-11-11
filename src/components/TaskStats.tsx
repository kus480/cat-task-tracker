import { useMemo } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';

export function TaskStats() {
  const { tasks } = useTaskContext();

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'done').length;
    const total = tasks.length;

    return {
      completed,
      total,
      completionPercentage:
        total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks]);

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
