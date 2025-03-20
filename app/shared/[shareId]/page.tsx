'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Chat, Message } from '@/lib/types'
import { toast } from 'sonner'

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
        console.log('Loading shared chat with ID:', params.shareId)
        
        // First get the chat with proper headers
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('share_id', params.shareId)
          .eq('is_shared', true)
          .maybeSingle()

        if (chatError) {
          console.error('Error fetching chat:', chatError)
          setError('Failed to load chat. Please try again later.')
          return
        }

        if (!chatData) {
          console.error('No chat data found')
          setError('Chat not found or no longer available')
          return
        }

        console.log('Found chat:', chatData)

        // Then get the messages with proper headers
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData.id)
          .order('created_at', { ascending: true })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
          setError('Failed to load chat messages. Please try again later.')
          return
        }

        console.log('Found messages:', messagesData?.length || 0)
        setChat(chatData)
        setMessages(messagesData || [])
      } catch (error) {
        console.error('Error loading shared chat:', error)
        setError('An unexpected error occurred. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadSharedChat()
  }, [params.shareId, supabase])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading shared chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Error</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
            The chat may have been deleted or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
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
          {chat.title || 'Shared Chat'}
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