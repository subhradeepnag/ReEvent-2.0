'use client'
import { useState } from 'react'
import { ChatService } from '../api/chat'

function formatMessage(text: string) {
  const lines = text.split('\n').filter((line) => line.trim())
  const elements: JSX.Element[] = []

  lines.forEach((line, index) => {
    // Handle numbered lists (e.g., "1. **Text**: description")
    if (/^\d+\.\s+\*\*.*\*\*:/.test(line)) {
      const match = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)$/)
      if (match) {
        const [, number, title, description] = match
        elements.push(
          <div key={index} className="mb-2">
            <div className="font-semibold text-blue-700">
              {number}. {title}
            </div>
            <div className="text-gray-700 ml-4">{description}</div>
          </div>,
        )
        return
      }
    }

    // Handle bold text (**text**)
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/)
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })
      elements.push(
        <p key={index} className="mb-2">
          {formattedParts}
        </p>,
      )
      return
    }

    // Regular text
    elements.push(
      <p key={index} className="mb-2 text-gray-700">
        {line}
      </p>,
    )
  })

  return elements
}

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text: input }])
    setInput('')

    const data = await ChatService.sendMessage(input)
    setMessages((prev) => [...prev, { role: 'bot', text: data.reply }])
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Open Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
      <div className="bg-blue-500 text-white p-2 rounded-t-lg flex items-center justify-between">
        <h3 className="text-sm font-semibold">Chat Assistant</h3>
        <button onClick={() => setIsMinimized(true)} className="text-white hover:bg-blue-600 rounded p-1 transition-colors" title="Minimize">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 p-2 rounded ${m.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>
            <div className="text-xs font-medium mb-1">{m.role === 'user' ? 'You' : 'Sonu'}:</div>
            <div className="text-sm">{m.role === 'bot' ? formatMessage(m.text) : m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
