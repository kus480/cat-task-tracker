import { useCallback } from 'react';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskProvider } from './context/TaskProvider';
import { useTaskContext } from './hooks/useTaskContext';
import type { TaskStatus } from './types/task';
import type { CSSProperties } from 'react';
import './App.css';

function TaskTracker() {
  const { tasks, addTask, deleteTask, updateTaskStatus } = useTaskContext();

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskStatus(taskId, { status });
    },
    [updateTaskStatus],
  );

  return (
    <main
      className="app-shell"
      style={{
        width: '100%',
        maxWidth: 'none',
        minHeight: '100vh',
        margin: 0,
        padding: '64px max(24px, calc((100% - 920px) / 2)) 80px',
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
        <section className="panel create-panel" aria-labelledby="create-heading">
          <div className="section-heading">
            <div>
              <h2 id="create-heading">Новая задача</h2>
              <p>Запишите то, что хотите сделать</p>
            </div>
          </div>
          <TaskForm onSubmit={addTask} />
        </section>

        <TaskStats />
        </div>

        <section className="panel tasks-panel" aria-labelledby="tasks-heading">
          <div className="section-heading">
            <div>
              <h2 id="tasks-heading">Мои задачи</h2>
              <p>Ваш список дел на сегодня</p>
            </div>
            <span className="task-count" aria-label={`Всего задач: ${tasks.length}`}>
              {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">🐈ᶻᶻᶻ</span>
              <h3>Котики сладко спят...</h3>
              <p>Добавьте задачу, и они проснутся помочь вам с делами 🐾</p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: '0 0 auto',
                        fontSize: '20px',
                        filter: 'grayscale(0.7) sepia(0.45) saturate(0.65)',
                      }}
                    >
                      🧶
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TaskCard
                        task={task}
                        onDelete={deleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
