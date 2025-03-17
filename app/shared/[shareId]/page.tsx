'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Chat, Message } from '@/lib/types'

export default function SharedChatPage({ params }: { params: { shareId: string } }) {
  const [chat, setChat] = useState<(Chat & { messages: Message[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const { data: chat, error } = await supabase
          .from('chats')
          .select('*, messages(*)')
          .eq('share_id', params.shareId)
          .eq('is_shared', true)
          .single()

        if (error) throw error
        if (!chat) throw new Error('Chat not found')

        setChat({ ...chat, messages: chat.messages || [] })
      } catch (error) {
        console.error('Error fetching shared chat:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedChat()
  }, [params.shareId, supabase])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">
          Chat not found or no longer available
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-lg font-semibold">{chat.title}</h1>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={chat.messages} isSharedView={true} />
        </div>
        <div className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <ChatInput disabled />
        </div>
      </div>
    </div>
  )
} 