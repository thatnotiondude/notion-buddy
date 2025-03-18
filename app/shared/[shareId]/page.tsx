'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Chat, Message } from '@/lib/types'

interface SharedChatPageProps {
  params: {
    shareId: string
  }
}

export default function SharedChatPage({ params }: SharedChatPageProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadSharedChat() {
      try {
        // First get the chat
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('share_id', params.shareId)
          .eq('is_shared', true)
          .single()

        if (chatError) throw chatError
        if (!chatData) {
          setError('Chat not found or no longer available')
          return
        }

        // Then get the messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData.id)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        setChat(chatData)
        setMessages(messagesData || [])
      } catch (error) {
        console.error('Error loading shared chat:', error)
        setError('Failed to load shared chat')
      } finally {
        setLoading(false)
      }
    }

    loadSharedChat()
  }, [params.shareId, supabase])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Error</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Chat Not Found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            This chat may have been deleted or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {chat.title}
        </h1>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <ChatMessages messages={messages} isSharedView={true} />
        </div>
        <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <ChatInput disabled={true} />
        </div>
      </div>
    </div>
  )
} 