import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductSearch from '../components/ProductSearch'
import { saveTransaction } from '../data/transactions'

interface SaleItem {
  id: number; code: string; name: string; weight: string; price: string; search: string; open: boolean
}
let nextId = 1
const newItem = (): SaleItem => ({ id: nextId++, code: '', name: '', weight: '', price: '', search: '', open: false })

export default function SalePage() {
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [buyerName, setBuyerName] = useState('')
  const [items,     setItems]     = useState<SaleItem[]>([newItem()])
  const [images,    setImages]    = useState<{ name: string; url: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const updateItem = (id: number, patch: Partial<SaleItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

  const selectProduct = (id: number, p: { code: string; name: string; sellPrice: number }) =>
    updateItem(id, { code: p.code, name: p.name, price: String(p.sellPrice), search: p.name, open: false })

  const addRow    = () => setItems(prev => [...prev, newItem()])
  const removeRow = (id: number) => { if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id)) }

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setImages(prev => [...prev, { name: file.name, url: reader.result as string }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (name: string) =>
    setImages(prev => prev.filter(i => i.name !== name))

  const total      = items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (parseFloat(i.price) || 0), 0)
  const validItems = items.filter(i => i.name && parseFloat(i.weight) > 0)

  const handleSubmit = () => {
    if (!buyerName)              { alert('กรุณาใส่ชื่อผู้ซื้อ'); return }
    if (validItems.length === 0) { alert('กรุณาเพิ่มรายการสินค้า'); return }
    if (images.length === 0)     { alert('กรุณาแนบหลักฐานใบเสร็จอย่างน้อย 1 รูป'); return }

    const now       = new Date()
    const receiptNo = `SAL-${now.getTime()}`
    const txItems   = validItems.map(i => ({
      code: i.code, name: i.name,
      weight: parseFloat(i.weight), price: parseFloat(i.price),
    }))
    saveTransaction({
      id: receiptNo, type: 'sale', receiptNo,
      date, time: now.toTimeString().slice(0, 5),
      party: buyerName, items: txItems, total,
    })
    const thDate = new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    sessionStorage.setItem('receipt', JSON.stringify({
      type: 'sale', receiptNo, date: thDate, buyerName,
      items: txItems.map(({ name, weight, price }) => ({ name, weight, price })),
      total,
    }))
    navigate('/receipt')
  }

  return (
    <div className="max-w-4xl space-y-5">

      <div>
        <h2 className="text-base font-semibold text-slate-800">บันทึกขายออก</h2>
        <p className="text-sm text-slate-400 mt-0.5">ต้องแนบหลักฐานใบเสร็จทุกครั้ง เพื่อป้องกันการทุจริต</p>
      </div>

      {/* วันที่ + ผู้ซื้อ */}
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              ชื่อผู้ซื้อ (รายใหญ่) <span className="text-red-400">*</span>
            </label>
            <input type="text" className="input" placeholder="ชื่อบริษัท หรือชื่อผู้ซื้อ"
              value={buyerName} onChange={e => setBuyerName(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ตารางรายการ */}
      <div className="card overflow-visible">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <p className="text-sm font-medium text-slate-700">รายการสินค้าที่ขาย</p>
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
                    search={item.search} code={item.code} name={item.name} open={item.open}
                    priceField="sellPrice"
                    onSelect={p => selectProduct(item.id, p)}
                    onChange={s => updateItem(item.id, { search: s, open: true, code: '', name: '' })}
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
            <span className="text-sm text-slate-500">รวม Cash IN</span>
            <span className="text-2xl font-semibold text-brand-600 font-mono">฿{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* แนบหลักฐาน */}
      <div className="card p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              📎 แนบหลักฐานใบเสร็จ <span className="text-red-400">*</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              บังคับแนบ — ป้องกันการปลอมใบเสร็จและการทุจริต
            </p>
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="btn-secondary flex items-center gap-2 text-sm">
            📷 เลือกรูป
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={handleImages} />
        </div>

        {images.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <p className="text-3xl mb-2">🖼️</p>
            <p className="text-sm text-slate-400">กดเพื่อเลือกรูปภาพใบเสร็จ</p>
            <p className="text-xs text-slate-300 mt-1">รองรับ JPG, PNG — เลือกได้หลายรูป</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.name} className="relative group">
                <img src={img.url} alt={img.name}
                  className="w-full h-36 object-cover rounded-lg border border-slate-200" />
                <button
                  onClick={() => removeImage(img.name)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs
                             opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  ✕
                </button>
                <p className="text-xs text-slate-400 mt-1 truncate">{img.name}</p>
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()}
              className="h-36 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors">
              <span className="text-2xl">+</span>
              <span className="text-xs mt-1">เพิ่มรูป</span>
            </button>
          </div>
        )}

        {images.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
            <span>✅</span>
            <span>แนบหลักฐานแล้ว {images.length} รูป</span>
          </div>
        )}
      </div>

      <button onClick={handleSubmit}
        disabled={!buyerName || validItems.length === 0 || images.length === 0}
        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
        💾 บันทึกขายออก
      </button>

      {images.length === 0 && (
        <p className="text-center text-xs text-red-400">⚠️ ต้องแนบหลักฐานใบเสร็จก่อนบันทึก</p>
      )}

    </div>
  )
}
