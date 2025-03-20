'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Menu, Plus, LogOut, ChevronLeft, ChevronRight, Sun, Moon, Share, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'
import { Input } from './ui/input'

interface ChatSidebarProps {
  onClose?: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat, updateChatTitle } = useStore()
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log('Attempting to delete chat:', chatId)
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        return
      }

      await deleteChat(chatId)
      console.log('Chat deleted successfully')
      
      // If the deleted chat was the current chat, set current chat to null
      if (currentChatId === chatId) {
        console.log('Setting current chat to null since deleted chat was current')
        await setCurrentChat('')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      alert('Failed to delete chat. Please try again.')
    }
  }

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    console.log('Starting edit for chat:', chatId, 'with title:', currentTitle)
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = async () => {
    if (!editingChatId || !editTitle.trim()) {
      console.log('No valid title to save')
      return
    }

    try {
      console.log('Saving new title:', editTitle.trim(), 'for chat:', editingChatId)
      await updateChatTitle(editingChatId, editTitle.trim())
      console.log('Title updated successfully')
      setEditingChatId(null)
      setEditTitle('')
    } catch (error) {
      console.error('Error updating chat title:', error)
      alert('Failed to update chat title. Please try again.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault() // Prevent form submission
      setEditingChatId(null)
      setEditTitle('')
    }
  }

  const handleChatClick = async (chatId: string) => {
    try {
      console.log('Setting current chat:', chatId)
      await setCurrentChat(chatId)
    } catch (error) {
      console.error('Error setting current chat:', error)
      alert('Failed to switch chat. Please try again.')
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Chats</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800',
                  currentChatId === chat.id && 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <div className="flex-1 min-w-0">
                  <button
                    className="w-full truncate text-left text-sm text-slate-700 dark:text-slate-300"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    {chat.title || 'New Chat'}
                  </button>
                </div>
                <div className="flex items-center ml-2">
                  <button
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat.id, chat.title || 'New Chat');
                    }}
                    title="Rename chat"
                  >
                    <Pencil className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                {editingChatId === chat.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 rounded-lg bg-white p-4 dark:bg-slate-800">
                      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Rename Chat</h3>
                      <Input
                        value={editTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="mb-4"
                        autoFocus
                        placeholder="Enter chat title"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingChatId(null);
                            setEditTitle('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save</Button>
                      </div>
                    </div>
                  </div>
                )}
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