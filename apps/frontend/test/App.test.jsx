import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../src/App'

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  )
})

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('Todo App')).toBeInTheDocument()
  })

  it('renders the input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('할 일을 입력하세요')).toBeInTheDocument()
  })

  it('renders the add button', () => {
    render(<App />)
    expect(screen.getByText('추가')).toBeInTheDocument()
  })

  it('allows typing in the input field', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요')
    fireEvent.change(input, { target: { value: '새 할 일' } })
    expect(input.value).toBe('새 할 일')
  })
})
