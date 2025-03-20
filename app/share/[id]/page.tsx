import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ChatMessages } from '@/components/chat-messages'

interface SharedChatPageProps {
  params: {
    id: string
  }
}

export default async function SharedChatPage({ params }: SharedChatPageProps) {
  const share = await db.share.findUnique({
    where: {
      id: params.id,
    },
    include: {
      chat: {
        include: {
          messages: true,
        },
      },
    },
  })

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
              messages={share.chat.messages.map(msg => ({
                id: msg.id,
                chat_id: msg.chatId,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                created_at: msg.createdAt.toISOString()
              }))} 
              isSharedView 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 