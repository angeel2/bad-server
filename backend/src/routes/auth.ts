import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { generateCSRFToken, csrfProtection } from '../middlewares/csrf'

const authRouter = Router()

// Маршрут для получения CSRF токена
authRouter.get('/csrf-token', generateCSRFToken, (_req, res) => {
    const token = res.getHeader('X-CSRF-Token')
    res.json({ csrfToken: token })
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', csrfProtection, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', csrfProtection, register)

export default authRouter
