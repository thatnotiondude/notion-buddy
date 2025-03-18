'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'

interface ChatMessagesProps {
  messages?: Message[]
  isSharedView?: boolean
}

interface CodeProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
  [key: string]: any
}

export function ChatMessages({ messages, isSharedView = false }: ChatMessagesProps) {
  const { chats, currentChatId } = useStore()
  const currentChat = chats.find((chat) => chat.id === currentChatId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // If messages are provided as props, use those instead of the current chat's messages
  const displayMessages = messages || currentChat?.messages || []

  if (!isSharedView && !currentChat && !messages) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          Select a chat or send a message to get started
        </p>
      </div>
    )
  }

  if (displayMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          No messages yet. Start a conversation!
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-6">
        {displayMessages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'group relative rounded-lg px-4 py-3',
              message.role === 'user'
                ? 'ml-auto max-w-[85%] bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100'
                : 'mr-auto max-w-[85%] bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
            )}
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="!bg-slate-100 dark:!bg-slate-800"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-sm dark:bg-slate-800" {...props}>
                        {children}
                      </code>
                    )
                  },
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 list-disc pl-6 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 list-decimal pl-6 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-2 last:mb-0">{children}</li>,
                  h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-3 text-xl font-semibold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-2 text-lg font-medium">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 