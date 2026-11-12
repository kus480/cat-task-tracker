import { useState, type FormEvent } from 'react';
import type { CreateTaskDto, TaskDate } from '../types/task';

interface TaskFormProps {
  onSubmit: (task: CreateTaskDto) => void;
  date?: TaskDate;
  submitLabel?: string;
  className?: string;
  autoFocus?: boolean;
}

export function TaskForm({
  onSubmit,
  date,
  submitLabel = 'Добавить задачу',
  className,
  autoFocus = false,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const trimmedDescription = description.trim();
    const task: CreateTaskDto = {
      title: trimmedTitle,
      ...(date === undefined ? {} : { date }),
      ...(time === '' ? {} : { time }),
    };
    if (trimmedDescription) {
      task.description = trimmedDescription;
    }

    onSubmit(task);
    setTitle('');
    setTime('');
    setDescription('');
  };

  return (
    <form
      className={['task-form', className].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      style={{
        padding: 0,
        border: 'none',
        borderRadius: 0,
        background: 'transparent',
        boxShadow: 'none',
      }}
    >
      <label className="form-field">
        <span>Название</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, подготовить отчёт"
          maxLength={120}
          required
          autoFocus={autoFocus}
        />
      </label>

      <label className="form-field">
        <span>
          Время <span aria-hidden="true">(необязательно)</span>
        </span>
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>
          Описание <span aria-hidden="true">(необязательно)</span>
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Добавьте детали задачи"
          rows={1}
          maxLength={500}
        />
      </label>

      <button
        className="primary-button"
        type="submit"
        style={{
          background: '#A3B899',
          boxShadow: '0 7px 18px rgba(109, 140, 99, 0.18)',
        }}
      >
        <span className="button-plus" aria-hidden="true">+</span>
        {submitLabel}
      </button>
    </form>
  );
}
