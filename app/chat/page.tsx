'use client'

import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { chats, addChat } = useStore()

  // Create a new chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      addChat()
    }
  }, [chats.length, addChat])

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </Button>

      {/* Theme toggle */}
      <div className="fixed right-4 top-4 z-[60]">
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-gradient-to-b from-indigo-50/80 to-white backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:from-indigo-950/80 dark:to-slate-900 md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ChatSidebar />
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col">
        <main className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900">
          <div className="flex-1 overflow-auto px-4 md:px-6">
            <ChatMessages />
          </div>
          <div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
            <ChatInput />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm dark:bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
} 