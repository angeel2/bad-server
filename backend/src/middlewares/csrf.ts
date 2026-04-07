import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    // Пропускаем GET, HEAD, OPTIONS запросы
    if (
        req.method === 'GET' ||
        req.method === 'HEAD' ||
        req.method === 'OPTIONS'
    ) {
        return next()
    }

    // Получаем origin или referer
    const { origin } = req.headers
    const { referer } = req.headers

    const requestOrigin = origin || referer

    // Разрешенные домены
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://localhost:80',
    ]

    const isAllowed = allowedOrigins.some((allowed) => {
        if (requestOrigin) {
            return requestOrigin.startsWith(allowed)
        }
        return false
    })

    if (!isAllowed) {
        return next(new ForbiddenError('CSRF protection: invalid origin'))
    }

    next()
}
