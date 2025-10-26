import React, { useState } from 'react';
import './AddContentForm.css';

const AddContentForm = ({ onAdd, onClose }) => {
  const [dayNumber, setDayNumber] = useState('');
  const [description, setDescription] = useState('');
  const [todos, setTodos] = useState(['']);
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredTodos = todos.filter(todo => todo.trim() !== '').map(todo => ({ text: todo, completed: false }));
    onAdd({ dayNumber: parseInt(dayNumber), description, todos: filteredTodos });
    setDayNumber('');
    setDescription('');
    setTodos(['']);
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const updateTodo = (index, value) => {
    const updatedTodos = [...todos];
    updatedTodos[index] = value;
    setTodos(updatedTodos);
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Add Today's Content</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dayNumber">Day Number:</label>
            <input
              type="number"
              id="dayNumber"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Todos:</label>
            {todos.map((todo, index) => (
              <div key={index} className="todo-input-group">
                <input
                  type="text"
                  value={todo}
                  onChange={(e) => updateTodo(index, e.target.value)}
                  placeholder="Enter a todo item"
                />
                <button type="button" onClick={() => removeTodo(index)} className="remove-todo-btn">Remove</button>
              </div>
            ))}
            <div className="add-todo-group">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo"
              />
              <button type="button" onClick={addTodo} className="add-todo-btn">Add Todo</button>
            </div>
          </div>
          <button type="submit" className="submit-btn">Add Content</button>
        </form>
      </div>
    </div>
  );
};

export default AddContentForm;
