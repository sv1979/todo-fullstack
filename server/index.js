const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Render will provide the PORT in production

// Middleware
app.use(cors());
app.use(express.json()); // This allows us to parse JSON bodies in POST requests
const path = require('path');

let todos = [
  { id: 1, text: 'Learn how Node works', completed: false },
  { id: 2, text: 'Build a fullstack app', completed: false }
];

app.get('/api/todos', (req, res) => {
  console.log('GET request received: Sending todos');
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const newTodo = {
    id: Date.now(), // Simple way to generate a unique ID
    text: req.body.text,
    completed: false
  };

  todos.push(newTodo);
  console.log('POST request received: Added', newTodo);

  // We return the newly created object (Standard Practice)
  res.status(201).json(newTodo);
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
