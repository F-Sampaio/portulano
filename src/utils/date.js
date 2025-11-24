export function fmt(dateStr) {
  if (!dateStr) return ''
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function formatBR(dateStr) {
  return fmt(dateStr)
}
