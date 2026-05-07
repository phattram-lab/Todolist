import { Router } from 'express'
import authRouter from './auth'
import todosRouter from './todos'
import categoriesRouter from './categories'
import tagsRouter from './tags'
import statsRouter from './stats'

const router = Router()

router.use('/auth', authRouter)
router.use('/todos', todosRouter)
router.use('/categories', categoriesRouter)
router.use('/tags', tagsRouter)
router.use('/stats', statsRouter)

export default router
