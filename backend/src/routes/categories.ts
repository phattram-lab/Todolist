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
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  icon: z.string().default('folder')
})

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.userId },
      include: { _count: { select: { todos: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ categories })
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body)
    const category = await prisma.category.create({ data: { ...data, userId: req.user!.userId }, include: { _count: { select: { todos: true } } } })
    res.status(201).json({ category })
  } catch (err) { next(err) }
})

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.userId) throw new AppError('Category not found', 404, 'NOT_FOUND')
    const data = createSchema.partial().parse(req.body)
    const category = await prisma.category.update({ where: { id: req.params.id }, data, include: { _count: { select: { todos: true } } } })
    res.json({ category })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.userId) throw new AppError('Category not found', 404, 'NOT_FOUND')
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
