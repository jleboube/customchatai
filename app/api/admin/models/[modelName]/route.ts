import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// DELETE /api/admin/models/[modelName] - Delete a model (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ modelName: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modelName } = await params

    // Ollama API base URL without /v1 suffix
    const ollamaBaseUrl = process.env.LLM_API_BASE_URL?.replace('/v1', '') || 'http://model-runner:11434'

    // Delete model from Ollama
    const response = await fetch(`${ollamaBaseUrl}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Failed to delete model: ${error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Model ${modelName} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
