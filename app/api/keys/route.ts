import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateId } from '@/lib/utils'

// GET /api/keys - Get all API keys for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsed: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/keys - Create a new API key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name = 'API Key' } = body

    // Generate a unique API key
    const key = `cc_${generateId(32)}`

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        key,
      },
    })

    return NextResponse.json({ apiKey }, { status: 201 })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
