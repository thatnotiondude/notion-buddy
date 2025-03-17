'use client'

import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { PlusIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatSidebar() {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat } = useStore()

  return (
    <div className="flex h-full w-full flex-col p-4 pt-16 md:pt-4">
      <Button
        onClick={() => addChat()}
        className="group mb-4 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] border border-indigo-100 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-indigo-300 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        variant="secondary"
      >
        <PlusIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
        New Chat
      </Button>

      <div className="flex-1 space-y-2 overflow-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              'group flex cursor-pointer items-center justify-between rounded-xl p-3 text-sm text-slate-500 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border hover:border-indigo-100 active:scale-[0.98] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 dark:hover:border-slate-700 dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
              currentChatId === chat.id && 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-indigo-100 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
            )}
            onClick={() => setCurrentChat(chat.id)}
          >
            <span className="line-clamp-1 flex-1 pr-2">{chat.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                deleteChat(chat.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 