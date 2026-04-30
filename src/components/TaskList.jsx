import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { useTasks } from '../hooks/useSupabaseStorage';

function TaskList() {
  const { tasks, addTask: addTaskToStorage, toggleTask, deleteTask } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTaskToStorage(newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="task-section">
      <h2 className="task-header">Tasks</h2>

      {!isAdding ? (
        <span
          className="add-task clickable"
          onClick={() => setIsAdding(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsAdding(true)}
        >
          + add task
        </span>
      ) : (
        <div className="task-input-container fade-in">
          <input
            type="text"
            className="task-input"
            placeholder="what needs to be done?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTaskText.trim()) {
                setIsAdding(false);
              }
            }}
            autoFocus
          />
        </div>
      )}

      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
