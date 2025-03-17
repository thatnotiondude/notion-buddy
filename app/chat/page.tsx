'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileSidebarToggle } from '@/components/mobile-sidebar-toggle'
import { ShareButton } from '@/components/share-button'
import { useStore } from '@/lib/store'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const { currentChatId, shareChat } = useStore()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const generateShareUrl = async () => {
      if (currentChatId) {
        try {
          const url = await shareChat(currentChatId)
          setShareUrl(url)
        } catch (error) {
          console.error('Error generating share URL:', error)
        }
      }
    }
    generateShareUrl()
  }, [currentChatId, shareChat])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <MobileSidebarToggle
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isOpen={isSidebarOpen}
          />
          <h1 className="text-lg font-semibold">Notion Buddy</h1>
        </div>
        <div className="flex items-center gap-2">
          {shareUrl && <ShareButton shareUrl={shareUrl} />}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out dark:bg-slate-900 md:relative md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ChatMessages />
          </div>
          <div className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  )
} 