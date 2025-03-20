'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Message } from '@/lib/types'

interface ChatInputProps {
  disabled?: boolean
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { currentChatId, addMessage, addChat, setCurrentChat, messages } = useStore()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || disabled) return

    setIsLoading(true)
    const messageToSend = input.trim()
    setInput('') // Clear input immediately after sending

    try {
      let chatId = currentChatId
      if (!chatId) {
        const newChat = await addChat()
        if (!newChat) {
          throw new Error('Failed to create new chat')
        }
        chatId = newChat.id
        await setCurrentChat(chatId)
      }

      // Add user message first
      const userMessage: Pick<Message, 'role' | 'content'> = {
        role: 'user' as const,
        content: messageToSend
      }
      
      const userMessageResult = await addMessage(chatId, userMessage.content, userMessage.role)
      if (userMessageResult.error) {
        throw new Error(userMessageResult.error)
      }

      // Get chat history
      const chatHistory = messages[chatId] || []
      
      // Format messages for the API - only include non-empty messages
      const messageHistory = chatHistory
        .filter(msg => msg && msg.content && msg.content.trim() !== '')
        .map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.content.trim()
        }))

      // Add the current message to the history
      messageHistory.push(userMessage)

      console.log('Sending messages to API:', messageHistory)

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `Failed to get AI response: ${response.status}`)
      }

      const data = await response.json()
      if (!data.response) {
        throw new Error('Invalid response from AI')
      }

      // Add AI response to chat
      await addMessage(chatId, data.response, 'assistant')
    } catch (error) {
      console.error('Error sending message:', error)
      console.error('Detailed error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about Notion templates, workspace design, or any Notion-related questions... (Press Enter to send, Shift+Enter for new line)"
            className={cn(
              "w-full resize-none rounded-lg",
              "bg-gray-50 dark:bg-gray-800",
              "border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-gray-200",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "pr-24 py-3 min-h-[56px] text-sm leading-relaxed",
              "shadow-sm dark:shadow-lg"
            )}
            rows={1}
            disabled={disabled}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? 'Sending...' : 'Enter ↵'}
            </span>
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || disabled}
              className={cn(
                "h-8 px-4",
                "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
                "text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "text-sm font-medium"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 