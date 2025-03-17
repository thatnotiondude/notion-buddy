import { GoogleGenerativeAI } from '@google/generative-ai'

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

if (!apiKey) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set. AI functionality will not work.')
}

// Initialize the AI only if we have an API key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI?.getGenerativeModel({ 
  model: 'gemini-1.5-pro-001',
  generationConfig: {
  maxOutputTokens: 2048,
    temperature: 0.7,
  }
})

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export async function generateResponse(messages: Message[]): Promise<string> {
  if (!genAI || !model) {
    throw new Error('Google AI is not properly configured. Please check your environment variables.')
  }

  try {
    // Combine all messages into a single context
    const context = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')

    // Generate the response
    const result = await model.generateContent(context)
  const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating response:', error)
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error('Unable to access the AI model. Please check your API key and permissions.')
    }
    throw new Error('Failed to generate AI response. Please try again.')
  }
} 