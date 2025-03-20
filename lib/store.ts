import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Chat, Message } from './types'

interface ChatState {
  chats: (Chat & { messages: Message[] })[]
  messages: { [chatId: string]: Message[] }
  currentChatId: string | null
  addChat: (title?: string) => Promise<(Chat & { messages: Message[] }) | undefined>
  setCurrentChat: (chatId: string) => Promise<string>
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant', index?: number) => Promise<{ error: string | null }>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  fetchChats: () => Promise<void>
  fetchMessages: (chatId: string) => Promise<void>
  shareChat: (chatId: string) => Promise<string>
  unshareChat: (chatId: string) => Promise<void>
  initialized: boolean
  isInitializing: boolean
  initialize: () => Promise<void>
  error: string | null
  setError: (error: string | null) => void
}

export const useStore = create<ChatState>((set, get) => {
  const supabase = createClientComponentClient()
  let isInitializing = false
  let initializationPromise: Promise<void> | null = null
  let initializationTimeout: NodeJS.Timeout | null = null

  const clearInitializationState = () => {
    isInitializing = false
    initializationPromise = null
    if (initializationTimeout) {
      clearTimeout(initializationTimeout)
      initializationTimeout = null
    }
  }

  const initialize = async (): Promise<void> => {
    if (isInitializing && initializationPromise) {
      console.log('Store: Already initializing, returning existing promise')
      return initializationPromise
    }

    if (get().initialized) {
      console.log('Store: Already initialized')
      return Promise.resolve()
    }

    isInitializing = true
    initializationPromise = (async () => {
      try {
        // Reset store state
        set({ 
          chats: [], 
          messages: {}, 
          currentChatId: null, 
          initialized: false, 
          isInitializing: true,
          error: null 
        })

        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        if (!currentSession?.user) throw new Error('No authenticated session found')

        const { data: chats, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .order('created_at', { ascending: false })

        if (chatsError) throw chatsError

        set({ chats: chats || [] })

        await Promise.all((chats || []).map(async (chat) => {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true })

          if (messagesError) {
            console.error(`Error fetching messages for chat ${chat.id}:`, messagesError)
            return
          }

          set((state) => ({
            messages: {
              ...state.messages,
              [chat.id]: messages || []
            }
          }))
        }))

        set({ initialized: true, isInitializing: false })
      } catch (error) {
        console.error('Store: Initialization error:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to initialize store', isInitializing: false })
        clearInitializationState()
        throw error
      }
    })()

    return initializationPromise
  }

  const generateTitle = async (message: string, chatId: string) => {
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to generate title');
      const { title } = await response.json();
      
      if (title) {
        const { error: titleError } = await supabase
          .from('chats')
          .update({ title })
          .eq('id', chatId);

        if (!titleError) {
          set(state => ({
            chats: state.chats.map(c => 
              c.id === chatId ? { ...c, title } : c
            )
          }));
        }
      }
    } catch (error) {
      console.error('Error generating title:', error);
      // Fallback to first line if AI fails
      const fallbackTitle = message.split('\n')[0].slice(0, 50);
      if (fallbackTitle) {
        const { error: titleError } = await supabase
          .from('chats')
          .update({ title: fallbackTitle })
          .eq('id', chatId);

        if (!titleError) {
          set(state => ({
            chats: state.chats.map(c => 
              c.id === chatId ? { ...c, title: fallbackTitle } : c
            )
          }));
        }
      }
    }
  };

  return {
    chats: [],
    messages: {},
    currentChatId: null,
    initialized: false,
    isInitializing: false,
    error: null,

    setError: (error) => set({ error }),

    initialize: initialize,

    fetchChats: async () => {
      try {
        console.log('Store: Starting fetchChats...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Store: Error getting session:', sessionError)
          set({ error: sessionError.message })
          return
        }
        
        if (!session?.user) {
          console.log('Store: No authenticated user, skipping fetch')
          set({ error: 'No authenticated user' })
          return
        }

        console.log('Store: Fetching chats for user:', session.user.id)
        const { data: chats, error: chatsError } = await supabase
          .from('chats')
          .select('*, messages(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (chatsError) {
          console.error('Store: Error fetching chats:', chatsError)
          set({ error: chatsError.message })
          return
        }

        const processedChats = chats?.map(chat => ({ ...chat, messages: chat.messages || [] })) ?? []
        console.log('Store: Processed chats:', {
          count: processedChats.length,
          chats: processedChats
        })
        
        set({ 
          chats: processedChats,
          currentChatId: processedChats.length > 0 ? processedChats[0].id : null,
          error: null
        })
        console.log('Store: State updated with chats')
      } catch (error) {
        console.error('Store: Error in fetchChats:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to fetch chats' })
      }
    },

    fetchMessages: async (chatId: string) => {
      try {
        console.log('Store: Starting message fetch for chat:', chatId)
        
        // Add timeout handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Message fetch timeout')), 10000)
        })

        const fetchPromise = supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })

        const { data: messages, error } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as { data: any, error: any }

        if (error) {
          console.error('Store: Error fetching messages:', error)
          throw error
        }
        if (!messages) {
          console.error('Store: No messages returned')
          throw new Error('No messages returned')
        }

        console.log('Store: Successfully fetched messages:', {
          chatId,
          messageCount: messages.length,
          firstMessage: messages[0],
          lastMessage: messages[messages.length - 1]
        })

        set((state) => {
          // Update messages in chats array
          const updatedChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              // Use the messages from the database directly
              return { ...chat, messages }
            }
            return chat
          })

          // Update messages in messages object
          const updatedMessages = {
            ...state.messages,
            [chatId]: messages
          }

          console.log('Store: Updated state with fetched messages:', {
            chatId,
            chatMessagesCount: updatedChats.find(c => c.id === chatId)?.messages.length,
            messagesCount: updatedMessages[chatId]?.length,
            currentChatId: state.currentChatId
          })

          return {
            chats: updatedChats,
            messages: updatedMessages,
            error: null
          }
        })
      } catch (error) {
        console.error('Store: Error in fetchMessages:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to fetch messages' })
      }
    },

    addChat: async (title: string = 'New Chat') => {
      try {
        console.log('Creating new chat with title:', title)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No authenticated user found')
          throw new Error('Not authenticated')
        }

        const { data: chat, error } = await supabase
          .from('chats')
          .insert({
            user_id: user.id,
            title: title
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating chat:', error)
          throw error
        }
        if (!chat) {
          console.error('No chat returned from insert')
          throw new Error('Failed to create chat')
        }

        console.log('Chat created successfully:', chat.id)

        // Initialize the chat with an empty messages array
        const chatWithMessages = { ...chat, messages: [] }

        set((state) => ({
          chats: [...state.chats, chatWithMessages],
          currentChatId: chat.id,
          messages: {
            ...state.messages,
            [chat.id]: []
          },
          error: null
        }))

        return chatWithMessages
      } catch (error) {
        console.error('Error in addChat:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to create chat' })
        return null
      }
    },

    setCurrentChat: async (chatId) => {
      console.log('Store: Setting current chat:', chatId)
      try {
        const state = get()
        set({ currentChatId: chatId })
        
        if (!state.messages[chatId]) {
          await state.fetchMessages(chatId)
        }

        return chatId // Return the chatId to indicate success
      } catch (error) {
        console.error('Store: Error setting current chat:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to set current chat' })
        throw error
      }
    },

    addMessage: async (chatId: string, content: string, role: 'user' | 'assistant', index?: number) => {
      try {
        console.log('Adding message:', { chatId, role, index })
        
        // Get current messages for this chat
        const currentMessages = get().messages[chatId] || []
        console.log('Current messages:', currentMessages)

        // If index is provided, we're updating an existing message
        if (typeof index === 'number' && index >= 0) {
          console.log('Updating existing message at index:', index)
          
          // Find the message to update
          const messageToUpdate = currentMessages[index]
          if (!messageToUpdate) {
            throw new Error('Message not found at specified index')
          }

          // Update the message in the database
          const { data: updatedMessage, error: updateError } = await supabase
            .from('messages')
            .update({ content })
            .eq('id', messageToUpdate.id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating message:', updateError)
            throw updateError
          }

          if (!updatedMessage) {
            throw new Error('Message not found in database')
          }

          // Remove all messages after this index
          const messagesToDelete = currentMessages.slice(index + 1)
          if (messagesToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('messages')
              .delete()
              .in('id', messagesToDelete.map(m => m.id))

            if (deleteError) {
              console.error('Error deleting subsequent messages:', deleteError)
              throw deleteError
            }
          }

          // Update local state
          set(state => ({
            messages: {
              ...state.messages,
              [chatId]: [
                ...currentMessages.slice(0, index),
                updatedMessage,
                ...currentMessages.slice(index + 1)
              ]
            }
          }))

          return { error: null }
        }

        // Create new message
        const { data: newMessage, error: insertError } = await supabase
          .from('messages')
          .insert([
            {
              chat_id: chatId,
              content,
              role
            }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting message:', insertError)
          throw insertError
        }

        if (!newMessage) {
          throw new Error('Failed to create new message')
        }

        // Update local state
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage]
          }
        }))

        // If this is the first user message, generate a title
        if (role === 'user' && currentMessages.length === 0) {
          generateTitle(content, chatId)
        }

        return { error: null }
      } catch (error) {
        console.error('Error in addMessage:', error)
        return { error: error instanceof Error ? error.message : 'Failed to add message' }
      }
    },

    updateChatTitle: async (chatId, title) => {
      try {
        console.log('Store: Starting updateChatTitle for chat:', chatId, 'with title:', title)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Store: Auth error in updateChatTitle:', userError)
          throw userError
        }
        if (!user) {
          console.error('Store: No authenticated user found in updateChatTitle')
          throw new Error('Not authenticated')
        }

        const { data: chat, error } = await supabase
          .from('chats')
          .update({ title })
          .eq('id', chatId)
          .eq('user_id', user.id) // Ensure we can only update our own chats
          .select()
          .single()

        if (error) {
          console.error('Store: Error updating chat title:', error)
          throw error
        }
        if (!chat) {
          console.error('Store: No chat returned after update')
          throw new Error('No chat returned after update')
        }

        console.log('Store: Chat title updated successfully:', chat)

        set((state) => ({
          chats: state.chats.map((c) => 
            c.id === chatId ? { ...c, ...chat } : c
          )
        }))
      } catch (error) {
        console.error('Store: Error in updateChatTitle:', error)
        throw error
      }
    },

    deleteChat: async (chatId) => {
      try {
        console.log('Store: Starting deleteChat for chat:', chatId)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Store: Auth error in deleteChat:', userError)
          throw userError
        }
        if (!user) {
          console.error('Store: No authenticated user found in deleteChat')
          throw new Error('Not authenticated')
        }

        // Delete the chat
        const { error: deleteError } = await supabase
          .from('chats')
          .delete()
          .eq('id', chatId)
          .eq('user_id', user.id) // Ensure we can only delete our own chats

        if (deleteError) {
          console.error('Store: Error deleting chat:', deleteError)
          throw deleteError
        }

        console.log('Store: Chat deleted successfully')

        // Update local state
        set((state) => {
          const remainingChats = state.chats.filter((c) => c.id !== chatId)
          const { [chatId]: _, ...remainingMessages } = state.messages

          // If we're deleting the current chat, switch to another one
          let newCurrentChatId = state.currentChatId
          if (state.currentChatId === chatId) {
            newCurrentChatId = remainingChats[0]?.id ?? null
          }

          console.log('Store: Updating state after deletion:', {
            remainingChatsCount: remainingChats.length,
            newCurrentChatId
          })

          return {
            chats: remainingChats,
            messages: remainingMessages,
            currentChatId: newCurrentChatId,
            error: null
          }
        })

        // If we have no chats left, create a new one
        const state = get()
        if (state.chats.length === 0) {
          console.log('Store: No chats remaining, creating new chat')
          await state.addChat('New Chat')
        }
      } catch (error) {
        console.error('Store: Error in deleteChat:', error)
        throw error
      }
    },

    shareChat: async (chatId: string) => {
      try {
        console.log('Starting share process for chat:', chatId)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Error getting user:', userError)
          throw userError
        }
        if (!user) {
          console.error('No authenticated user')
          throw new Error('Not authenticated')
        }

        // First check if the chat exists and belongs to the user
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .eq('user_id', user.id)
          .single()

        if (chatError) {
          console.error('Error fetching chat:', chatError)
          throw chatError
        }
        if (!chat) {
          console.error('Chat not found or does not belong to user')
          throw new Error('Chat not found or does not belong to user')
        }

        // Generate a unique share ID if it doesn't exist
        const shareId = chat.share_id || generateShareId()
        console.log('Generated share ID:', shareId)

        // Update the chat with the share ID and set it as shared
        const { error: updateError } = await supabase
          .from('chats')
          .update({ 
            share_id: shareId,
            is_shared: true 
          })
          .eq('id', chatId)
          .eq('user_id', user.id) // Ensure we can only update our own chats

        if (updateError) {
          console.error('Error updating chat:', updateError)
          throw updateError
        }

        // Return the full share URL
        const shareUrl = `${window.location.origin}/shared/${shareId}`
        console.log('Generated share URL:', shareUrl)
        return shareUrl
      } catch (error) {
        console.error('Error in shareChat:', error)
        throw error
      }
    },

    unshareChat: async (chatId: string) => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No authenticated user')

        const { error: updateError } = await supabase
          .from('chats')
          .update({ is_shared: false })
          .eq('id', chatId)

        if (updateError) throw updateError
      } catch (error) {
        console.error('Error unsharing chat:', error)
        throw error
      }
    },
  }
}) 

function generateShareId(): string {
  // Generate a UUID v4
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
} 