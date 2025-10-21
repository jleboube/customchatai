import { prisma } from './prisma'

const RATE_LIMIT_REQUESTS = parseInt(
  process.env.RATE_LIMIT_REQUESTS || '100',
  10
)
const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_WINDOW || '60000',
  10
) // milliseconds

export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW)

    // Find or create rate limit record
    let rateLimit = await prisma.rateLimit.findUnique({
      where: { key },
    })

    if (!rateLimit) {
      rateLimit = await prisma.rateLimit.create({
        data: {
          key,
          count: 0,
          resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW),
        },
      })
    }

    // Check if window has expired
    if (rateLimit.resetAt < now) {
      // Reset the counter
      rateLimit = await prisma.rateLimit.update({
        where: { key },
        data: {
          count: 0,
          resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW),
        },
      })
    }

    // Check if limit exceeded
    if (rateLimit.count >= RATE_LIMIT_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
      }
    }

    // Increment counter
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: {
          increment: 1,
        },
      },
    })

    return {
      allowed: true,
      remaining: RATE_LIMIT_REQUESTS - rateLimit.count - 1,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow the request
    return {
      allowed: true,
      remaining: RATE_LIMIT_REQUESTS,
    }
  }
}
