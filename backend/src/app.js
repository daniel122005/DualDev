import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
// El código Java viaja en el cuerpo: 20 KB de código + JSON caben holgadamente en 64 KB.
app.use(express.json({ limit: '64kb' }))

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
