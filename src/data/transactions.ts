export interface TxItem {
  code:   string
  name:   string
  weight: number
  price:  number
}

export interface Transaction {
  id:        string
  type:      'purchase' | 'sale'
  receiptNo: string
  date:      string  // YYYY-MM-DD
  time:      string  // HH:MM
  party:     string
  items:     TxItem[]
  total:     number
}

const KEY = 'kankrong_transactions'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveTransaction(tx: Transaction): void {
  const all = loadTransactions()
  const next = [...all.filter(t => t.id !== tx.id), tx]
    .sort((a, b) => (`${b.date}${b.time}`).localeCompare(`${a.date}${a.time}`))
  localStorage.setItem(KEY, JSON.stringify(next))
}
