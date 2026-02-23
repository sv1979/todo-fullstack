import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  // 1. GET data from Node.js
  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("Backend not running?", err));
  }, []);

  // 2. POST data to Node.js
  const addTodo = async (e) => {
    e.preventDefault();
    if (!text) return;

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const newTodo = await response.json();
    setTodos([...todos, newTodo]); // Update UI with the response from backend
    setText('');
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    // Update the UI by filtering out the deleted todo
    setTodos(todos.filter(todo => todo._id !== id));
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>My Fullstack Todo</h1>
      <form onSubmit={addTodo}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add Todo</button>
      </form>

      <ul>
        {todos.map(todo => (
          <div key={todo._id}>
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default App;