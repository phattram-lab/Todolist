import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import router from './routes'
import { errorHandler } from './middleware/error'

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.use('/api/v1', router)

app.use((_req, res) => res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' }))
app.use(errorHandler)

export default app
