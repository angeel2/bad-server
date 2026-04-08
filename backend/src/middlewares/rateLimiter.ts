import rateLimit from 'express-rate-limit'
import { Request } from 'express'

// Для тестов в GitHub Actions
const isTest = process.env.GITHUB_ACTIONS === 'true'

// Хелпер для получения IP (для прокси/nginx)
const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'] as string
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIp = req.headers['x-real-ip'] as string
    if (realIp) {
        return realIp.trim()
    }
    return req.ip || req.socket.remoteAddress || 'unknown'
}

export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: isTest ? 1000 : 10, // для тестов 1000, для локальной разработки 10
    message: { error: 'Too many requests' },
})

// Лимит для логина (по email + IP)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 1000 : 5, // для тестов 1000, для локальной разработки 5
    message: {
        error: 'Слишком много попыток входа, попробуйте через 15 минут',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const email = req.body?.email?.toLowerCase?.() || 'unknown'
        return `login:${email}:${getClientIp(req)}`
    },
})

// Лимит для регистрации (по email + IP)
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 3,
    message: { error: 'Превышен лимит регистраций, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const email = req.body?.email?.toLowerCase?.() || 'unknown'
        return `register:${email}:${getClientIp(req)}`
    },
})

// Лимит для создания заказов
export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Too many orders' },
})

// Лимит для загрузки файлов
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many uploads' },
})