import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/models - Get installed models (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ollama API base URL without /v1 suffix for listing models
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'

    // Fetch models from Ollama
    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch models' },
        { status: 500 }
      )
    }

    const data = await response.json()
    return NextResponse.json({ models: data.models || [] })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/models - Pull a new model (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { modelName } = body

    if (!modelName) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      )
    }

    // Ollama API base URL without /v1 suffix
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'

    // Stream the pull progress from Ollama
    const response = await fetch(`${ollamaBaseUrl}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Failed to pull model: ${error}` },
        { status: 500 }
      )
    }

    // Stream the response back to the client
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Forward the chunk to the client
            controller.enqueue(value)
          }
        } catch (error) {
          console.error('Error streaming model pull:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error pulling model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
