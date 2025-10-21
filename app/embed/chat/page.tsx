'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function EmbedChatContent() {
  const searchParams = useSearchParams()
  const userKey = searchParams.get('userKey')
  const theme = searchParams.get('theme') || 'light'
  const model = searchParams.get('model') || 'llama3'

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const handleSendMessage = async (content: string) => {
    if (!userKey) {
      setError('Missing API key')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantContent =
        data.choices?.[0]?.message?.content || 'No response from AI'

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
        },
      ])
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!userKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">
          Missing userKey parameter
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          CustomChatAI
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a conversation
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))
        )}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  )
}

export default function EmbedChat() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <EmbedChatContent />
    </Suspense>
  )
}
