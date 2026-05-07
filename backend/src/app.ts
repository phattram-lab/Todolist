import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import router from './routes'
import { errorHandler } from './middleware/error'

const app = express()

app.use(helmet())
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) cb(null, true)
    else cb(new Error('CORS'))
  },
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.use('/api/v1', router)

app.use((_req, res) => res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' }))
app.use(errorHandler)

export default app
