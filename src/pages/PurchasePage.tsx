import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductSearch from '../components/ProductSearch'
import { useProducts } from '../hooks/useProducts'
import { useSaveTransaction } from '../hooks/useTransactions'
import type { Transaction } from '../data/transactions'

interface Item {
  id: number; code: string; name: string; weight: string; price: string; search: string; open: boolean
}
let nextId = 1
const newItem = (): Item => ({ id: nextId++, code: '', name: '', weight: '', price: '', search: '', open: false })

export default function PurchasePage() {
  const navigate = useNavigate()
  const { data: products = [] } = useProducts()
  const saveTx = useSaveTransaction()

  const [tab,   setTab]   = useState<'entry' | 'summary'>('entry')
  const [date,  setDate]  = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<Item[]>([newItem()])

  const updateItem = (id: number, patch: Partial<Item>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

  const selectProduct = (id: number, p: { code: string; name: string; refPrice: number }) =>
    updateItem(id, { code: p.code, name: p.name, price: String(p.refPrice), search: p.name, open: false })

  const addRow    = () => setItems(prev => [...prev, newItem()])
  const removeRow = (id: number) => { if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id)) }

  const total      = items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (parseFloat(i.price) || 0), 0)
  const validItems = items.filter(i => i.name && parseFloat(i.weight) > 0)

  const handleSubmit = async () => {
    if (validItems.length === 0) { alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'); return }
    const now       = new Date()
    const receiptNo = `REC-${now.getTime()}`
    const party     = 'ลูกค้าทั่วไป'
    const txItems   = validItems.map(i => ({
      code: i.code, name: i.name,
      weight: parseFloat(i.weight), price: parseFloat(i.price),
    }))
    const tx: Transaction = {
      id: receiptNo, type: 'purchase', receiptNo,
      date, time: now.toTimeString().slice(0, 5),
      party, items: txItems, total,
    }
    await saveTx.mutateAsync(tx)
    const thDate = new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
    sessionStorage.setItem('receipt', JSON.stringify({
      date: thDate, receiptNo, sellerName: party,
      items: txItems.map(({ name, weight, price }) => ({ name, weight, price })),
      total,
    }))
    navigate('/receipt')
  }

  const fmt = (n: number) => new Intl.NumberFormat('th-TH').format(Math.round(n))

  // ── Summary tab: aggregate from recent transactions (for now shows placeholder) ──
  const MOCK_HISTORY = [
    { code: 'CR32', name: 'เหล็กหนา',        weight: 2786.5, cashOut: 69663 },
    { code: 'CR36', name: 'กระดาษลัง',       weight: 1038.6, cashOut: 31158 },
    { code: 'CR1',  name: 'ทองแดงปอกสวย1',   weight: 89.2,   cashOut: 34451 },
    { code: 'CR7',  name: 'มีเนียมบาง',      weight: 210.4,  cashOut: 13466 },
    { code: 'CR24', name: 'พลาสติกใส',       weight: 589.3,  cashOut: 4714  },
  ]

  return (
    <div className="max-w-4xl space-y-5">

      {/* Tab */}
      <div className="flex gap-2">
        {([['entry', 'บันทึกซื้อเข้า'], ['summary', 'สรุปยอดซื้อ']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === key ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: บันทึก */}
      {tab === 'entry' && (
        <>
          <div className="card p-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
              <input type="date" className="input max-w-xs" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className="card overflow-visible">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-700">รายการสินค้า</p>
              <button onClick={addRow} className="btn-secondary text-xs py-1 px-3">+ เพิ่มรายการ</button>
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 px-2">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">รายการสินค้า</div>
                <div className="col-span-2 text-center">น้ำหนัก (น.)</div>
                <div className="col-span-2 text-center">ราคา/น. (฿)</div>
                <div className="col-span-2 text-right">จำนวนเงิน</div>
              </div>
              {items.map((item, idx) => {
                const amount = (parseFloat(item.weight) || 0) * (parseFloat(item.price) || 0)
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg px-2 py-2">
                    <div className="col-span-1 text-center text-sm text-slate-400">{idx + 1}</div>
                    <div className="col-span-5">
                      <ProductSearch
                        products={products}
                        search={item.search} code={item.code} name={item.name} open={item.open}
                        priceField="refPrice"
                        onSelect={p => selectProduct(item.id, p)}
                        onChange={s => updateItem(item.id, { search: s, open: true, code: '', name: '' })}
                        onClose={() => updateItem(item.id, { open: false })}
                      />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" min="0" placeholder="0.00" className="input text-center font-mono"
                        value={item.weight} onChange={e => updateItem(item.id, { weight: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" min="0" placeholder="0.00" className="input text-center font-mono"
                        value={item.price} onChange={e => updateItem(item.id, { price: e.target.value })} />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="font-mono text-sm font-medium">{amount > 0 ? amount.toFixed(2) : '—'}</span>
                      <button onClick={() => removeRow(item.id)} className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="text-sm text-slate-400">{validItems.length} รายการ</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">รวมทั้งสิ้น</span>
                <span className="text-2xl font-semibold text-brand-600 font-mono">฿{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button onClick={handleSubmit}
            disabled={validItems.length === 0 || saveTx.isPending}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
            {saveTx.isPending ? '⏳ กำลังบันทึก…' : '🧾 บันทึกและออกใบเสร็จ'}
          </button>
        </>
      )}

      {/* TAB 2: สรุปยอดซื้อ */}
      {tab === 'summary' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-2 text-left">สินค้า</th>
                <th className="px-5 py-2 text-right">น้ำหนักรวม (น.)</th>
                <th className="px-5 py-2 text-right">ใช้จ่ายรวม</th>
                <th className="px-5 py-2 text-right">ราคาเฉลี่ย/น.</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map(h => (
                <tr key={h.code} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-slate-400 mr-2">{h.code}</span>
                    {h.name}
                  </td>
                  <td className="px-5 py-3 text-right font-mono">{fmt(h.weight)}</td>
                  <td className="px-5 py-3 text-right font-mono font-medium">฿{fmt(h.cashOut)}</td>
                  <td className="px-5 py-3 text-right font-mono text-brand-600">
                    ฿{(h.cashOut / h.weight).toFixed(1)}/น.
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="px-5 py-3">รวม</td>
                <td className="px-5 py-3 text-right font-mono">{fmt(MOCK_HISTORY.reduce((s, h) => s + h.weight, 0))}</td>
                <td className="px-5 py-3 text-right font-mono">฿{fmt(MOCK_HISTORY.reduce((s, h) => s + h.cashOut, 0))}</td>
                <td className="px-5 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
