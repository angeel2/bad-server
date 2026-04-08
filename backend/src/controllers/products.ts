import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { Error as MongooseError } from 'mongoose'
import { join } from 'path'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import NotFoundError from '../errors/not-found-error'
import Product from '../models/product'
import movingFile from '../utils/movingFile'
import { escapeHtml } from '../utils/escapeHtml'
import { safeRegex } from '../utils/safeRegex'

interface CacheData {
    data: any
    timestamp: number
}

let productsCache: CacheData | null = null
const CACHE_TTL = 60 * 1000 // 1 минута

// GET /product
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 5, search } = req.query

        // Проверяем кэш (только если нет поиска)
        if (!search && productsCache && Date.now() - productsCache.timestamp < CACHE_TTL) {
            return res.send(productsCache.data)
        }

        // Защита от NoSQL-инъекции
        let filter: any = {}

        if (search) {
            // Принудительно преобразуем в строку и экранируем
            const searchStr = String(search)
            const safeSearch = escapeHtml(searchStr)
            filter = { title: safeRegex(safeSearch) }
        }

        const options = {
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit),
        }

        const products = await Product.find(filter, null, options)
        const totalProducts = await Product.countDocuments(filter)
        const totalPages = Math.ceil(totalProducts / Number(limit))

        const responseData = {
            items: products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: Number(page),
                pageSize: Number(limit),
            },
        }

        // Сохраняем в кэш (только если нет поиска)
        if (!search) {
            productsCache = {
                data: responseData,
                timestamp: Date.now(),
            }
        }

        return res.send(responseData)
    } catch (err) {
        return next(err)
    }
}

// POST /product
const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let { description, category, title } = req.body
        const { price, image } = req.body

        // Защита от NoSQL-инъекции и XSS
        description = description ? String(description) : ''
        category = category ? String(category) : ''
        title = title ? String(title) : ''

        description = escapeHtml(description)
        category = escapeHtml(category)
        title = escapeHtml(title)

        // При создании товара сбрасываем кэш
        productsCache = null

        // Переносим картинку из временной папки
        if (image) {
            movingFile(
                image.fileName,
                join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`),
                join(__dirname, `../public/${process.env.UPLOAD_PATH}`)
            )
        }

        const product = await Product.create({
            description,
            image,
            category,
            price,
            title,
        })
        return res.status(constants.HTTP_STATUS_CREATED).send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params
        const { image } = req.body

        // При обновлении товара сбрасываем кэш
        productsCache = null

        // Защита от NoSQL-инъекции: проверяем productId
        if (!productId || productId.includes('$')) {
            return next(new BadRequestError('Невалидный ID товара'))
        }

        // Защита от NoSQL-инъекции: очищаем поля
        const sanitizedBody: any = {}
        if (req.body.title)
            sanitizedBody.title = escapeHtml(String(req.body.title))
        if (req.body.description)
            sanitizedBody.description = escapeHtml(String(req.body.description))
        if (req.body.category)
            sanitizedBody.category = escapeHtml(String(req.body.category))
        if (req.body.price !== undefined) sanitizedBody.price = req.body.price

        // Переносим картинку из временной папки
        if (image) {
            movingFile(
                image.fileName,
                join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`),
                join(__dirname, `../public/${process.env.UPLOAD_PATH}`)
            )
            sanitizedBody.image = image
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    ...sanitizedBody,
                    price: req.body.price ? req.body.price : null,
                },
            },
            { runValidators: true, new: true }
        ).orFail(() => new NotFoundError('Нет товара по заданному id'))
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params

        // При удалении товара сбрасываем кэш
        productsCache = null

        // Защита от NoSQL-инъекции: проверяем productId
        if (!productId || productId.includes('$')) {
            return next(new BadRequestError('Невалидный ID товара'))
        }

        const product = await Product.findByIdAndDelete(productId).orFail(
            () => new NotFoundError('Нет товара по заданному id')
        )
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        return next(error)
    }
}

export { createProduct, deleteProduct, getProducts, updateProduct }
