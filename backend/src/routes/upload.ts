import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware, { checkFileSize } from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', fileMiddleware.single('file'), checkFileSize, uploadFile)

export default uploadRouter