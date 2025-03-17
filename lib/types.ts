export type Message = {
  id: string
  chat_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export type Chat = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: Chat
        Insert: Omit<Chat, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Chat, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
    }
  }
} 