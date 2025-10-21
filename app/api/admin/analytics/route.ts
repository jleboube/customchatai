import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics - Get usage analytics (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for date filtering
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total users who have made requests
    const activeUsers = await prisma.usageMetric.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Total requests
    const totalRequests = await prisma.usageMetric.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Average response time
    const avgResponseTime = await prisma.usageMetric.aggregate({
      _avg: {
        responseTimeMs: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Requests per user with token usage
    const userStats = await prisma.usageMetric.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
        promptTokens: true,
        completionTokens: true,
      },
      _avg: {
        responseTimeMs: true,
      },
    })

    // Get user details for the stats
    const userIds = userStats.map((stat) => stat.userId)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Combine user stats with user details
    const userStatsWithDetails = userStats.map((stat) => {
      const user = users.find((u) => u.id === stat.userId)
      return {
        userId: stat.userId,
        userName: user?.name || 'N/A',
        userEmail: user?.email || '',
        requestCount: stat._count.id,
        totalTokens: stat._sum.totalTokens || 0,
        promptTokens: stat._sum.promptTokens || 0,
        completionTokens: stat._sum.completionTokens || 0,
        avgResponseTime: Math.round(stat._avg.responseTimeMs || 0),
      }
    })

    // Model usage stats
    const modelStats = await prisma.usageMetric.groupBy({
      by: ['model'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
      },
      _avg: {
        responseTimeMs: true,
      },
    })

    const modelStatsFormatted = modelStats.map((stat) => ({
      model: stat.model,
      requestCount: stat._count.id,
      totalTokens: stat._sum.totalTokens || 0,
      avgResponseTime: Math.round(stat._avg.responseTimeMs || 0),
    }))

    // Daily request trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)
      return date
    })

    const dailyTrends = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const count = await prisma.usageMetric.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })

        return {
          date: date.toISOString().split('T')[0],
          requests: count,
        }
      })
    )

    return NextResponse.json({
      summary: {
        activeUsers: activeUsers.length,
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        periodDays: days,
      },
      userStats: userStatsWithDetails.sort((a, b) => b.requestCount - a.requestCount),
      modelStats: modelStatsFormatted.sort((a, b) => b.requestCount - a.requestCount),
      dailyTrends,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
