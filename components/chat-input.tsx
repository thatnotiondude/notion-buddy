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
    <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white from-50% to-white/0 dark:from-gray-900 dark:to-gray-900/0 pb-4">
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative rounded-lg border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="relative flex items-center p-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about Notion templates, workspace design, or any Notion-related questions... (Press Enter to send, Shift+Enter for new line)"
              className={cn(
                "min-h-[56px] w-full resize-none px-4 py-3 text-base",
                "bg-transparent",
                "border-0 focus:ring-0",
                "text-gray-900 dark:text-gray-200",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:outline-none",
                "pr-20"
              )}
              rows={1}
              disabled={disabled}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <span className="hidden text-xs text-gray-400 sm:inline">
                {isLoading ? 'Sending...' : 'Enter ↵'}
              </span>
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || disabled}
                size="sm"
                className={cn(
                  "h-8 px-3",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
                  "text-white",
                  "transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 