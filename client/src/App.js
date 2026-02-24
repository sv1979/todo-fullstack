import React, { useState, useEffect, useCallback } from 'react';
import './App.scss';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [wordLength, setWordLength] = useState(0);
  const [backend, setBackend] = useState('node');

const getUrl = useCallback((path) => {
  const NODE_BASE = process.env.REACT_APP_NODE_URL || "http://localhost:5000";
  const PYTHON_BASE = process.env.REACT_APP_PYTHON_URL || "http://localhost:8000";

  return backend === 'node'
    ? `${NODE_BASE}/api${path}`
    : `${PYTHON_BASE}/python/api${path}`;
}, [backend]);

  const refreshLength = useCallback(() => {
    fetch(getUrl('/get-length')) // Added slash
      .then(res => res.json())
      .then(data => setWordLength(data['average-length']))
      .catch(err => console.error("Backend not responding", err));
  }, [getUrl]);

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch(getUrl('/todos'));
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }, [getUrl]);

  // 1. GET data from Node.js
  useEffect(() => {
    fetchTodos();
    refreshLength();

    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((response) => response.json())
      .then((json) => console.log(json));

  }, [backend, refreshLength, fetchTodos]);

  useEffect(() => {
    refreshLength()
  }, [todos, refreshLength])

  // 2. POST data to Node.js
  const addTodo = async (e) => {
    e.preventDefault();
    if (!text) return;

    const response = await fetch(getUrl('/todos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const newTodo = await response.json();
    setTodos([...todos, newTodo]); // Update UI with the response from backend
    setText('');
  };

  const deleteTodo = async (id) => {
    await fetch(getUrl(`/todos/${id}`), { method: 'DELETE' });
    // Update the UI by filtering out the deleted todo
    setTodos(todos.filter(todo => todo._id !== id));
  };

  const toggleTodo = async (id) => {
    const response = await fetch(getUrl(`/todos/${id}`), { method: 'PATCH' });
    const updated = await response.json();
    // Update the specific todo in our state
    setTodos(todos.map(t => t._id === id ? updated : t));
  };

  const updateTodoText = async (id) => {
    const response = await fetch(getUrl(`/todos/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText })
    });
    const updated = await response.json();

    setTodos(todos.map(t => t._id === id ? updated : t));
    setEditingId(null); // Exit edit mode
  };

  const moveTodo = async (index, direction) => {
    const newTodos = [...todos];
    const nextIndex = index + direction;

    // Prevent moving out of bounds
    if (nextIndex < 0 || nextIndex >= newTodos.length) return;

    const currentTodo = newTodos[index];
    const neighborTodo = newTodos[nextIndex];

    // 1. Update UI state immediately
    newTodos[index] = neighborTodo;
    newTodos[nextIndex] = currentTodo;
    setTodos(newTodos);

    // 2. Persist to MongoDB
    await fetch(getUrl('/todos/reorder'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id1: currentTodo._id,
        order1: nextIndex, // Its new position
        id2: neighborTodo._id,
        order2: index      // Its new position
      })
    });
  };

  return (
    <div className="app-container">
      <h1>My Fullstack Todo</h1>
      <div className="backend-switcher">
        <span>Current Engine: <strong>{backend.toUpperCase()}</strong></span>
        <button onClick={() => setBackend(backend === 'node' ? 'python' : 'node')}>
          Switch to {backend === 'node' ? 'Python' : 'Node'}
        </button>
      </div>

      <form onSubmit={addTodo}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add Todo</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={todo._id}>
            {/* Reorder Buttons */}
            <button onClick={() => moveTodo(index, -1)} disabled={index === 0}>▲</button>
            <button onClick={() => moveTodo(index, 1)} disabled={index === todos.length - 1}>▼</button>

            {editingId === todo._id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTodoText(todo._id);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                />
                <button onClick={() => updateTodoText(todo._id)}>Save</button>
              </>
            ) : (
              <>
                <span
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  onClick={() => toggleTodo(todo._id)}
                >
                  {todo.text}
                </span>
                <button onClick={() => { setEditingId(todo._id); setEditText(todo.text); }}>Edit</button>
                <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="stats-input">
        Average Length: <input type="text" value={Number(wordLength || 0).toFixed(1)} disabled />
      </div>
    </div>
  );
}

export default App;