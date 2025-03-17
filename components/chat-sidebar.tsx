'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ChatSidebar() {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat, fetchChats } = useStore()
  const { signOut } = useAuth()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const loadChats = async () => {
      try {
        await fetchChats()
      } catch (error) {
        console.error('Failed to fetch chats:', error)
        toast.error('Failed to load chats', {
          description: 'Please try refreshing the page.'
        })
      }
    }
    loadChats()
  }, [fetchChats])

  const handleNewChat = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const result = await addChat()
      if (!result?.id) {
        throw new Error('Failed to create chat')
      }
      
      toast.success('New chat created')
    } catch (error) {
      console.error('Failed to create chat:', error)
      toast.error('Failed to create new chat', {
        description: 'Please try again.'
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <Button
        variant="secondary"
        onClick={handleNewChat}
        disabled={isCreating}
        className="group mb-4 flex w-full items-center justify-start gap-2 rounded-xl bg-white px-4 py-2.5 text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
      >
        <PlusCircle className="h-5 w-5" />
        <span>{isCreating ? 'Creating...' : 'New Chat'}</span>
      </Button>

      <div className="flex-1 space-y-2 overflow-y-auto">
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

      <Button
        variant="ghost"
        onClick={signOut}
        className="mt-4 flex w-full items-center justify-start gap-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <LogOut className="h-5 w-5" />
        <span>Sign Out</span>
      </Button>
    </div>
  )
} 