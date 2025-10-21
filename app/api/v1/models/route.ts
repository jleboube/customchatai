import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

// GET /api/v1/models - List available models (OpenAI-compatible)
export async function GET(req: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Validate API key
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    })

    if (!key || !key.isActive) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(apiKey)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '100',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    })

    // Fetch available models from Ollama
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'

    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch models from Ollama:', response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch models' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Convert Ollama format to OpenAI format
    const models = data.models?.map((m: any) => ({
      id: m.name,
      object: 'model',
      created: Math.floor(new Date(m.modified_at).getTime() / 1000),
      owned_by: 'ollama',
      permission: [],
      root: m.name,
      parent: null,
    })) || []

    return NextResponse.json(
      {
        object: 'list',
        data: models,
      },
      {
        headers: {
          'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '100',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
