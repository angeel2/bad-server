import { NextFunction, Request, Response } from 'express'
import Product from '../models/product'

export const getProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await Product.find({})
        return res.json({ items: products, total: products.length })
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
