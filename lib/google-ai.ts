import { GoogleGenerativeAI } from '@google/generative-ai'

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

if (!apiKey) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set. AI functionality will not work.')
}

// Initialize the AI only if we have an API key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI?.getGenerativeModel({ 
  model: 'gemini-pro',
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
    // Format messages for the Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // Generate the response
    const result = await model.generateContent({
      contents: formattedMessages,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      }
    })

    const response = await result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('No response generated from the AI model')
    }

    return text
  } catch (error) {
    console.error('Error generating response:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Unable to access the AI model. Please check your API key and permissions.')
      }
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Invalid API key or insufficient permissions.')
      }
      throw new Error(`AI response error: ${error.message}`)
    }
    
    throw new Error('Failed to generate AI response. Please try again.')
  }
} 