'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'

interface ChatSidebarProps {
  onClose?: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat } = useStore()

  useEffect(() => {
    if (chats.length === 0) {
      addChat('New Chat')
    }
  }, [chats.length, addChat])

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addChat('New Chat')}
            className="h-8 w-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                  currentChatId === chat.id
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                <button
                  className="flex-1 truncate text-left"
                  onClick={() => {
                    setCurrentChat(chat.id)
                    onClose?.()
                  }}
                >
                  {chat.title}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteChat(chat.id)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <LogoutButton />
      </div>
    </div>
  )
} 