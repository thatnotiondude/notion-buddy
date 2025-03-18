'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { Send } from 'lucide-react'

interface ChatInputProps {
  disabled?: boolean
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { chats, currentChatId, addMessage, updateChatTitle, addChat } = useStore()

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || disabled) return

    // Create a new chat if none exists
    let chatToUse = currentChat
    if (!chatToUse) {
      try {
        chatToUse = await addChat()
        if (!chatToUse) {
          throw new Error('Failed to create new chat')
        }
      } catch (error) {
        setError('Failed to create new chat')
        setIsLoading(false)
        return
      }
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // Add user message
      await addMessage(chatToUse.id, userMessage, 'user')

      // If this is the first message, generate a title
      if (!chatToUse.messages || chatToUse.messages.length === 0) {
        const titleResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Create a single, specific title (2-4 words) for this Notion-related query. Do not provide options or explanations - respond only with the title itself. The title should be professional and descriptive, focusing on the main topic. Query: "${userMessage}"`,
              },
            ],
          }),
        }).then((res) => res.json())

        if (titleResponse.error) {
          throw new Error(titleResponse.error)
        }

        if (titleResponse.response) {
          // Clean up the title by removing any explanatory text and formatting
          const cleanTitle = titleResponse.response
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/^(a |an |the )/i, '') // Remove articles
            .replace(/^here are.*?:/i, '') // Remove "here are" phrases
            .replace(/^title:?\s*/i, '') // Remove "title:" prefix
            .replace(/^\*|\*$/g, '') // Remove asterisks
            .replace(/\s*\(.*?\)/g, '') // Remove parentheticals
            .split(/[.:\n]/)[0] // Take only the first line/segment
            .trim()
          await updateChatTitle(chatToUse.id, cleanTitle)
        }
      }

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(chatToUse.messages || []),
            {
              role: 'user',
              content: `As a Notion expert, provide a clear and concise response to this query. Focus on practical advice and avoid using emojis or casual language. Maintain a professional yet approachable tone. The query is: "${userMessage}"`,
            },
          ],
        }),
      }).then((res) => res.json())

      if (response.error) {
        throw new Error(response.error)
      }

      // Add AI response
      await addMessage(chatToUse.id, response.response, 'assistant')
    } catch (error) {
      console.error('Error in chat:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
      
      // If we failed after sending the user message, add an error message to the chat
      if (chatToUse) {
        try {
          await addMessage(
            chatToUse.id,
            'I encountered an error processing your request. Please try again.',
            'assistant'
          )
        } catch (e) {
          console.error('Error adding error message:', e)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto max-w-3xl p-4">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-slate-700 dark:bg-slate-800">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!isLoading && !disabled && input.trim()) {
                    handleSubmit(e)
                  }
                }
              }}
              placeholder="Ask about Notion... (Press Enter to send, Shift+Enter for new line)"
              rows={1}
              className="max-h-48 min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
              style={{
                overflow: 'hidden',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 192)}px`
              }}
              disabled={isLoading || disabled}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || disabled || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-slate-700"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </form>
  )
} 