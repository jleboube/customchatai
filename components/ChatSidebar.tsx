'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

interface Chat {
  id: string
  title: string
  updatedAt: string
}

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId?: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { theme, toggleTheme } = useTheme()
  const { data: session } = useSession()

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CustomChatAI
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                  aria-label="Delete chat"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          href="/dashboard/keys"
          className="block w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          🔑 API Keys
        </Link>
        <Link
          href="/docs/api"
          className="block w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          📚 API Documentation
        </Link>
        {session?.user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="block w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            ⚙️ Admin Dashboard
          </Link>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session?.user?.name || session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session?.user?.role === 'ADMIN' ? 'Admin' : 'User'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="ml-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
