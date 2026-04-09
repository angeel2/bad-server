import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import path from 'path'
import crypto from 'crypto'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    
    // Проверка минимального размера (2KB)
    if (req.file.size < 2 * 1024) {
        return next(new BadRequestError('Файл слишком маленький (минимум 2KB)'))
    }
    
    try {
        // Генерируем уникальное имя файла
        const ext = path.extname(req.file.originalname)
        const uniqueName = crypto.randomBytes(16).toString('hex') + ext
        const oldPath = req.file.path
        const newPath = path.join(path.dirname(oldPath), uniqueName)
        
        // Переименовываем файл
        const fs = await import('fs')
        fs.renameSync(oldPath, newPath)
        
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${uniqueName}`
            : `/${uniqueName}`
            
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}