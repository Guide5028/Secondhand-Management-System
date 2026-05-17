import { useState } from 'react'
import { loadProducts } from '../data/products'
import {
  loadCategories,
  loadCatAssignments,
  getCatKey,
} from '../data/categories'

const STORAGE_KEY = 'kankrong_stock'

const DEFAULT_STOCK: Record<string, number> = {
  CR1: 45.5, CR2: 12.3, CR3: 8.0, CR5: 6.5, CR6: 33.0,
  CR7: 125.0, CR8: 42.0, CR10: 87.5, CR11: 18.0,
  CR16: 55.0, CR19: 22.0, CR21: 48.0, CR22: 5.5,
  CR23: 210.0, CR24: 145.0,
  CR32: 580.0, CR33: 320.0, CR34: 145.0,
  CR36: 340.0, CR37: 220.0,
  CR42: 85.0, CR43: 30.0,
  CR71: 12.5,
  CR72: 45.0, CR73: 28.0, CR74: 15.0,
}

function loadStock(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_STOCK
}

function saveStock(stock: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock))
}

function getStatus(weight: number): { label: string; cls: string } {
  if (weight <= 0)  return { label: 'หมด',  cls: 'bg-red-100 text-red-600' }
  if (weight < 20)  return { label: 'น้อย', cls: 'bg-amber-100 text-amber-600' }
  if (weight < 100) return { label: 'ปกติ', cls: 'bg-blue-100 text-blue-600' }
  return                   { label: 'มาก',  cls: 'bg-green-100 text-green-700' }
}

