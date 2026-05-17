export interface Category {
  key:   string
  label: string
}

const CAT_STORAGE    = 'kankrong_categories'
const ASSIGN_STORAGE = 'kankrong_cat_assign'  // { [code]: catKey }

export const DEFAULT_CATEGORIES: Category[] = [
  { key: 'copper',      label: 'ทองแดง/ทองเหลือง' },
  { key: 'aluminum',    label: 'มีเนียม' },
  { key: 'steel',       label: 'เหล็ก' },
  { key: 'plastic',     label: 'พลาสติก' },
  { key: 'paper',       label: 'กระดาษ' },
  { key: 'glass',       label: 'แก้ว/ขวด' },
  { key: 'electronics', label: 'อิเล็กทรอนิกส์' },
  { key: 'battery',     label: 'แบตเตอรี่' },
  { key: 'other',       label: 'อื่นๆ' },
]

export const CAT_COLORS: Record<string, string> = {
  copper:      '#f97316',
  aluminum:    '#3b82f6',
  steel:       '#64748b',
  plastic:     '#a855f7',
  paper:       '#eab308',
  glass:       '#06b6d4',
  electronics: '#22c55e',
  battery:     '#ec4899',
  other:       '#94a3b8',
}

/** หมวดหมู่เริ่มต้นตามรหัสสินค้า */
export function defaultCatKey(code: string): string {
  const n = parseInt(code.replace('CR', ''))
  if ([1,2,3,4,5,6,11,22].includes(n)) return 'copper'
  if (n >= 7 && n <= 20)               return 'aluminum'
  if ([32,33,34,71].includes(n))       return 'steel'
  if (n >= 23 && n <= 31)              return 'plastic'
  if (n >= 36 && n <= 39)              return 'paper'
  if ([35,40,41,42,43,44,45,46,47,48,49,50,51,52,67,68,69,70].includes(n)) return 'glass'
  if (n >= 55 && n <= 66)              return 'electronics'
  if ([72,73,74].includes(n))          return 'battery'
  return 'other'
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CAT_STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_CATEGORIES
}

export function saveCategories(cats: Category[]): void {
  localStorage.setItem(CAT_STORAGE, JSON.stringify(cats))
}

/** custom override map: { code → catKey } */
export function loadCatAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSIGN_STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export function saveCatAssignments(map: Record<string, string>): void {
  localStorage.setItem(ASSIGN_STORAGE, JSON.stringify(map))
}

/** หมวดหมู่ของสินค้า (custom > default) */
export function getCatKey(code: string, assignments: Record<string, string>): string {
  return assignments[code] ?? defaultCatKey(code)
}

/** color ของหมวดหมู่ (fallback เผื่อ custom) */
export function getCatColor(key: string, idx = 0): string {
  const FALLBACK = ['#f97316','#3b82f6','#64748b','#a855f7','#eab308','#06b6d4','#22c55e','#ec4899','#94a3b8','#14b8a6']
  return CAT_COLORS[key] ?? FALLBACK[idx % FALLBACK.length]
}
