'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-lg text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Theme toggle in top right */}
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <ChatSidebar />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Messages area with gradient background */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <ChatMessages />
        </div>

        {/* Input area with blur effect */}
        <div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <ChatInput />
        </div>
      </div>
    </div>
  )
} 