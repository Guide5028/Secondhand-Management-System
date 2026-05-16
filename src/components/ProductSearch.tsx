import { useRef, useEffect } from 'react'
import { loadProducts } from '../data/products'

interface Props {
  search:   string
  code:     string
  name:     string
  open:     boolean
  priceField?: 'refPrice' | 'sellPrice'  // ซื้อ=refPrice, ขาย=sellPrice
  onSelect: (p: { code: string; name: string; refPrice: number; sellPrice: number }) => void
  onChange: (search: string) => void
}

export default function ProductSearch({
  search, code, name, open,
  priceField = 'refPrice',
  onSelect, onChange,
}: Props) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const products = loadProducts()

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        onChange(name || '')
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [name])

  const filtered = search
    ? products
        .filter(p =>
          p.name.includes(search) ||
          p.code.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 8)
    : []

  const displayPrice = (p: { refPrice: number; sellPrice: number }) =>
    priceField === 'sellPrice' ? p.sellPrice : p.refPrice

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        type="text"
        className="input"
        autoComplete="off"
        placeholder="พิมพ์ชื่อหรือรหัส เช่น เหล็ก, CR32..."
        value={search}
        onChange={e => onChange(e.target.value)}
      />
      {name && search === name && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
          {code}
        </span>
      )}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {filtered.map(p => (
            <button
              key={p.code}
              type="button"
              onMouseDown={() => onSelect(p)}
              className="w-full flex justify-between items-center px-3 py-2 hover:bg-brand-50 text-sm text-left transition-colors"
            >
              <span>
                <span className="text-xs font-mono text-slate-400 mr-2">{p.code}</span>
                <span className="text-slate-700">{p.name}</span>
              </span>
              <span className="text-xs font-medium text-brand-600 ml-2">
                ฿{displayPrice(p)}/น.
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
