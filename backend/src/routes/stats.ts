import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import type { AuthRequest } from '../types'
import type { Response, NextFunction } from 'express'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const now = new Date()

    const [total, completed, inProgress, todo, overdue, byStatus, byPriority, categories, recentTodos, upcomingDue] = await Promise.all([
      prisma.todo.count({ where: { userId, status: { not: 'ARCHIVED' } } }),
      prisma.todo.count({ where: { userId, status: 'DONE' } }),
      prisma.todo.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.todo.count({ where: { userId, status: 'TODO' } }),
      prisma.todo.count({ where: { userId, dueDate: { lt: now }, status: { notIn: ['DONE', 'ARCHIVED'] } } }),
      prisma.todo.groupBy({ by: ['status'], where: { userId }, _count: true }),
      prisma.todo.groupBy({ by: ['priority'], where: { userId, status: { not: 'ARCHIVED' } }, _count: true }),
      prisma.category.findMany({
        where: { userId },
        include: { _count: { select: { todos: true } } },
        orderBy: { todos: { _count: 'desc' } },
        take: 10
      }),
      prisma.todo.findMany({
        where: { userId, completedAt: { not: null } },
        select: { completedAt: true, createdAt: true },
        orderBy: { completedAt: 'desc' }
      }),
      prisma.todo.findMany({
        where: { userId, dueDate: { gt: now }, status: { notIn: ['DONE', 'ARCHIVED'] } },
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          tags: { include: { tag: { select: { id: true, name: true, color: true } } } }
        },
        orderBy: { dueDate: 'asc' },
        take: 5
      })
    ])

    // Build byStatus map
    const byStatusMap: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0, ARCHIVED: 0 }
    byStatus.forEach(s => { byStatusMap[s.status] = s._count })

    // Build byPriority map
    const byPriorityMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }
    byPriority.forEach(p => { byPriorityMap[p.priority] = p._count })

    // Streak calculation
    const completionDates = new Set(
      recentTodos
        .filter(t => t.completedAt)
        .map(t => t.completedAt!.toISOString().split('T')[0])
    )
    let streak = 0
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    while (completionDates.has(d.toISOString().split('T')[0])) {
      streak++
      d.setDate(d.getDate() - 1)
    }

    // Recent activity (last 7 days)
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const completedCount = recentTodos.filter(t => t.completedAt?.toISOString().split('T')[0] === dateStr).length
      const createdCount = recentTodos.filter(t => t.createdAt.toISOString().split('T')[0] === dateStr).length
      recentActivity.push({ date: dateStr, completed: completedCount, created: createdCount })
    }

    res.json({
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak,
      byPriority: byPriorityMap,
      byStatus: byStatusMap,
      byCategory: categories.map(c => ({ id: c.id, name: c.name, color: c.color, count: c._count.todos })),
      recentActivity,
      upcomingDue: upcomingDue.map(t => ({ ...t, tags: (t.tags as any[]).map((tt: any) => tt.tag) }))
    })
  } catch (err) { next(err) }
})

export default router