export default function StockPage() {
  const [stock,    setStock]    = useState<Record<string, number>>(loadStock)
  const [search,   setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [editMode, setEditMode] = useState(false)
  const [draft,    setDraft]    = useState<Record<string, string>>({})
  const [saved,    setSaved]    = useState(false)

  const products    = loadProducts()
  const categories  = loadCategories()
  const assignments = loadCatAssignments()

  const handlePrint = () => {
    const date = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    const rows = (catFilter === 'all' ? allRows : allRows.filter(r => r.catKey === catFilter))
      .filter(r => !search || r.name.includes(search) || r.code.toLowerCase().includes(search.toLowerCase()))
    const totalW = rows.reduce((s, r) => s + r.weight, 0)
    const rowsHtml = rows.map(r => {
      const catObj = categories.find(c => c.key === r.catKey)
      return `<tr>
        <td>${r.code}</td>
        <td>${r.name}</td>
        <td>${catObj?.label ?? r.catKey}</td>
        <td style="text-align:right">${r.weight.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
      </tr>`
    }).join('')
    const win = window.open('', '_blank', 'width=800,height=600')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>รายงานสต็อกคงเหลือ</title>
      <style>
        body { font-family: 'Noto Sans Thai', Tahoma, sans-serif; padding: 24px; color: #1e293b; }
        h2 { margin: 0 0 4px; font-size: 18px; }
        p  { margin: 0 0 16px; color: #64748b; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 10px; }
        th { background: #f8fafc; font-weight: 600; text-align: left; }
        tfoot td { background: #f1f5f9; font-weight: 700; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>
      <h2>รายงานสต็อกคงเหลือ</h2>
      <p>ข้อมูล ณ ${date} · ${rows.length} รายการ</p>
      <table>
        <thead><tr><th>รหัส</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th style="text-align:right">น้ำหนัก (กก.)</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr><td colspan="3">รวม ${rows.length} รายการ</td><td style="text-align:right">${totalW.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td></tr></tfoot>
      </table>
    </body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 300)
  }

  const allRows = products
    .filter(p => editMode || (stock[p.code] ?? 0) > 0)
    .map(p => ({
      ...p,
      catKey: getCatKey(p.code, assignments),
      weight: stock[p.code] ?? 0,
    }))
    .sort((a, b) => b.weight - a.weight)

  const filtered = allRows
    .filter(r => catFilter === 'all' || r.catKey === catFilter)
    .filter(r => !search || r.name.includes(search) || r.code.toLowerCase().includes(search.toLowerCase()))

  const totalWeight   = Object.values(stock).reduce((s, w) => s + w, 0)
  const inStockCount  = Object.values(stock).filter(w => w > 0).length

  const thDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  const startEdit = () => {
    const d: Record<string, string> = {}
    products.forEach(p => { d[p.code] = String(stock[p.code] ?? 0) })
    setDraft(d)
    setEditMode(true)
  }

  const saveEdit = () => {
    const updated: Record<string, number> = {}
    Object.entries(draft).forEach(([code, val]) => {
      const n = parseFloat(val) || 0
      if (n > 0) updated[code] = n
    })
    setStock(updated)
    saveStock(updated)
    setEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cancelEdit = () => { setDraft({}); setEditMode(false) }

  const catLabel = (key: string) => {
    if (key === 'all') return 'ทั้งหมด'
    return categories.find(c => c.key === key)?.label ?? key
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">สต็อกคงเหลือ</h2>
          <p className="text-sm text-slate-400 mt-0.5">ข้อมูล ณ {thDate}</p>
        </div>
        <div className="flex gap-2 items-center">
          {saved && (
            <span className="text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-lg">
              บันทึกแล้ว ✓
            </span>
          )}
          {editMode ? (
            <>
              <button onClick={cancelEdit} className="btn-secondary text-sm py-1.5 px-4">ยกเลิก</button>
              <button onClick={saveEdit}   className="btn-primary  text-sm py-1.5 px-4">บันทึกสต็อก</button>
            </>
          ) : (
            <>
              <button onClick={handlePrint} className="btn-secondary text-sm py-1.5 px-4">
                🖨️ พิมพ์/PDF
              </button>
              <button onClick={startEdit} className="btn-secondary text-sm py-1.5 px-4">
                ✏️ แก้ไขสต็อก
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ประเภทสินค้าที่มีในสต็อก</p>
          <p className="text-2xl font-semibold">
            {inStockCount}
            <span className="text-sm font-normal text-slate-400 ml-1">ประเภท</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">จาก {products.length} ประเภทสินค้าทั้งหมด</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">น้ำหนักรวมทั้งหมด</p>
          <p className="text-2xl font-semibold font-mono">
            {totalWeight.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span className="text-sm font-normal text-slate-400 ml-1">กก.</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">รวมทุกหมวดหมู่</p>
        </div>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs text-sm"
          placeholder="ค้นหา ชื่อสินค้า หรือ รหัส..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...categories.map(c => c.key)] as string[]).map(key => {
            const count = key === 'all'
              ? allRows.length
              : allRows.filter(r => r.catKey === key).length
            if (key !== 'all' && count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setCatFilter(key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                  ${catFilter === key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
              >
                {catLabel(key)}{key !== 'all' && <span className="ml-1 opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>
        {editMode && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            โหมดแก้ไข — แสดงสินค้าทั้งหมด
          </span>
        )}
      </div>

      {/* Stock table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 text-left w-16">รหัส</th>
              <th className="px-5 py-3 text-left">ชื่อสินค้า</th>
              <th className="px-5 py-3 text-left w-36">หมวดหมู่</th>
              <th className="px-5 py-3 text-right w-40">น้ำหนักคงเหลือ (กก.)</th>
              <th className="px-5 py-3 text-center w-24">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">
                  ไม่พบรายการสินค้า
                </td>
              </tr>
            ) : filtered.map(r => {
              const displayWeight = editMode ? (parseFloat(draft[r.code]) || 0) : r.weight
              const status        = getStatus(displayWeight)
              const catObj        = categories.find(c => c.key === r.catKey)
              return (
                <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-xs text-slate-400">{r.code}</td>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{r.name}</td>
                  <td className="px-5 py-2.5 text-xs text-slate-500">{catObj?.label ?? r.catKey}</td>
                  <td className="px-5 py-2.5 text-right">
                    {editMode ? (
                      <input
                        type="number" min="0" step="0.1"
                        className="w-28 text-sm bg-white border border-brand-300 rounded px-2 py-1 font-mono text-right focus:outline-none focus:ring-1 focus:ring-brand-400 ml-auto block"
                        value={draft[r.code] ?? '0'}
                        onChange={e => setDraft(prev => ({ ...prev, [r.code]: e.target.value }))}
                      />
                    ) : (
                      <span className="font-mono font-medium text-slate-700">
                        {r.weight.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {!editMode && filtered.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={3} className="px-5 py-3 text-sm text-slate-500 font-medium">
                  รวม {filtered.length} รายการ
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-sm">
                  {filtered.reduce((s, r) => s + r.weight, 0)
                    .toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กก.
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

    </div>
  )
}
