import rateLimit from 'express-rate-limit'

const getIp = (req: any): string =>
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Слишком много запросов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getIp(req),
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Слишком много попыток входа, попробуйте через 15 минут',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getIp(req),
})

export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: 'Слишком много заказов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
})

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Слишком много загрузок, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
})
