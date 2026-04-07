import { NextFunction, Request, Response } from 'express'
import Tokens from 'csrf'

const tokens = new Tokens()

export const generateCSRFToken = (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const secret = tokens.secretSync()
        const token = tokens.create(secret)

        res.cookie('csrf-secret', secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
        })

        res.setHeader('X-CSRF-Token', token)
        res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token')

        next()
    } catch (error) {
        next(error)
    }
}

export const validateCSRFToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.method === 'GET') {
        return next()
    }

    if (req.path === '/csrf-token' || req.path.includes('/csrf-token')) {
        return next()
    }

    try {
        const secret = req.cookies['csrf-secret']
        const token = (req.headers['x-csrf-token'] as string) || req.body.csrf

        if (!secret || !token) {
            return res.status(403).json({ error: 'CSRF token missing' })
        }

        if (!tokens.verify(secret, token)) {
            return res.status(403).json({ error: 'Invalid CSRF token' })
        }

        next()
    } catch (error) {
        next(error)
    }
}

export const csrfProtection = validateCSRFToken
