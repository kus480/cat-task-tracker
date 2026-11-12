import { useState, type FormEvent } from 'react';
import type { CreateTaskDto, TaskDate } from '../types/task';

interface TaskFormProps {
  onSubmit: (task: CreateTaskDto) => void;
  date?: TaskDate;
}

export function TaskForm({ onSubmit, date }: TaskFormProps) {
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
      className="task-form"
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
        Название
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, подготовить отчёт"
          maxLength={120}
          required
        />
      </label>

      <label className="form-field">
        Время <span aria-hidden="true">(необязательно)</span>
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </label>

      <label className="form-field">
        Описание <span aria-hidden="true">(необязательно)</span>
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
        Добавить задачу
      </button>
    </form>
  );
}
