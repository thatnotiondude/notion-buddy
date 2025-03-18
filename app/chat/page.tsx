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
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const { currentChatId, shareChat, chats } = useStore()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!user) {
    return null
  }

  const handleShare = async () => {
    if (!currentChatId) {
      console.error('No current chat selected')
      return ''
    }
    try {
      console.log('Generating share URL for chat:', currentChatId)
      const url = await shareChat(currentChatId)
      console.log('Generated share URL:', url)
      setShareUrl(url)
      return url
    } catch (error) {
      console.error('Error generating share URL:', error)
      throw error
    }
  }

  const currentChat = chats.find(chat => chat.id === currentChatId)

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <MobileSidebarToggle
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {currentChat?.title || 'New Chat'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {currentChatId && (
            <ShareButton 
              shareUrl={shareUrl || ''} 
              onShare={handleShare}
            />
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 w-full overflow-hidden bg-white dark:bg-slate-950">
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out dark:bg-slate-900',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:relative md:translate-x-0'
          )}
        >
          <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <main className="flex flex-1 w-full flex-col overflow-hidden bg-white dark:bg-slate-950">
          <ChatMessages messages={currentChat?.messages} />
          <ChatInput />
        </main>
      </div>
    </div>
  )
} 