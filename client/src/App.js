import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

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

  const toggleTodo = async (id) => {
    const response = await fetch(`/api/todos/${id}`, { method: 'PATCH' });
    const updated = await response.json();
    // Update the specific todo in our state
    setTodos(todos.map(t => t._id === id ? updated : t));
  };

  const updateTodoText = async (id) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText })
    });
    const updated = await response.json();
    
    setTodos(todos.map(t => t._id === id ? updated : t));
    setEditingId(null); // Exit edit mode
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
  <li key={todo._id}>
    {editingId === todo._id ? (
      <>
        <input 
          value={editText} 
          onChange={(e) => setEditText(e.target.value)} 
        />
        <button onClick={() => updateTodoText(todo._id)}>Save</button>
        <button onClick={() => setEditingId(null)}>Cancel</button>
      </>
    ) : (
      <>
        <span 
          onClick={() => toggleTodo(todo._id)}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.text}
        </span>
        <button onClick={() => {
          setEditingId(todo._id);
          setEditText(todo.text);
        }}>Edit</button>
        <button onClick={() => deleteTodo(todo._id)}>Delete</button>
      </>
    )}
  </li>
))}
      </ul>
    </div>
  );
}

export default App;