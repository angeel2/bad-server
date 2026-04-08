import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const requestedPath = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '')
        const filePath = path.join(baseDir, requestedPath)

        if (!filePath.startsWith(baseDir)) {
            return next()
        }

        fs.access(filePath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                return next()
            }
            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
