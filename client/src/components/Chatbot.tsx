'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatService } from '../api/chat'
import { cn } from '@/utils/cn'

function formatMessage(text: string) {
  const lines = text.split('\n').filter((line) => line.trim())
  const elements: JSX.Element[] = []

  // Process each line to handle numbered lists, bold text, and regular paragraphs, applying appropriate styling for each case
  lines.forEach((line, index) => {
    // Handle numbered lists (e.g., "1. **Text**: description")
    if (/^\d+\.\s+\*\*.*\*\*:/.test(line)) {
      const match = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)$/)
      if (match) {
        const [, number, title, description] = match
        elements.push(
          <div key={index} className="mb-2 last:mb-0">
            <div className="font-semibold text-brand">
              {number}. {title}
            </div>
            <div className="ml-4 text-muted">{description}</div>
          </div>,
        )
        return
      }
    }

    // Handle bold text (e.g., "**Bold Text**")
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/)
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold text-fg">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })
      elements.push(
        <p key={index} className="mb-2 last:mb-0">
          {formattedParts}
        </p>,
      )
      return
    }

    // Regular text
    elements.push(
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>,
    )
  })

  return elements
}

// Chatbot component that provides a chat interface for users to interact with a chat assistant. It allows users to send messages and receive responses from the assistant, with the ability to minimize and maximize the chat window. The component manages the state of messages, user input, and the minimized state of the chat window, and it formats the assistant's responses for better readability.
export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view as the conversation grows
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  // Function to send a message to the chat assistant. It updates the messages state with the user's message, sends the message to the ChatService, and then updates the messages state with the assistant's response.
  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setIsSending(true)

    try {
      const data = await ChatService.sendMessage(trimmed)
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }])
    } catch (error) {
      console.error('Chat request failed', error)
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry — I could not reach the server. Please try again.' }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      {/* Launcher. Scales away as the panel opens rather than swapping instantly. */}
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        aria-label="Open chat"
        title="Open chat"
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-brand text-brand-fg shadow-lift',
          'transition-all duration-400 ease-smooth hover:scale-105 active:scale-95',
          isMinimized ? 'scale-100 opacity-100' : 'pointer-events-none scale-50 opacity-0',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4.3-1L3 20l1.4-3.7A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden',
          'rounded-3xl border border-line bg-surface shadow-lift',
          'origin-bottom-right transition-all duration-400 ease-smooth',
          isMinimized ? 'pointer-events-none h-0 scale-90 opacity-0' : 'h-[28rem] scale-100 opacity-100',
        )}
      >
        <div className="flex items-center gap-3 border-b border-line bg-surface-2/60 px-4 py-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="4" y="8" width="16" height="12" rx="3" />
              <path d="M12 4v4M9 14h.01M15 14h.01" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-fg">Sonu</h2>
            <p className="text-xs text-faint">Activity assistant</p>
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimise chat"
            className="rounded-lg p-1.5 text-faint transition-colors duration-250 hover:bg-surface-2 hover:text-fg"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="pt-10 text-center text-sm text-faint">Ask me anything about the activities on ReEvent.</p>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn('flex animate-fade-up', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user' ? 'rounded-br-md bg-brand text-brand-fg' : 'rounded-bl-md bg-surface-2 text-fg',
                )}
              >
                {m.role === 'bot' ? formatMessage(m.text) : m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator while the assistant's reply is in flight */}
          {isSending && (
            <div className="flex animate-fade-in justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              className="h-10 flex-1 rounded-xl border border-line bg-surface-2/60 px-3.5 text-sm text-fg placeholder:text-faint transition-[border-color,box-shadow] duration-250 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-fg transition-all duration-250 ease-smooth hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
