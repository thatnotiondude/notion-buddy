import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ChatMessages } from '@/components/chat-messages'
import { Database } from '@/lib/database.types'
import { Metadata, ResolvingMetadata } from 'next'

interface SharedChatPageProps {
  params: {
    id: string
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: SharedChatPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get the share and chat info
  const { data: share } = await supabase
    .from('shares')
    .select(`
      id,
      chat_id,
      chat:chats!inner(
        id,
        title
      )
    `)
    .eq('id', params.id)
    .single()

  // Get the first message to use as description if no title
  const { data: firstMessage } = await supabase
    .from('messages')
    .select('content')
    .eq('chat_id', share?.chat_id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Fallback values if data not found
  const title = share?.chat[0]?.title || 'Shared Chat'
  const description = firstMessage?.content?.slice(0, 200) || 'A conversation with Notion Expert AI'

  // Get the base URL from environment or fallback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create the OG image URL with the chat title
  const ogImageUrl = new URL('/api/og', baseUrl)
  ogImageUrl.searchParams.set('title', title)

  return {
    title: `${title} | Notion Expert AI`,
    description,
    openGraph: {
      title: `${title} | Notion Expert AI`,
      description,
      type: 'article',
      url: `${baseUrl}/share/${params.id}`,
      siteName: 'Notion Expert AI',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Notion Expert AI`,
      description,
      images: [ogImageUrl.toString()]
    }
  }
}

export default async function SharedChatPage({ params }: SharedChatPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // First get the share and chat info
  const { data: share } = await supabase
    .from('shares')
    .select(`
      id,
      chat_id,
      chat:chats!inner(
        id,
        title
      )
    `)
    .eq('id', params.id)
    .single()

  if (!share) {
    notFound()
  }

  // Then get the messages for this chat
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', share.chat_id)
    .order('created_at', { ascending: true })

  if (!messages) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center px-4 h-14 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {share.chat[0]?.title || 'Shared Chat'}
          </h1>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <ChatMessages 
              messages={messages} 
              isSharedView 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 