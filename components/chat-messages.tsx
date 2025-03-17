'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { UserCircle, Bot } from 'lucide-react'

export function ChatMessages() {
  const { chats, currentChatId } = useStore()
  const currentChat = chats.find((chat) => chat.id === currentChatId)

  if (!currentChat) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">Select a chat or create a new one to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      {currentChat.messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex w-full items-start gap-4 rounded-2xl p-6',
            message.role === 'assistant' 
              ? 'bg-gradient-to-br from-slate-100 to-white border border-slate-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700' 
              : 'bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-slate-800/80 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
          )}
        >
          <div className="shrink-0">
            {message.role === 'assistant' ? (
              <div className="rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 p-1 dark:from-indigo-900 dark:to-slate-800 dark:border-indigo-800">
                <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : (
              <div className="rounded-full bg-gradient-to-br from-slate-100 to-white border border-slate-200 p-1 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                <UserCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-x-hidden">
            <ReactMarkdown
              className="prose max-w-none break-words text-slate-600 prose-headings:text-slate-800 prose-a:text-indigo-600 prose-strong:text-slate-800 prose-code:text-slate-800 prose-pre:bg-white prose-pre:shadow-sm prose-pre:border prose-pre:border-slate-200 dark:text-slate-300 dark:prose-headings:text-slate-200 dark:prose-a:text-indigo-400 dark:prose-strong:text-slate-200 dark:prose-code:text-slate-200 dark:prose-pre:bg-slate-800 dark:prose-pre:border-slate-700"
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
} 