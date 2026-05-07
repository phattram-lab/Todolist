export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface JwtPayload {
  userId: string
  email: string
}

import type { Request } from 'express'
export interface AuthRequest extends Request {
  user?: { userId: string; email: string }
}
