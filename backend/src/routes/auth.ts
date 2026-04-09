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
import { generateCSRFToken } from '../middlewares/csrf'

const authRouter = Router()

// Эндпоинт для получения CSRF токена
authRouter.get('/csrf-token', generateCSRFToken, (_req, res) => {
    const token = res.getHeader('X-CSRF-Token')
    res.json({ csrfToken: token })
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', register)

export default authRouter