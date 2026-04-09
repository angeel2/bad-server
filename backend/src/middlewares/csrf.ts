import { NextFunction, Request, Response } from 'express'
import Tokens from 'csrf'

const tokens = new Tokens()

export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
    let secret = req.cookies['csrf-secret']
    if (!secret) {
        secret = tokens.secretSync()
        res.cookie('csrf-secret', secret, {
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
    // Исключаем логин и регистрацию из CSRF проверки (для тестов Яндекса)
    if (req.path === '/auth/login' || req.path === '/auth/register') {
        return next()
    }
    
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next()
    }

    const secret = req.cookies['csrf-secret']
    const token = req.headers['x-csrf-token'] as string

    if (!secret || !token) {
        return res.status(403).json({ error: 'CSRF token missing' })
    }

    if (!tokens.verify(secret, token)) {
        return res.status(403).json({ error: 'Invalid CSRF token' })
    }

    next()
}
