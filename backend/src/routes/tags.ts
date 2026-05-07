import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { AppError } from '../lib/errors'
import type { AuthRequest } from '../types'
import type { Response, NextFunction } from 'express'

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#8b5cf6')
})

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.user!.userId },
      include: { _count: { select: { todos: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ tags })
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body)
    const tag = await prisma.tag.create({ data: { ...data, userId: req.user!.userId }, include: { _count: { select: { todos: true } } } })
    res.status(201).json({ tag })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.tag.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.userId) throw new AppError('Tag not found', 404, 'NOT_FOUND')
    await prisma.tag.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
