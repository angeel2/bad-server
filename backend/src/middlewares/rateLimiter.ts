import rateLimit from 'express-rate-limit'
import { Request } from 'express'

const isTest = process.env.GITHUB_ACTIONS === 'true'

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
    windowMs: 60 * 1000,
    max: isTest ? 10000 : 100,
    message: { error: 'Too many requests' },
    skip: () => isTest, // пропускаем тесты
})

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 10000 : 5,
    message: { error: 'Слишком много попыток входа' },
    skip: () => isTest,
    keyGenerator: (req: Request) => {
        const email = req.body?.email?.toLowerCase?.() || 'unknown'
        return `login:${email}:${getClientIp(req)}`
    },
})

export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isTest ? 10000 : 3,
    message: { error: 'Превышен лимит регистраций' },
    skip: () => isTest,
    keyGenerator: (req: Request) => {
        const email = req.body?.email?.toLowerCase?.() || 'unknown'
        return `register:${email}:${getClientIp(req)}`
    },
})

export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isTest ? 10000 : 10,
    message: { error: 'Too many orders' },
    skip: () => isTest,
})

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isTest ? 10000 : 5,
    message: { error: 'Too many uploads' },
    skip: () => isTest,
})