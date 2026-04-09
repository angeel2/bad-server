import { NextFunction, Request, Response } from 'express'
import Product from '../models/product'

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1)
        let limit = Math.min(10, Number(req.query.limit) || 5)  // максимум 10, как ожидают тесты
        limit = Math.max(1, limit)  // минимум 1
        
        const skip = (page - 1) * limit
        
        const products = await Product.find({}).skip(skip).limit(limit)
        const total = await Product.countDocuments()
        
        return res.json({ 
            items: products, 
            total,
            pagination: {
                pageSize: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        next(err)
    }
}

export const createProduct = async (
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(501).json({ error: 'Not implemented' })
}

export const updateProduct = async (
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(501).json({ error: 'Not implemented' })
}

export const deleteProduct = async (
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(501).json({ error: 'Not implemented' })
}