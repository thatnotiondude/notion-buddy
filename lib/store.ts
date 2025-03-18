import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Chat, Message } from './types'

interface ChatState {
  chats: (Chat & { messages: Message[] })[]
  messages: { [chatId: string]: Message[] }
  currentChatId: string | null
  addChat: (title?: string) => Promise<Chat & { messages: Message[] } | undefined>
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant', index?: number) => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  fetchChats: () => Promise<void>
  fetchMessages: (chatId: string) => Promise<void>
  shareChat: (chatId: string) => Promise<string>
  unshareChat: (chatId: string) => Promise<void>
}

export const useStore = create<ChatState>()((set, get) => {
  const supabase = createClientComponentClient()

  return {
      chats: [],
    messages: {},
      currentChatId: null,

    fetchChats: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No authenticated user')

        const { data: chats, error: chatsError } = await supabase
          .from('chats')
          .select('*, messages(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (chatsError) throw chatsError
        if (!chats) throw new Error('No chats returned')

        set({ chats: chats.map(chat => ({ ...chat, messages: chat.messages || [] })) })
      } catch (error) {
        console.error('Error fetching chats:', error)
        throw error
      }
    },

    fetchMessages: async (chatId: string) => {
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })

        if (error) throw error
        if (!messages) throw new Error('No messages returned')

        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: messages
          }
        }))
      } catch (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
    },

    addChat: async (title: string = 'New Chat') => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: chat, error } = await supabase
          .from('chats')
          .insert({
            user_id: user.id,
            title: title
          })
          .select()
          .single()

        if (error) throw error
        if (!chat) throw new Error('Failed to create chat')

        set((state) => ({
          chats: [...state.chats, chat],
          currentChatId: chat.id
        }))

        return chat
      } catch (error) {
        console.error('Error creating chat:', error)
        throw error
      }
    },

    setCurrentChat: async (chatId) => {
      try {
        const state = get()
        set({ currentChatId: chatId })
        
        if (!state.messages[chatId]) {
          await state.fetchMessages(chatId)
        }
      } catch (error) {
        console.error('Error in setCurrentChat:', error)
        throw error
      }
    },

    addMessage: async (chatId: string, content: string, role: 'user' | 'assistant', index?: number) => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No authenticated user')

        // If index is provided, we're updating an existing message
        if (typeof index === 'number') {
          const { data: existingMessage, error: messageError } = await supabase
            .from('messages')
            .select('id')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .range(index, index)
            .single()

          if (messageError) throw messageError
          if (!existingMessage) throw new Error('Message not found')

          const { error: updateError } = await supabase
            .from('messages')
            .update({ content })
            .eq('id', existingMessage.id)

          if (updateError) throw updateError

          // Update local state
          set(state => ({
            chats: state.chats.map(chat => {
              if (chat.id === chatId) {
                const newMessages = [...chat.messages]
                newMessages[index] = { ...newMessages[index], content }
                return { ...chat, messages: newMessages }
              }
              return chat
            })
          }))
        } else {
          // Add new message
          const { data: message, error: messageError } = await supabase
            .from('messages')
            .insert([
              {
                chat_id: chatId,
                content,
                role,
                user_id: user.id,
              },
            ])
            .select()
            .single()

          if (messageError) throw messageError
          if (!message) throw new Error('No message returned')

          // Update local state
          set(state => ({
            chats: state.chats.map(chat => {
              if (chat.id === chatId) {
                return { ...chat, messages: [...chat.messages, message] }
              }
              return chat
            })
          }))
        }

        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)
      } catch (error) {
        console.error('Error adding/updating message:', error)
        throw error
      }
    },

    updateChatTitle: async (chatId, title) => {
      try {
        const { data: chat, error } = await supabase
          .from('chats')
          .update({ title })
          .eq('id', chatId)
          .select()
          .single()

        if (error) throw error
        if (!chat) throw new Error('No chat returned after update')

        set((state) => ({
          chats: state.chats.map((c) => 
            c.id === chatId ? { ...c, ...chat } : c
          )
        }))
      } catch (error) {
        console.error('Error in updateChatTitle:', error)
        throw error
      }
    },

    deleteChat: async (chatId) => {
      try {
        const { error: deleteError } = await supabase
          .from('chats')
          .delete()
          .eq('id', chatId)

        if (deleteError) throw deleteError

        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          messages: Object.fromEntries(
            Object.entries(state.messages).filter(([id]) => id !== chatId)
          ),
          currentChatId:
            state.currentChatId === chatId
              ? state.chats[1]?.id ?? null
              : state.currentChatId,
        }))
      } catch (error) {
        console.error('Error in deleteChat:', error)
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
        const shareId = chat.share_id || crypto.randomUUID()
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