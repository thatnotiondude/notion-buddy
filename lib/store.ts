import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Chat, Message } from './types'

interface ChatState {
  chats: (Chat & { messages: Message[] })[]
  messages: { [chatId: string]: Message[] }
  currentChatId: string | null
  addChat: () => Promise<Chat & { messages: Message[] } | undefined>
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant') => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  fetchChats: () => Promise<void>
  fetchMessages: (chatId: string) => Promise<void>
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

    addChat: async () => {
      try {
        console.log('Starting chat creation process...')
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Error getting user:', userError)
          throw userError
        }
        if (!user) {
          console.error('No authenticated user found')
          throw new Error('No authenticated user')
        }

        console.log('Creating chat for user:', user.id)

        const { data: chat, error: insertError } = await supabase
          .from('chats')
          .insert({
            user_id: user.id,
            title: 'New Chat'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting chat:', insertError)
          throw insertError
        }
        if (!chat) {
          console.error('No chat returned after insert')
          throw new Error('No chat returned after insert')
        }

        console.log('Chat created successfully:', chat)

        const newChat = { ...chat, messages: [] }
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: chat.id
        }))

        return newChat
      } catch (error) {
        console.error('Failed to create chat:', error)
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

    addMessage: async (chatId, content, role) => {
      try {
        const { data: message, error: insertError } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            content,
            role
          })
          .select()
          .single()

        if (insertError) throw insertError
        if (!message) throw new Error('No message returned after insert')

        set((state) => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, message]
              }
            }
            return chat
          }),
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message]
          }
        }))

        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)
      } catch (error) {
        console.error('Error in addMessage:', error)
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
    }
  }
}) 