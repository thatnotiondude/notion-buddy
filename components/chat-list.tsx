'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatList() {
  const { chats, currentChatId, setCurrentChat, deleteChat, addChat } = useStore()

  const handleNewChat = async () => {
    try {
      await addChat()
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              'group flex items-center justify-between rounded-lg p-2 hover:bg-muted',
              currentChatId === chat.id && 'bg-muted'
            )}
          >
            <button
              className="flex-1 truncate text-left text-sm"
              onClick={() => setCurrentChat(chat.id)}
            >
              {chat.title}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => handleDeleteChat(chat.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 