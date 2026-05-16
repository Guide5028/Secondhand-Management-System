import { useState, useRef } from 'react'

interface SaleItem {
  id: number; name: string; weight: string; price: string
}
let nextId = 1
const newItem = (): SaleItem => ({ id: nextId++, name: '', weight: '', price: '' })

export default function SalePage() {
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [buyerName,  setBuyerName]  = useState('')
  const [items,      setItems]      = useState<SaleItem[]>([newItem()])
  const [images,     setImages]     = useState<{ name: string; url: string }[]>([])
  const [submitted,  setSubmitted]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const updateItem = (id: number, field: keyof SaleItem, val: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))

  const addRow    = () => setItems(prev => [...prev, newItem()])
  const removeRow = (id: number) => { if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id)) }

  // อ่านไฟล์รูปเป็น base64 preview
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
  const fmt        = (n: number) => new Intl.NumberFormat('th-TH').format(n)

  const handleSubmit = () => {
    if (!buyerName)              { alert('กรุณาใส่ชื่อผู้ซื้อ'); return }
    if (validItems.length === 0) { alert('กรุณาเพิ่มรายการสินค้า'); return }
    if (images.length === 0)     { alert('กรุณาแนบหลักฐานใบเสร็จอย่างน้อย 1 รูป'); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">บันทึกขายออกสำเร็จ</h2>
          <p className="text-slate-500 mb-1">ผู้ซื้อ: <strong>{buyerName}</strong></p>
          <p className="text-slate-500 mb-4">ยอดรวม: <strong className="text-brand-600">฿{fmt(total)}</strong></p>
          <p className="text-sm text-slate-400 mb-6">แนบหลักฐาน {images.length} รูป</p>
          <button onClick={() => { setSubmitted(false); setItems([newItem()]); setImages([]); setBuyerName('') }}
            className="btn-primary">
            + บันทึกรายการใหม่
          </button>
        </div>
      </div>
    )
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
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <p className="text-sm font-medium text-slate-700">รายการสินค้าที่ขาย</p>
          <button onClick={addRow} className="btn-secondary text-xs py-1 px-3">+ เพิ่มรายการ</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2 text-left w-8">#</th>
                <th className="px-3 py-2 text-left">รายการ</th>
                <th className="px-3 py-2 text-center w-32">น้ำหนัก (น.)</th>
                <th className="px-3 py-2 text-center w-28">ราคา/น. (฿)</th>
                <th className="px-3 py-2 text-right w-28">จำนวนเงิน</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const amount = (parseFloat(item.weight) || 0) * (parseFloat(item.price) || 0)
                return (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input type="text" className="input" placeholder="ชื่อสินค้า"
                        value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" placeholder="0.00"
                        className="input text-center font-mono" value={item.weight}
                        onChange={e => updateItem(item.id, 'weight', e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" placeholder="0.00"
                        className="input text-center font-mono" value={item.price}
                        onChange={e => updateItem(item.id, 'price', e.target.value)} />
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium">
                      {amount > 0 ? amount.toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => removeRow(item.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
