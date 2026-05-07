import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { authenticate } from '../middleware/auth'
import { AppError } from '../lib/errors'
import type { AuthRequest } from '../types'
import type { Response, NextFunction } from 'express'

const router = Router()

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

router.post('/register', async (req, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) {
      if (existing.email === email) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN')
      throw new AppError('Username already taken', 409, 'USERNAME_TAKEN')
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { username, email, password: hashed } })
    const token = signToken({ userId: user.id, email: user.email })
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }, token })
  } catch (err) { next(err) }
})

router.post('/login', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }
    const token = signToken({ userId: user.id, email: user.email })
    res.json({ user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }, token })
  } catch (err) { next(err) }
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { _count: { select: { todos: true } } }
    })
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
    res.json({ user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt, _count: user._count } })
  } catch (err) { next(err) }
})

router.post('/logout', (_req, res: Response) => {
  res.json({ message: 'Logged out' })
})

export default router
