import { Request, Express, NextFunction, Response } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'
import BadRequestError from '../errors/bad-request-error'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const destinationPath = join(
            __dirname,
            process.env.UPLOAD_PATH_TEMP
                ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                : '../public'
        )

        mkdirSync(destinationPath, { recursive: true })

        cb(null, destinationPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const ext = file.originalname.split('.').pop()
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}.${ext}`
        cb(null, uniqueName)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }
    return cb(null, true)
}

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
}

export const checkFileSize = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.file && req.file.size < 2 * 1024) {
        // меньше 2KB
        return next(new BadRequestError('Файл слишком маленький (минимум 2KB)'))
    }
    next()
}

const upload = multer({ storage, fileFilter, limits })

export default upload
