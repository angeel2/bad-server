import rateLimit from 'express-rate-limit'

// Общий лимит для всех запросов
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, 
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})

// Лимит для логина (строже)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5,
    message: 'Слишком много попыток входа, попробуйте через 15 минут',
    standardHeaders: true,
    legacyHeaders: false,
})

// Лимит для создания заказов
export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 20,
    message: 'Слишком много заказов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})

// Лимит для загрузки файлов
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10,
    message: 'Слишком много загрузок, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})