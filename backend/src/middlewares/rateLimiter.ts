import rateLimit from 'express-rate-limit'

// Общий rate limiter для всех запросов
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 1000, // для тестов 1000
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Строгий rate limiter для авторизации (логин)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Rate limiter для регистрации
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Too many registration attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Rate limiter для загрузки файлов
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Too many file uploads, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Rate limiter для заказов
export const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 5,
    message: { error: 'Too many orders, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})