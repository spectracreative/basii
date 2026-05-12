import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Circle } from 'lucide-react';

const TodoList = ({ todos, setTodos }) => {
  const [task, setTask] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!task) return;
    
    const newTodo = {
      id: Date.now().toString(),
      text: task,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setTask('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="card glass" style={{ marginTop: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>To-Do List</h3>
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
          {completedCount} / {todos.length} done
        </span>
      </div>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          className="input-field" 
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={18} />
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {todos.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>All caught up!</p>
        ) : (
          <AnimatePresence>
            {todos.map(todo => (
              <motion.div 
                key={todo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: todo.completed ? 'var(--color-bg)' : 'var(--color-surface)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    marginRight: '1rem',
                    color: todo.completed ? 'var(--color-success)' : 'var(--color-text-muted)'
                  }}
                >
                  {todo.completed ? <Check size={20} /> : <Circle size={20} />}
                </button>
                
                <span style={{ 
                  flex: 1, 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)'
                }}>
                  {todo.text}
                </span>

                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="btn-icon"
                  style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TodoList;
