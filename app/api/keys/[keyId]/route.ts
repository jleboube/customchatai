import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/keys/[keyId] - Delete an API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId } = await params

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    await prisma.apiKey.delete({
      where: {
        id: keyId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/keys/[keyId] - Toggle API key active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId } = await params
    const body = await req.json()
    const { isActive } = body

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const updatedKey = await prisma.apiKey.update({
      where: {
        id: keyId,
      },
      data: {
        isActive,
      },
    })

    return NextResponse.json({ apiKey: updatedKey })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
