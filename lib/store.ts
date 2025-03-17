import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

export type Chat = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  addChat: () => void
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'createdAt'>) => void
  updateChatTitle: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void
}

export const useStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: [],
      currentChatId: null,
      addChat: () => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }))
      },
      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId })
      },
      addMessage: (chatId, message) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    ...message,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            }
            return chat
          }),
        }))
      },
      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                title,
                updatedAt: new Date(),
              }
            }
            return chat
          }),
        }))
      },
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId:
            state.currentChatId === chatId
              ? state.chats[1]?.id ?? null
              : state.currentChatId,
        }))
      },
    }),
    {
      name: 'chat-storage',
    }
  )
) 