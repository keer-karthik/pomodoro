import React from 'react';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="task-item fade-in">
      <div
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(task.id)}
      />
      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
        {task.text}
      </span>
      <span
        className="task-delete clickable"
        onClick={() => onDelete(task.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onDelete(task.id)}
      >
        ×
      </span>
    </li>
  );
}

export default TaskItem;
