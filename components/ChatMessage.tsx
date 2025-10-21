'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
}

export function ChatMessage({ role, content, reasoning }: ChatMessageProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-3xl ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {role === 'user' ? 'U' : 'AI'}
        </div>

        {/* Message Content */}
        <div className="flex-1">
          {reasoning && (
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2 flex items-center gap-1"
            >
              {showReasoning ? '▼' : '▶'} Reasoning
            </button>
          )}

          {showReasoning && reasoning && (
            <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
              <p className="text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">
                {reasoning}
              </p>
            </div>
          )}

          <div
            className={`message-bubble ${
              role === 'user' ? 'message-user' : 'message-ai'
            }`}
          >
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: {
                    node?: any
                    inline?: boolean
                    className?: string
                    children?: React.ReactNode
                    [key: string]: any
                  }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
