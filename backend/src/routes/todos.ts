import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { AppError } from '../lib/errors'
import type { AuthRequest } from '../types'
import type { Response, NextFunction } from 'express'

const router = Router()
router.use(authenticate)

const todoIncludes = {
  category: { select: { id: true, name: true, color: true, icon: true } },
  tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
  _count: { select: { subtasks: true } }
}

function formatTodo(todo: any) {
  const subtaskStats = todo.subtasks
    ? { total: todo.subtasks.length, completed: todo.subtasks.filter((s: any) => s.status === 'DONE').length }
    : undefined
  return {
    ...todo,
    tags: todo.tags.map((t: any) => t.tag),
    subtaskStats
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED']).optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  parentId: z.string().optional().nullable()
})

const updateSchema = createSchema.partial()

const bulkSchema = z.object({
  ids: z.array(z.string()),
  action: z.enum(['complete', 'delete', 'archive'])
})

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number() }))
})

// GET /todos
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const { status, priority, categoryId, tagId, search, sort = 'order', order = 'asc', page = '1', limit = '20', parentId } = req.query as Record<string, string>

    const where: any = { userId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (categoryId) where.categoryId = categoryId
    if (tagId) where.tags = { some: { tagId } }
    if (search) where.title = { contains: search }
    if (parentId === 'null') where.parentId = null
    else if (parentId) where.parentId = parentId

    const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 }
    let orderBy: any = { [sort]: order }
    if (sort === 'priority') orderBy = [{ priority: 'asc' }, { createdAt: 'asc' }]

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        include: { ...todoIncludes, subtasks: { select: { id: true, status: true } } },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.todo.count({ where })
    ])

    // Sort by priority manually if needed
    let sorted = todos
    if (sort === 'priority') {
      sorted = todos.sort((a, b) => {
        const diff = (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 0)
        return order === 'desc' ? diff : -diff
      })
    }

    res.json({
      todos: sorted.map(formatTodo),
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    })
  } catch (err) { next(err) }
})

// POST /todos
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const data = createSchema.parse(req.body)
    const maxOrder = await prisma.todo.aggregate({ where: { userId }, _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const completedAt = data.status === 'DONE' ? new Date() : null

    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
        status: data.status ?? 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        categoryId: data.categoryId ?? null,
        parentId: data.parentId ?? null,
        order: nextOrder,
        userId,
        completedAt,
        tags: data.tagIds ? { create: data.tagIds.map(tagId => ({ tagId })) } : undefined
      },
      include: { ...todoIncludes, subtasks: { select: { id: true, status: true } } }
    })
    res.status(201).json({ todo: formatTodo(todo) })
  } catch (err) { next(err) }
})

// GET /todos/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: req.params.id },
      include: {
        ...todoIncludes,
        subtasks: {
          include: { ...todoIncludes, subtasks: { select: { id: true, status: true } } },
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!todo || todo.userId !== req.user!.userId) throw new AppError('Todo not found', 404, 'NOT_FOUND')
    res.json({ todo: formatTodo(todo) })
  } catch (err) { next(err) }
})

// PATCH /todos/reorder (must be before /:id)
router.patch('/reorder', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items } = reorderSchema.parse(req.body)
    await prisma.$transaction(
      items.map(item => prisma.todo.updateMany({ where: { id: item.id, userId: req.user!.userId }, data: { order: item.order } }))
    )
    res.json({ message: 'Reordered' })
  } catch (err) { next(err) }
})

// POST /todos/bulk (must be before /:id)
router.post('/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids, action } = bulkSchema.parse(req.body)
    const userId = req.user!.userId
    let affected = 0
    if (action === 'delete') {
      const result = await prisma.todo.deleteMany({ where: { id: { in: ids }, userId } })
      affected = result.count
    } else {
      const status = action === 'complete' ? 'DONE' : 'ARCHIVED'
      const data: any = { status }
      if (action === 'complete') data.completedAt = new Date()
      const result = await prisma.todo.updateMany({ where: { id: { in: ids }, userId }, data })
      affected = result.count
    }
    res.json({ affected })
  } catch (err) { next(err) }
})

// PATCH /todos/:id
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const existing = await prisma.todo.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== userId) throw new AppError('Todo not found', 404, 'NOT_FOUND')

    const data = updateSchema.parse(req.body)
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ?? null
    if (data.parentId !== undefined) updateData.parentId = data.parentId ?? null
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === 'DONE' && existing.status !== 'DONE') updateData.completedAt = new Date()
      else if (data.status !== 'DONE' && existing.status === 'DONE') updateData.completedAt = null
    }

    if (data.tagIds !== undefined) {
      await prisma.todoTag.deleteMany({ where: { todoId: req.params.id } })
      if (data.tagIds.length > 0) {
        await prisma.todoTag.createMany({ data: data.tagIds.map(tagId => ({ todoId: req.params.id, tagId })) })
      }
    }

    const todo = await prisma.todo.update({
      where: { id: req.params.id },
      data: updateData,
      include: { ...todoIncludes, subtasks: { select: { id: true, status: true } } }
    })
    res.json({ todo: formatTodo(todo) })
  } catch (err) { next(err) }
})

// DELETE /todos/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.todo.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.userId) throw new AppError('Todo not found', 404, 'NOT_FOUND')
    await prisma.todo.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
