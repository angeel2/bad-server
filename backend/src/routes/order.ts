import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'
import { Role } from '../models/user'
import { csrfProtection } from '../middlewares/csrf'

const orderRouter = Router()

orderRouter.post('/', auth, csrfProtection, validateOrderBody, createOrder)
orderRouter.get('/all', auth, getOrders)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get(
    '/:orderNumber',
    auth,
    roleGuardMiddleware(Role.Admin),
    getOrderByNumber
)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.patch(
    '/:orderNumber',
    auth,
    csrfProtection,
    roleGuardMiddleware(Role.Admin),
    updateOrder
)

orderRouter.delete('/:id', auth, csrfProtection, roleGuardMiddleware(Role.Admin), deleteOrder)

export default orderRouter
