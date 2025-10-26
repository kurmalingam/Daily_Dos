import React, { useState } from 'react';
import axios from 'axios';
import './ContentPopup.css';

const ContentPopup = ({ content, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(content.description);
  const [todos, setTodos] = useState(content.todos || []);
  const [newTodo, setNewTodo] = useState('');

  const handleTodoToggle = async (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);

    try {
      await axios.put(`http://localhost:5000/api/content/${content.dayNumber}`, {
        ...content,
        description,
        todos: updatedTodos
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/content/${content.dayNumber}`, {
        ...content,
        description,
        todos
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this day\'s content?')) {
      try {
        await axios.delete(`http://localhost:5000/api/content/${content.dayNumber}`);
        onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { text: newTodo.trim(), completed: false }]);
      setNewTodo('');
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const updateTodo = (index, text) => {
    const updatedTodos = [...todos];
    updatedTodos[index].text = text;
    setTodos(updatedTodos);
  };

  if (!content) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Day {content.dayNumber}</h2>
          <div className="popup-actions">
            {!isEditing ? (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
              </>
            ) : (
              <>
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={() => {
                  setDescription(content.description);
                  setTodos(content.todos || []);
                  setIsEditing(false);
                }}>Cancel</button>
              </>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="content-section">
          <label>Description:</label>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          ) : (
            <p>{description}</p>
          )}
        </div>
        <div className="todos-section">
          <h3>Todos:</h3>
          {isEditing ? (
            <div className="edit-todos">
              {todos.map((todo, index) => (
                <div key={index} className="edit-todo-item">
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) => updateTodo(index, e.target.value)}
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
                <button type="button" onClick={addTodo} className="add-todo-btn">Add</button>
              </div>
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo, index) => (
                <li key={index} className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleTodoToggle(index)}
                  />
                  <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p><strong>Date:</strong> {new Date(content.date).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default ContentPopup;
