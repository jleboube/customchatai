import { prisma } from './prisma'

interface TrackUsageParams {
  userId: string
  model: string
  promptTokens?: number
  completionTokens?: number
  responseTimeMs: number
  endpoint: string
}

export async function trackUsage({
  userId,
  model,
  promptTokens = 0,
  completionTokens = 0,
  responseTimeMs,
  endpoint,
}: TrackUsageParams) {
  try {
    const totalTokens = promptTokens + completionTokens

    await prisma.usageMetric.create({
      data: {
        userId,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        responseTimeMs,
        endpoint,
      },
    })
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Failed to track usage:', error)
  }
}

// Estimate token count (rough approximation: ~4 chars per token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
