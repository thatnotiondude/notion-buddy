import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
    }
  }
  
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get user with retry
    const userResponse = await withRetry(async () => 
      await supabase.auth.getUser()
    )
    
    if (userResponse.error || !userResponse.data.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = userResponse.data.user

    const body = await req.json()
    const { chatId } = body
    if (!chatId) {
      return new NextResponse('Chat ID is required', { status: 400 })
    }

    // Get the chat and verify ownership with retry
    const chatResponse = await withRetry(async () =>
      await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single()
    )

    if (chatResponse.error) {
      console.error('Error fetching chat:', chatResponse.error)
      return new NextResponse('Chat not found', { status: 404 })
    }

    // Generate a UUID v4 for the share ID
    const shareId = generateUUID()

    // Update the chat with retry
    const updateResponse = await withRetry(async () =>
      await supabase
        .from('chats')
        .update({ 
          share_id: shareId,
          is_shared: true 
        })
        .eq('id', chatId)
    )

    if (updateResponse.error) {
      console.error('Error updating chat:', updateResponse.error)
      return new NextResponse('Failed to share chat', { status: 500 })
    }

    return NextResponse.json({ shareId })
  } catch (error) {
    console.error('Error in share API:', error)
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return new NextResponse('Database connection timeout. Please try again.', { status: 503 })
      }
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 