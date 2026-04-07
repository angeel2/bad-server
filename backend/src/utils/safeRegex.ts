export const safeRegex = (input: string): RegExp => {
    // Ограничиваем длину строки (максимум 100 символов)
    const safeInput = input.slice(0, 100)
    // Экранируем спецсимволы
    const escaped = safeInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escaped, 'i')
}