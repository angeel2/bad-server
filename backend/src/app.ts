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
import { noSqlSanitizer } from './middlewares/noSqlSanitizer'
import {
    generalLimiter,
    loginLimiter,
    registrationLimiter,
    orderLimiter,
    uploadLimiter,
} from './middlewares/rateLimiter'
import { preventPathTraversal } from './middlewares/pathTraversal'
import { generateCSRFToken, csrfProtection } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())
app.use(generateCSRFToken)

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Referer',
            'Origin',
            'X-CSRF-Token',
        ],
    })
)

app.use(noSqlSanitizer)
app.use(preventPathTraversal)

app.use(generalLimiter)
app.use('/auth/login', loginLimiter)
app.use('/auth/register', registrationLimiter)
app.use('/order', orderLimiter)
app.use('/upload', uploadLimiter)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.use(csrfProtection)

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
