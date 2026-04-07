import { existsSync, mkdirSync, rename } from 'fs'
import { basename, join, normalize } from 'path'

function movingFile(imagePath: string, from: string, to: string) {
    // Нормализуем и проверяем путь
    const safeImagePath = normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '')
    const fileName = basename(safeImagePath)
    
    // Проверяем, что fileName не содержит опасных символов
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        throw new Error('Invalid file name')
    }
    
    const imagePathTemp = join(from, fileName)
    const imagePathPermanent = join(to, fileName)

    // Проверяем, что пути находятся в разрешённых директориях
    if (!imagePathTemp.startsWith(from) || !imagePathPermanent.startsWith(to)) {
        throw new Error('Path traversal detected')
    }

    mkdirSync(to, { recursive: true })
    if (!existsSync(imagePathTemp)) {
        throw new Error('Ошибка при сохранении файла')
    }

    rename(imagePathTemp, imagePathPermanent, (err) => {
        if (err) {
            throw new Error('Ошибка при сохранении файла')
        }
    })
}

export default movingFile
