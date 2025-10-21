'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
}

interface Chat {
  id: string
  title: string
  updatedAt: string
  messages: Message[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchChats()
      fetchAvailableModels()
    }
  }, [status])

  // Set selected model to first available when models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0])
    }
  }, [availableModels, selectedModel])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    }
  }

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models || [])
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setAvailableModels([])
    }
  }

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    fetchChatMessages(chatId)
  }

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      })

      if (response.ok) {
        const data = await response.json()
        setChats([data.chat, ...chats])
        setCurrentChatId(data.chat.id)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setChats(chats.filter((c) => c.id !== chatId))
        if (currentChatId === chatId) {
          setCurrentChatId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          message: content,
          model: selectedModel,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update currentChatId if this was a new chat
        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId)
        }

        // Update the user message with the actual ID from the server
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            id: data.userMessage.id,
            role: 'user',
            content: data.userMessage.content,
          },
          {
            id: data.message.id,
            role: 'assistant',
            content: data.message.content,
            reasoning: data.message.reasoning,
          },
        ])

        // Update chat list
        fetchChats()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId || undefined}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentChatId
              ? chats.find((c) => c.id === currentChatId)?.title || 'Chat'
              : 'Select or create a chat'}
          </h2>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting with AI</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                reasoning={message.reasoning}
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
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  )
}
