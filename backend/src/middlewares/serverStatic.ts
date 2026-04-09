/* eslint-disable prefer-destructuring */
import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        let cleanPath = req.path
        
        if (cleanPath.includes('?')) {
            cleanPath = cleanPath.split('?')[0]
        }
        
        const normalizedPath = path.normalize(cleanPath).replace(/^(\.\.(\/|\\|$))+/, '')
        const absoluteBaseDir = path.resolve(baseDir)
        const filePath = path.resolve(absoluteBaseDir, normalizedPath)
        
        if (!filePath.startsWith(absoluteBaseDir)) {
            return res.status(403).json({ error: 'Access denied' })
        }
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            
            fs.stat(filePath, (statErr, stats) => {
                if (statErr || stats.isDirectory()) {
                    return next()
                }
                
                return res.sendFile(filePath, (sendErr) => {
                    if (sendErr) {
                        next(sendErr)
                    }
                })
            })
        })
    }
}