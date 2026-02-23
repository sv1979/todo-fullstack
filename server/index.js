const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Loads our secret password
const Todo = require('./models/Todo'); // Import our Schema

const app = express();
const PORT = process.env.PORT || 5000; // Render will provide the PORT in production

// Middleware
app.use(cors());
app.use(express.json()); // This allows us to parse JSON bodies in POST requests
const path = require('path');
console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "Found it!" : "Still undefined");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch(err => console.error("Could not connect:", err));

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find(); // .find() gets everything
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text
    });
    const savedTodo = await newTodo.save(); // Saves to the cloud
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date() });
});


// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Add 'any' before the parenthesis
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is breathing on http://localhost:${PORT}`);
});
