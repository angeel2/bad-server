import { NextFunction, Request, Response } from 'express'
import path from 'path'
import ForbiddenError from '../errors/forbidden-error'

export const preventPathTraversal = (req: Request, _res: Response, next: NextFunction) => {
    const params = { ...req.params, ...req.query, ...req.body }

    const values = Object.values(params)
    
    let hasError = false
    
    values.forEach((value) => {
        if (hasError) return
        
        if (typeof value === 'string') {
            if (value.includes('..') || value.includes('./') || value.includes('.\\')) {
                hasError = true
                return next(new ForbiddenError('Path traversal detected'))
            }
            if (path.isAbsolute(value)) {
                hasError = true
                return next(new ForbiddenError('Absolute path not allowed'))
            }
        }
    })
    
    if (!hasError) {
        return next()
    }
    
    return undefined
}
