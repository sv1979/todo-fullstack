const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const getAverageLength = require('./utilites/lib');
require('dotenv').config(); // Loads our secret password
const Todo = require('./models/Todo'); // Import our Schema

const app = express();
const PORT = process.env.PORT || 5000; // Render will provide the PORT in production

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://todo-fullstack-c5dg.onrender.com"
  ]
}));
app.use(express.json()); // This allows us to parse JSON bodies in POST requests
const path = require('path');
console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "Found it!" : "Still undefined");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch(err => console.error("Could not connect:", err));

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ order: 1 }); // 1 for Ascending
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const count = await Todo.countDocuments();
    const newTodo = new Todo({
      text: req.body.text,
      order: count
    });
    const savedTodo = await newTodo.save(); // Saves to the cloud
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed; // Flip the status
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { text } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { text }, 
      { new: true } // This returns the modified document rather than the original
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/get-length', async (req, res) => {
  try {
    const todos = await Todo.find(); 
    const averageLength = getAverageLength(todos);
    res.json({'average-length': averageLength });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date() });
});

app.post('/api/todos/reorder', async (req, res) => {
  try {
    const { id1, order1, id2, order2 } = req.body;
    
    // Perform both updates
    await Todo.findByIdAndUpdate(id1, { order: order1 });
    await Todo.findByIdAndUpdate(id2, { order: order2 });
    
    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
