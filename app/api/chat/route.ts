import { NextResponse } from 'next/server'
import { generateResponse } from '@/lib/google-ai'

export async function POST(req: Request) {
  if (!process.env.GOOGLE_AI_API_KEY && !process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please set up your API key.' },
      { status: 503 }
    )
  }

  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const response = await generateResponse(messages)
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response'
    
    // Determine appropriate status code based on error
    const status = errorMessage.includes('API key') || errorMessage.includes('permissions') ? 401 : 500
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    )
  }
} 