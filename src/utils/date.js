export function fmt(dateStr) {
  if (!dateStr) return ''
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }
  const [y, m, d] = dateStr.split('-')
  const dd = d.padStart(2, '0')
  const mm = m.padStart(2, '0')
  return `${dd}/${mm}/${y}`
}


export function formatBR(dateStr) {
  return fmt(dateStr)
}
