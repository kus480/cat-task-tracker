import { memo } from 'react';
import type { ITask, TaskStatus } from '../types/task';

interface TaskCardProps {
  task: ITask;
  onDelete: (taskId: ITask['id']) => void;
  onStatusChange: (taskId: ITask['id'], status: TaskStatus) => void;
}

function isTaskStatus(value: string): value is TaskStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done';
}

export const TaskCard = memo(function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const handleStatusChange = (value: string) => {
    if (isTaskStatus(value)) {
      onStatusChange(task.id, value);
    }
  };

  return (
    <article className="task-card">
      <div className="task-card-content">
        <h3>{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
        <p className="task-meta">
          {task.time && <span>{task.time} · </span>}
          Добавлена {new Date(task.createdAt).toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="task-card-actions">
        <select
          value={task.status}
          aria-label={`Статус задачи «${task.title}»`}
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="todo">К выполнению</option>
          <option value="in-progress">В процессе</option>
          <option value="done">Готово</option>
        </select>

        <button
          className="delete-button"
          type="button"
          aria-label={`Удалить задачу «${task.title}»`}
          onClick={() => onDelete(task.id)}
        >
          ×
        </button>
      </div>
    </article>
  );
});
