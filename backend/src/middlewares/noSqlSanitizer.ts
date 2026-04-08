import { NextFunction, Request, Response } from 'express'

const forbiddenOperators = [
    '$where',
    '$ne',
    '$eq',
    '$gt',
    '$gte',
    '$lt',
    '$lte',
    '$in',
    '$nin',
    '$exists',
    '$type',
    '$regex',
    '$or',
    '$and',
    '$nor',
    '$not',
    '$size',
    '$all',
    '$elemMatch',
]

function sanitizeObject(obj: any): any {
    if (!obj) return obj

    if (typeof obj === 'string') {
        const hasOperator = forbiddenOperators.some((op) => obj.includes(op))
        if (hasOperator) {
            return obj.replace(/[${}]/g, '')
        }
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item))
    }

    if (typeof obj === 'object') {
        const sanitized: any = {}
        Object.keys(obj).forEach((key) => {
            if (!key.startsWith('$')) {
                sanitized[key] = sanitizeObject(obj[key])
            }
        })
        return sanitized
    }

    return obj
}

export const noSqlSanitizer = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.body) {
        req.body = sanitizeObject(req.body)
    }
    if (req.query) {
        req.query = sanitizeObject(req.query)
    }
    if (req.params) {
        req.params = sanitizeObject(req.params)
    }
    next()
}
