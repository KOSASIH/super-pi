export const nanoid = (size: number = 10): string => {
  return Math.random().toString().substring(2, size + 2)
}
