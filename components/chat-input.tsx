'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { SendIcon } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { chats, currentChatId, addMessage, updateChatTitle } = useStore()

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChat || !input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // Add user message
      addMessage(currentChat.id, {
        content: userMessage,
        role: 'user',
      })

      // If this is the first message, generate a title
      if (currentChat.messages.length === 0) {
        const titleResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Create a single, specific title (2-5 words) for this Notion-related query. Do not provide options or explanations - respond only with the title itself. The title should be professional and descriptive, focusing on the main topic. Query: "${userMessage}"`,
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
          updateChatTitle(currentChat.id, cleanTitle)
        }
      }

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...currentChat.messages,
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
      addMessage(currentChat.id, {
        content: response.response,
        role: 'assistant',
      })
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      addMessage(currentChat.id, {
        content: 'I encountered an error processing your request. Please try again.',
        role: 'assistant',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-500">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Notion templates, features, or best practices..."
          className="flex-1 rounded-xl bg-gradient-to-b from-slate-100 to-white border border-slate-200 px-4 py-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:ring-slate-700"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || !currentChatId || isLoading}
          className="h-11 w-11 rounded-xl bg-gradient-to-b from-slate-100 to-white border border-slate-200 text-slate-600 hover:text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-300 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
} 