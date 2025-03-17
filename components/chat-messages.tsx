'use client'

import { useStore } from '@/lib/store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export function ChatMessages() {
  const { chats, currentChatId } = useStore()
  const currentChat = chats.find((chat) => chat.id === currentChatId)

  if (!currentChat) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        <p>Select a chat to start messaging</p>
      </div>
    )
  }

  if (currentChat.messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        <p>Send a message to start the conversation</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:p-6">
        {currentChat.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
            'flex w-full gap-3 rounded-xl p-3 sm:gap-4 sm:p-4',
              message.role === 'assistant'
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-slate-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              : 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/50 dark:to-slate-900'
          )}
        >
          <div className="flex-1 space-y-3 sm:space-y-4">
              <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-slate max-w-none dark:prose-invert prose-p:leading-normal prose-pre:p-0 prose-sm sm:prose-base"
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0 sm:mb-4">{children}</p>,
                code: ({ node, inline, className, children, ...props }: {
                  node?: any;
                  inline?: boolean;
                  className?: string;
                  children?: React.ReactNode;
                } & React.HTMLAttributes<HTMLElement>) => {
                  if (inline) {
                    return (
                      <code
                        className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs sm:text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                  return (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 sm:p-4">
                      <code className="block font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200" {...props}>
                        {children}
                      </code>
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
    </div>
  )
} 