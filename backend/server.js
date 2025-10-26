const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailycontent')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Daily Content Schema
const dailyContentSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  todos: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  date: { type: Date, default: Date.now }
});

const DailyContent = mongoose.model('DailyContent', dailyContentSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create demo user if not exists
      if (email === 'test@example.com' && password === 'password123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ email, password: hashedPassword });
        await user.save();
      } else {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret');

    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes
app.get('/api/content', async (req, res) => {
  try {
    const contents = await DailyContent.find().sort({ dayNumber: 1 });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/content/:dayNumber', async (req, res) => {
  try {
    const content = await DailyContent.findOne({ dayNumber: req.params.dayNumber });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/content', async (req, res) => {
  const { dayNumber, description, todos } = req.body;
  const content = new DailyContent({ dayNumber, description, todos });
  try {
    const newContent = await content.save();
    res.status(201).json(newContent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/content/:dayNumber', async (req, res) => {
  try {
    const updatedContent = await DailyContent.findOneAndUpdate(
      { dayNumber: req.params.dayNumber },
      req.body,
      { new: true }
    );
    if (!updatedContent) return res.status(404).json({ message: 'Content not found' });
    res.json(updatedContent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/content/:dayNumber', async (req, res) => {
  try {
    const deletedContent = await DailyContent.findOneAndDelete({ dayNumber: req.params.dayNumber });
    if (!deletedContent) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
