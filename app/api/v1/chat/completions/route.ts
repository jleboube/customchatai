import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { trackUsage, estimateTokens } from '@/lib/analytics'

// POST /api/v1/chat/completions - OpenAI-compatible chat completions endpoint
export async function POST(req: NextRequest) {
  const startTime = Date.now()

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

    // Parse request body
    const body = await req.json()
    const { model = 'llama3.2:3b', messages, stream = false } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Forward request to Ollama API
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'
    const llmResponse = await fetch(
      `${ollamaBaseUrl}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
        }),
      }
    )

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error('Ollama API error:', errorText)
      throw new Error(`LLM API request failed: ${llmResponse.status}`)
    }

    // Handle streaming response
    if (stream) {
      // TODO: Convert Ollama streaming format to OpenAI format
      return new Response(llmResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '100',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      })
    }

    // Handle non-streaming response - Convert Ollama format to OpenAI format
    const ollamaData = await llmResponse.json()

    // Calculate token estimates
    const promptText = messages.map((m: { content: string }) => m.content).join(' ')
    const completionText = ollamaData.message?.content || ''
    const promptTokens = estimateTokens(promptText)
    const completionTokens = estimateTokens(completionText)
    const totalTokens = promptTokens + completionTokens

    // Convert Ollama response format to OpenAI format
    const openaiData = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: ollamaData.message?.role || 'assistant',
            content: completionText,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
    }

    // Track usage metrics
    const responseTime = Date.now() - startTime
    await trackUsage({
      userId: key.userId,
      model,
      promptTokens,
      completionTokens,
      responseTimeMs: responseTime,
      endpoint: '/api/v1/chat/completions',
    })

    return NextResponse.json(openaiData, {
      headers: {
        'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    })
  } catch (error) {
    console.error('Chat completions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
