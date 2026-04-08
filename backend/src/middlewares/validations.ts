import Joi from 'joi'
import { Types } from 'mongoose'

export const phoneRegExp = /^[\d\s\-()+]{10,20}$/ 

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

export const validateOrderBody = (data: any) => Joi.object({
    items: Joi.array()
        .items(Joi.string().custom((value: string, helpers: any) => 
            Types.ObjectId.isValid(value) ? value : helpers.error('Невалидный id')
        ))
        .min(1)
        .messages({ 'array.min': 'Не указаны товары' }),
    payment: Joi.string().valid(...Object.values(PaymentType)).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(phoneRegExp).required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    comment: Joi.string().allow(''),
}).validate(data)

export const validateProductBody = (data: any) => Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
    }),
    category: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().allow(null),
}).validate(data)

export const validateProductUpdateBody = (data: any) => Joi.object({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
}).validate(data)

export const validateObjId = (params: any) => Joi.object({
    productId: Joi.string().custom((value: string, helpers: any) => 
        Types.ObjectId.isValid(value) ? value : helpers.error('Невалидный id')
    ),
}).validate(params)

export const validateUserBody = (data: any) => Joi.object({
    name: Joi.string().min(2).max(30),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
}).validate(data)

export const validateAuthentication = (data: any) => Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).validate(data)