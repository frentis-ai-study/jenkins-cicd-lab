import { useState, useEffect, useCallback } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch('/api/todos')
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text.trim() }),
      })
      if (res.ok) {
        setText('')
        fetchTodos()
      }
    } catch (err) {
      console.error('Failed to add todo:', err)
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      fetchTodos()
    } catch (err) {
      console.error('Failed to toggle todo:', err)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      fetchTodos()
    } catch (err) {
      console.error('Failed to delete todo:', err)
    }
  }

  return (
    <div className="app">
      <h1>Todo App</h1>
      <form onSubmit={addTodo} className="add-form">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하세요"
          aria-label="새 할 일"
        />
        <button type="submit">추가</button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span>{todo.title}</span>
            </label>
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
