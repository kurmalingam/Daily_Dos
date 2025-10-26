import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import DayBox from './components/DayBox';
import ContentPopup from './components/ContentPopup';
import AddContentForm from './components/AddContentForm';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchContents();
    }
  }, []);

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/content', {
        headers: { Authorization: token }
      });
      setContents(response.data);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    fetchContents();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setContents([]);
    setSelectedContent(null);
    setShowAddForm(false);
  };

  const handleDayClick = (dayNumber) => {
    const content = contents.find(c => c.dayNumber === dayNumber);
    setSelectedContent(content || { dayNumber, description: '', todos: [] });
  };

  const closePopup = () => {
    setSelectedContent(null);
  };

  const handleAddContent = async (newContent) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/content', newContent, {
        headers: { Authorization: token }
      });
      fetchContents();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding content:', error);
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="add-btn" onClick={() => setShowAddForm(true)}>Add Today's Content</button>
        <h1>Daily Content Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <div className="day-grid">
        {contents.map((content) => (
          <DayBox key={content.dayNumber} dayNumber={content.dayNumber} onClick={handleDayClick} />
        ))}
      </div>
      {selectedContent && <ContentPopup content={selectedContent} onClose={closePopup} onUpdate={fetchContents} onDelete={fetchContents} />}
      {showAddForm && <AddContentForm onAdd={handleAddContent} onClose={closeForm} />}
    </div>
  );
};

export default App;
