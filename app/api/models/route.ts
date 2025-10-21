import { NextRequest, NextResponse } from 'next/server'

// GET /api/models - Get available models from Ollama
export async function GET(req: NextRequest) {
  try {
    // Ollama API base URL without /v1 suffix for listing models
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'

    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch models from Ollama:', response.statusText)
      return NextResponse.json({ models: [] })
    }

    const data = await response.json()
    const models = data.models?.map((m: any) => m.name) || []

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ models: [] })
  }
}
