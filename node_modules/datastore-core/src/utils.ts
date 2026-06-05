export const replaceStartWith = (s: string, r: string): string => {
  const matcher = new RegExp('^' + r)
  return s.replace(matcher, '')
}
