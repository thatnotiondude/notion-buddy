
'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { Button } from './ui/button'
import { Plus, Sun, Moon, Share, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function ChatComponent() {
  const { user, signOut } = useAuth()
  const { currentChatId, chats, setCurrentChat, addChat, deleteChat, updateChatTitle } = useStore()
  const { theme, setTheme } = useTheme()
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  useEffect(() => {
    console.log('ChatComponent mounted')
    console.log('Auth state:', { user })
    console.log('Store state:', { currentChatId, chats })
  }, [user, currentChatId, chats])

  const handleNewChat = async () => {
    if (isCreatingChat) {
      console.log('Already creating a chat, skipping')
      return
    }
    
    setIsCreatingChat(true)
    try {
      console.log('Creating new chat')
      const newChat = await addChat('Notion Template Design')
      if (newChat) {
        console.log('Setting current chat to new chat:', newChat.id)
        await setCurrentChat(newChat.id)
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
      toast.error('Failed to create new chat. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log('Delete button clicked for chat:', chatId);
      console.log('Deleting chat:', chatId);
      await deleteChat(chatId)
      console.log('Chat deleted successfully');
      
      // If we deleted the current chat, switch to another chat
      if (currentChatId === chatId) {
        const remainingChat = chats.find(chat => chat.id !== chatId);
        if (remainingChat) {
          await setCurrentChat(remainingChat.id);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat. Please try again.')
    }
  }

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    console.log('Starting edit for chat:', chatId, 'with title:', currentTitle);
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = async () => {
    if (!editingChatId || !editTitle.trim()) {
      console.log('No chat ID or empty title, skipping save');
      return;
    }
    try {
      console.log('Saving edit for chat:', editingChatId, 'with new title:', editTitle.trim());
      await updateChatTitle(editingChatId, editTitle.trim())
      console.log('Title updated successfully');
      setEditingChatId(null)
      setEditTitle('')
      toast.success('Chat title updated')
    } catch (error) {
      console.error('Error updating chat title:', error)
      toast.error('Failed to update chat title. Please try again.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditingChatId(null)
      setEditTitle('')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-72 h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10">
        {/* App Title and Theme Toggle */}
        <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notion Buddy</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="flex-none p-4">
          <Button
            onClick={handleNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Notion Design Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-2 pb-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setCurrentChat(chat.id)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-left text-sm relative',
                  'transition-colors duration-150',
                  'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                  currentChatId === chat.id 
                    ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{chat.title || 'New Chat'}</span>
                  )}
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (editingChatId === chat.id) {
                          handleSaveEdit();
                        } else {
                          handleStartEdit(chat.id, chat.title || 'New Chat');
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="w-full flex-none border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  {user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="fixed top-0 left-72 right-0 bottom-0 flex flex-col h-[100dvh] bg-white dark:bg-gray-900 z-0">
        {/* Chat Header */}
        <div className="flex-none h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentChatId ? (
              chats.find(chat => chat.id === currentChatId)?.title || 'New Chat'
            ) : (
              'Select or start a new chat'
            )}
          </h2>
          {currentChatId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/share', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ chatId: currentChatId }),
                  });
                  
                  if (!response.ok) throw new Error('Failed to create share link');
                  
                  const { shareId } = await response.json();
                  const shareUrl = `${window.location.origin}/shared/${shareId}`;
                  
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Share link copied to clipboard!');
                  } catch (clipboardError) {
                    // Fallback: Create a temporary input element
                    const tempInput = document.createElement('input');
                    tempInput.value = shareUrl;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    toast.success('Share link copied to clipboard!');
                  }
                } catch (error) {
                  console.error('Error sharing chat:', error);
                  toast.error('Failed to create share link. Please try again.');
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-4 md:px-8">
            <ChatMessages />
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex-none border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-4 md:px-8">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  )
} 