import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/chat/message - Send a message and get AI response
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { chatId, message, model = 'llama3.2:3b' } = body

    // Get or create chat
    let chat
    if (chatId) {
      // Verify chat ownership
      chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
      }
    } else {
      // Create new chat
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          model: model,
        },
        include: {
          messages: true,
        },
      })
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
      },
    })

    // Call Ollama API
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'
    const llmResponse = await fetch(
      `${ollamaBaseUrl}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            ...chat.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: 'user',
              content: message,
            },
          ],
          stream: false,
        }),
      }
    )

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error('Ollama API error:', errorText)
      throw new Error(`LLM API request failed: ${llmResponse.status}`)
    }

    const llmData = await llmResponse.json()
    const assistantContent =
      llmData.message?.content || 'No response from AI'

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: assistantContent,
      },
    })

    // Update chat title if it's the first message
    if (chat.messages.length === 0) {
      const title = message.slice(0, 50) + (message.length > 50 ? '...' : '')
      await prisma.chat.update({
        where: { id: chat.id },
        data: { title },
      })
    }

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      message: assistantMessage,
      userMessage,
      chatId: chat.id,
    })
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
