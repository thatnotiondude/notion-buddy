'use client'

import { useStore } from '@/lib/store'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export function ChatSidebar() {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat } = useStore()

  const handleAddChat = async () => {
    const newChat = await addChat()
    if (newChat) {
      setCurrentChat(newChat.id)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddChat}
          className="h-8 w-8"
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
                'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                currentChatId === chat.id
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              <button
                className="flex-1 truncate text-left"
                onClick={() => setCurrentChat(chat.id)}
              >
                {chat.title}
              </button>
              <button
                className="ml-2 hidden rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-50 group-hover:block"
                onClick={() => deleteChat(chat.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 