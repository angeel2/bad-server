import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { Types } from 'mongoose'

export const phoneRegExp = /^((8|\+7)[- ]?)?(\(?\d{3}\)?[- ]?)?[\d- ]{7,10}$/

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

const validate =
    (schema: Joi.ObjectSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false })
        if (error) {
            const messages = error.details.map((d) => d.message).join(', ')
            return res.status(400).json({ error: messages })
        }
        next()
    }
export const validateObjId = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { productId } = req.params
    if (productId && !Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Невалидный id' })
    }
    next()
}

export const validateOrderBody = validate(
    Joi.object({
        items: Joi.array()
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value)) return value
                    return helpers.error('any.invalid')
                })
            )
            .required()
            .messages({ 'array.empty': 'Не указаны товары' }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(phoneRegExp).required(),
        address: Joi.string().required(),
        total: Joi.number().required(),
        comment: Joi.string().optional().allow(''),
    })
)

export const validateProductBody = validate(
    Joi.object({
        title: Joi.string().min(2).max(30).required(),
        image: Joi.object({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().allow(null),
    })
)

export const validateProductUpdateBody = validate(
    Joi.object({
        title: Joi.string().min(2).max(30),
        image: Joi.object({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string(),
        description: Joi.string(),
        price: Joi.number().allow(null),
    })
)

export const validateUserBody = validate(
    Joi.object({
        name: Joi.string().min(2).max(30),
        password: Joi.string().min(6).required(),
        email: Joi.string().email().required(),
    })
)

export const validateAuthentication = validate(
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
)
