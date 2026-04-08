import { NextFunction, Request, Response } from 'express'
import Tokens from 'csrf'

const tokens = new Tokens()

export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
    // Берём секрет из любой из двух кук
    let secret = req.cookies['csrf-secret'] || req.cookies['_csrf']
    if (!secret) {
        secret = tokens.secretSync()
        // Устанавливаем обе куки – для приложения и для тестов
        res.cookie('csrf-secret', secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        res.cookie('_csrf', secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
    }
    const token = tokens.create(secret)
    res.setHeader('X-CSRF-Token', token)
    res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token')
    next()
}

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Пропускаем GET, HEAD, OPTIONS
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next()
    }

    // Проверяем любую из двух кук
    const secret = req.cookies['csrf-secret'] || req.cookies['_csrf']
    const token = req.headers['x-csrf-token'] as string

    if (!secret || !token) {
        return res.status(403).json({ error: 'CSRF token missing' })
    }

    if (!tokens.verify(secret, token)) {
        return res.status(403).json({ error: 'Invalid CSRF token' })
    }

    next()
}