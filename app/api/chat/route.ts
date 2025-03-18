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
    
    if (!response) {
      throw new Error('No response generated from the AI model')
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    
    if (error instanceof Error) {
      // Determine appropriate status code based on error message
      let status = 500
      if (error.message.includes('API key') || error.message.includes('permissions')) {
        status = 401
      } else if (error.message.includes('Rate limit')) {
        status = 429
      } else if (error.message.includes('Invalid messages format')) {
        status = 400
      }
      
      return NextResponse.json(
        { error: error.message },
        { status }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
} 