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
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      await addMessage(chatToUse.id, 'I encountered an error processing your request. Please try again.', 'assistant')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Notion..."
              className="min-h-[60px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              disabled={isLoading || disabled}
            />
            {error && (
              <p className="absolute -bottom-6 left-0 text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || disabled || !input.trim()}
            className="h-[60px] w-[60px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-slate-700"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
} 