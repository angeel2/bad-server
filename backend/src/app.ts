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
import { generateCSRFToken, csrfProtection } from './middlewares/csrf'
import { noSqlSanitizer } from './middlewares/noSqlSanitizer'
import {
    generalLimiter,
    authLimiter,
    orderLimiter,
    uploadLimiter,
} from './middlewares/rateLimiter'

const PORT = 3000
const app = express()

app.use(cookieParser())
app.use(generateCSRFToken)
app.use(cors())
app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))
app.use(noSqlSanitizer)
// app.use(csrfProtection)

app.use(generalLimiter)
app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
app.use('/order', orderLimiter)
app.use('/upload', uploadLimiter)

app.options('*', cors())

app.use('/images', express.static(path.join(__dirname, 'public/images')))
app.use(routes)
app.use(serveStatic(path.join(__dirname, 'public')))
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error(error)
    }
}

bootstrap()