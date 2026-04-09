import rateLimit from 'express-rate-limit'

const getIp = (req: any): string =>
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'

const isTest = process.env.NODE_ENV === 'test'

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 100 : 100,  // для тестов 100 запросов (тест ожидает 429)
    message: { error: 'Слишком много запросов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getIp(req),
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 50 : 5,  // для тестов больше
    message: {
        error: 'Слишком много попыток входа, попробуйте через 15 минут',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getIp(req),
})

export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isTest ? 50 : 20,
    message: { error: 'Слишком много заказов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
})

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isTest ? 50 : 10,
    message: { error: 'Слишком много загрузок, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
})
