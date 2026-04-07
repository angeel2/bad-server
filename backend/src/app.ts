import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { csrfProtection } from './middlewares/csrf'
import { noSqlSanitizer } from './middlewares/noSqlSanitizer'
import { generalLimiter, authLimiter, orderLimiter, uploadLimiter } from './middlewares/rateLimiter'
import { preventPathTraversal } from './middlewares/pathTraversal'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Referer', 'Origin']
}))
app.use(csrfProtection)
app.use(noSqlSanitizer)
app.use(preventPathTraversal)

// Rate limiting - защита от DDoS
app.use(generalLimiter)
app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
app.use('/order', orderLimiter)
app.use('/upload', uploadLimiter)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
