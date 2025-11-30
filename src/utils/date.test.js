import { describe, it, expect } from 'vitest'
import { fmt, formatBR } from './date.js'

describe('date utils', () => {
  it('fmt formata yyyy-mm-dd para dd/mm/yyyy', () => {
    const result = fmt('2025-12-03')
    expect(result).toBe('03/12/2025')
  })

  it('fmt mantém dd/mm/yyyy já formatado', () => {
    const result = fmt('03/07/2025')
    expect(result).toBe('03/07/2025')
  })

  it('fmt adiciona zero à esquerda quando necessário', () => {
    const result = fmt('2025-1-9')
    expect(result).toBe('09/01/2025')
  })

  it('fmt retorna string vazia se valor for falsy', () => {
    expect(fmt('')).toBe('')
    expect(fmt(null)).toBe('')
    expect(fmt(undefined)).toBe('')
  })

  it('formatBR é alias de fmt', () => {
    const a = formatBR('2025-01-10')
    const b = fmt('2025-01-10')
    expect(a).toBe(b)
  })
})
