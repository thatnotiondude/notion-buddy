import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ChatMessages } from '@/components/chat-messages'
import { Database } from '@/lib/database.types'

interface SharedChatPageProps {
  params: {
    id: string
  }
}

export default async function SharedChatPage({ params }: SharedChatPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: share } = await supabase
    .from('shares')
    .select(`
      id,
      chat_id,
      chat:chats!inner(id),
      messages:messages!inner(
        id,
        chat_id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!share) {
    notFound()
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Shared Chat
            </h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ChatMessages 
              messages={share.messages} 
              isSharedView 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 