'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { RotateCw, Pencil, Check, X } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import type { Message } from '@/lib/types'
import { toast } from 'sonner'
import { generateResponse } from '@/lib/google-ai'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

interface CodeProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
  [key: string]: any
}

interface ChatMessagesProps {
  messages?: Message[]
  isSharedView?: boolean
}

export function ChatMessages({ messages: propMessages, isSharedView = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentChatId, messages: storeMessages, addMessage } = useStore()
  const [retrying, setRetrying] = useState<number | null>(null)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [propMessages, storeMessages])

  // Get messages from either props or store
  const displayMessages = propMessages || (currentChatId ? storeMessages[currentChatId] : []) || []

  const handleStartEdit = (index: number, content: string) => {
    setEditingMessageIndex(index)
    setEditContent(content)
  }

  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setEditContent('')
  }

  const handleSaveEdit = async (index: number) => {
    if (!currentChatId || !editContent.trim()) return
    
    try {
      // Get the message we're editing
      const messageToEdit = displayMessages[index]
      
      // Delete all subsequent messages first
      const messagesToDelete = displayMessages.slice(index + 1)
      if (messagesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('messages')
          .delete()
          .in('id', messagesToDelete.map(m => m.id))

        if (deleteError) {
          console.error('Error deleting messages:', deleteError)
          throw deleteError
        }
      }

      // Update the message in Supabase
      const { error: updateError } = await supabase
        .from('messages')
        .update({ content: editContent.trim() })
        .eq('id', messageToEdit.id)

      if (updateError) {
        console.error('Error updating message:', updateError)
        throw updateError
      }

      // Create updated message object
      const updatedMessage = {
        ...messageToEdit,
        content: editContent.trim()
      }

      // Create updated messages array
      const updatedMessages = [
        ...displayMessages.slice(0, index),
        updatedMessage
      ]

      // Update local state based on view type
      if (propMessages) {
        // For shared view, modify the propMessages array directly
        propMessages.splice(index, propMessages.length - index, updatedMessage)
      } else {
        // For regular view, update the store
        useStore.setState((state) => ({
          messages: {
            ...state.messages,
            [currentChatId]: updatedMessages
          }
        }))
      }

      // Format messages for the API to generate response
      const formattedMessages = updatedMessages
        .filter(msg => msg && msg.content && msg.content.trim() !== '')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content.trim()
        })) as Message[]

      // Get new AI response
      const response = await generateResponse(formattedMessages)

      // Add the AI response to the database
      const { data: newMessage, error: addError } = await supabase
        .from('messages')
        .insert([{
          chat_id: currentChatId,
          content: response,
          role: 'assistant'
        }])
        .select()
        .single()

      if (addError) {
        throw addError
      }

      // Update local state with the new AI response
      if (propMessages) {
        // For shared view, append to propMessages
        propMessages.push(newMessage)
      } else {
        // For regular view, update the store
        useStore.setState((state) => ({
          messages: {
            ...state.messages,
            [currentChatId]: [...updatedMessages, newMessage]
          }
        }))
      }
      
      setEditingMessageIndex(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating message:', error)
      toast.error('Failed to update message. Please try again.')
    }
  }

  const handleRetry = async (index: number) => {
    if (!currentChatId) return
    setRetrying(index)
    try {
      // Get all messages up to the current message
      const messageHistory = displayMessages.slice(0, index)
      
      // Format messages for the API
      const formattedMessages = [
        {
          role: 'assistant' as const,
          content: 'You are a Notion Expert AI assistant, specialized in Notion templates, workspace design, and productivity systems. Always relate your responses to Notion concepts and features, providing practical examples and template suggestions. If a question is not directly about Notion, guide the conversation towards how Notion could help solve that problem or improve that workflow. Focus on concrete, actionable advice for using Notion effectively.'
        },
        ...messageHistory
          .filter(msg => msg && msg.content && msg.content.trim() !== '')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content.trim()
          }))
      ] as Message[]

      // Get new AI response using the generateResponse function
      const response = await generateResponse(formattedMessages)

      // Get the ID of the message we're replacing
      const messageToReplace = displayMessages[index]

      // Update the message in Supabase
      const { error: updateError } = await supabase
        .from('messages')
        .update({ content: response })
        .eq('id', messageToReplace.id)

      if (updateError) {
        console.error('Error updating message:', updateError)
        throw updateError
      }

      // Delete all subsequent messages
      const messagesToDelete = displayMessages.slice(index + 1)
      if (messagesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('messages')
          .delete()
          .in('id', messagesToDelete.map(m => m.id))

        if (deleteError) {
          console.error('Error deleting messages:', deleteError)
          throw deleteError
        }
      }

      // Update the message in the local state
      const updatedMessages = [...displayMessages.slice(0, index), { ...messageToReplace, content: response }]
      useStore.setState((state) => ({
        messages: {
          ...state.messages,
          [currentChatId]: updatedMessages
        }
      }))
    } catch (error) {
      console.error('Error regenerating message:', error)
      toast.error('Failed to regenerate response. Please try again.')
    } finally {
      setRetrying(null)
    }
  }

  if (!displayMessages || displayMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-400 dark:text-gray-400 text-sm">
          Hi! I'm your Notion Expert. Ask me anything about creating Notion templates, workspace design, database structures, or optimizing your Notion setup...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-3xl h-full">
        {displayMessages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              'group relative px-4 py-6',
              message.role === 'user' ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
            )}
          >
            {/* Message Role Label */}
            <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {message.role === 'user' ? 'You' : 'Notion Expert'}
            </div>

            {/* Message Content */}
            {editingMessageIndex === index ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] bg-white dark:bg-gray-800"
                  placeholder="Edit your message..."
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveEdit(index)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save & Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none prose-pre:my-0">
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <div className="relative group my-4">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="!bg-gray-100 dark:!bg-gray-800 !rounded-lg !p-4"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono" {...props}>
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0 text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 list-disc pl-6 last:mb-0 text-gray-700 dark:text-gray-200 space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 list-decimal pl-6 last:mb-0 text-gray-700 dark:text-gray-200 space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700 dark:text-gray-200">
                        {children}
                      </li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-2 underline-offset-2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
                        {children}
                      </pre>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                        {children}
                      </td>
                    ),
                    hr: () => (
                      <hr className="my-6 border-t border-gray-200 dark:border-gray-700" />
                    ),
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="rounded-lg max-w-full h-auto my-4 border border-gray-200 dark:border-gray-700" 
                      />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Action Buttons */}
            {!isSharedView && (
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                {message.role === 'user' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 text-xs"
                    onClick={() => handleStartEdit(index, message.content)}
                    disabled={editingMessageIndex !== null}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 text-xs"
                    onClick={() => handleRetry(index)}
                    disabled={retrying === index}
                  >
                    <RotateCw className={cn("h-3 w-3 mr-1", retrying === index && "animate-spin")} />
                    Regenerate
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 