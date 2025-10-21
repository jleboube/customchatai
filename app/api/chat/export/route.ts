import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chat/export?chatId=xxx&format=json - Export chat to JSON or CSV
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const chatId = searchParams.get('chatId')
    const format = searchParams.get('format') || 'json'

    if (!chatId) {
      return NextResponse.json(
        { error: 'Missing chatId parameter' },
        { status: 400 }
      )
    }

    // Get chat with messages
    const chat = await prisma.chat.findFirst({
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

    if (format === 'csv') {
      // Export as CSV
      let csv = 'Timestamp,Role,Content\n'

      chat.messages.forEach((msg) => {
        const timestamp = new Date(msg.createdAt).toISOString()
        const content = msg.content.replace(/"/g, '""') // Escape quotes
        csv += `"${timestamp}","${msg.role}","${content}"\n`
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="chat-${chatId}.csv"`,
        },
      })
    } else {
      // Export as JSON
      const exportData = {
        id: chat.id,
        title: chat.title,
        model: chat.model,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt,
        })),
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="chat-${chatId}.json"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
