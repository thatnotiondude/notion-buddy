import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { message } = await req.json()
    if (!message) {
      return new NextResponse('Message is required', { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a concise, descriptive title for this chat conversation. The title should be a short summary of the main topic or question. Keep it under 50 characters and make it clear and informative.

Message: ${message}

Title:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const title = response.text().trim()

    if (!title) {
      throw new Error('No title generated')
    }

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating title:', error)
    return new NextResponse('Failed to generate title', { status: 500 })
  }
} 