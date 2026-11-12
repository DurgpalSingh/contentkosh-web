// Generic sort utility for lists/tables
export type SortDir = 'asc' | 'desc'

export function sortRows<T>(rows: T[], accessor: (row: T) => any, dir: SortDir = 'desc'): T[] {
  const copy = [...rows]
  copy.sort((a, b) => {
    const va = accessor(a)
    const vb = accessor(b)

    if (va == null && vb == null) return 0
    if (va == null) return dir === 'asc' ? -1 : 1
    if (vb == null) return dir === 'asc' ? 1 : -1

    if (typeof va === 'string' && typeof vb === 'string') {
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    }

    if (va instanceof Date || vb instanceof Date) {
      const na = va instanceof Date ? va.getTime() : Date.parse(String(va))
      const nb = vb instanceof Date ? vb.getTime() : Date.parse(String(vb))
      if (na === nb) return 0
      return dir === 'asc' ? (na < nb ? -1 : 1) : (na > nb ? -1 : 1)
    }

    // Numeric comparison fallback
    const na = Number(va)
    const nb = Number(vb)
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      if (na === nb) return 0
      return dir === 'asc' ? (na < nb ? -1 : 1) : (na > nb ? -1 : 1)
    }

    // Fallback to string compare
    const sa = String(va)
    const sb = String(vb)
    return dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
  })
  return copy
}

export function toggleDir(dir?: SortDir): SortDir {
  if (!dir) return 'desc'
  return dir === 'asc' ? 'desc' : 'asc'
}

export default { sortRows, toggleDir }
