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
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
              )}
            >
              <ReactMarkdown
                className={cn(
                  'prose prose-sm max-w-none break-words dark:prose-invert',
                  'prose-headings:text-slate-900 dark:prose-headings:text-slate-50',
                  'prose-p:text-slate-700 dark:prose-p:text-slate-300',
                  'prose-strong:text-slate-900 dark:prose-strong:text-slate-50',
                  'prose-code:text-slate-900 dark:prose-code:text-slate-50',
                  'prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800',
                  'prose-pre:text-slate-900 dark:prose-pre:text-slate-50',
                  'prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300',
                  'prose-ul:text-slate-700 dark:prose-ul:text-slate-300',
                  'prose-ol:text-slate-700 dark:prose-ol:text-slate-300',
                  'prose-li:text-slate-700 dark:prose-li:text-slate-300',
                  'prose-hr:border-slate-200 dark:prose-hr:border-slate-700',
                  'prose-table:text-slate-700 dark:prose-table:text-slate-300',
                  'prose-th:text-slate-900 dark:prose-th:text-slate-50',
                  'prose-td:text-slate-700 dark:prose-td:text-slate-300'
                )}
                components={{
                  code({ node, inline, className, children, ...props }: CodeProps) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as Record<string, React.CSSProperties>}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre({ children, ...props }) {
                    return (
                      <pre
                        className="rounded-lg bg-slate-100 p-4 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                        {...props}
                      >
                        {children}
                      </pre>
                    )
                  },
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