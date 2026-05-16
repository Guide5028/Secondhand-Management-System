import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PRODUCTS = [
  { code: 'CR1',  name: 'ทองแดงปอกสวย1',           refPrice: 386 },
  { code: 'CR2',  name: 'ทองแดงช็อต2',           refPrice: 376 },
  { code: 'CR3',  name: 'ทองแดงเส้นใหญ่3',           refPrice: 360 },
  { code: 'CR4',  name: 'ทองแดงเส้นเล็ก4',           refPrice: 355 },
  { code: 'CR5',  name: 'ทองแดงเผา',         refPrice: 340 },
  { code: 'CR6',  name: 'ทองเหลือง',         refPrice: 200 },
  { code: 'CR7',  name: 'มีเนียมบาง',          refPrice: 64  },
  { code: 'CR8',  name: 'มีเนียมหนา',          refPrice: 63  },
  { code: 'CR9',  name: 'มีเนียมฉาก',          refPrice: 60  },
  { code: 'CR10', name: 'มีเนียมกระป๋อง',      refPrice: 71  },
  { code: 'CR11', name: 'หม้อน้ำทองแดง',           refPrice: 40  },
  { code: 'CR12', name: 'มีมีเนียมไส้ทองแดง',    refPrice: 55  },
  { code: 'CR13', name: 'มีมีเนียมไส้ทองเหลือง', refPrice: 50  },
  { code: 'CR14', name: 'มู่ลี่',            refPrice: 30  },
  { code: 'CR15', name: 'มีเนียมจั๊บ',         refPrice: 45  },
  { code: 'CR16', name: 'ตะกั่ว',            refPrice: 35  },
  { code: 'CR17', name: 'กระทะ',             refPrice: 40  },
  { code: 'CR18', name: 'มีเนียมติดเหล็ก',     refPrice: 25  },
  { code: 'CR19', name: 'มีเนียมสายไฟ',        refPrice: 80  },
  { code: 'CR20', name: 'มีเนียมติดเปลือก',    refPrice: 20  },
  { code: 'CR21', name: 'มอเตอร์',           refPrice: 15  },
  { code: 'CR22', name: 'ทองแดงติดเปลือก',   refPrice: 100 },
  { code: 'CR23', name: 'พลาสติกสี',         refPrice: 4   },
  { code: 'CR24', name: 'พลาสติกใส',         refPrice: 8   },
  { code: 'CR25', name: 'พลาสติกใส 2',       refPrice: 6   },
  { code: 'CR26', name: 'พลาสติกกรอบ',       refPrice: 3   },
  { code: 'CR27', name: 'ท่อฟ้า',            refPrice: 2   },
  { code: 'CR28', name: 'สายยาง',            refPrice: 2   },
  { code: 'CR29', name: 'เปลือกสายไฟ',       refPrice: 3   },
  { code: 'CR30', name: 'รองเท้าบูท',        refPrice: 2   },
  { code: 'CR31', name: 'รองเท้า',           refPrice: 2   },
  { code: 'CR32', name: 'เหล็กหนา',          refPrice: 25  },
  { code: 'CR33', name: 'เหล็กบาง',          refPrice: 6   },
  { code: 'CR34', name: 'สังกะสี',           refPrice: 5   },
  { code: 'CR35', name: 'กระป๋องกาแฟ',       refPrice: 4   },
  { code: 'CR36', name: 'กระดาษลัง',         refPrice: 3   },
  { code: 'CR37', name: 'กระดาษเศษ',         refPrice: 2   },
  { code: 'CR38', name: 'กระดาษขาวดำ',       refPrice: 3   },
  { code: 'CR39', name: 'ลังเปล่า',          refPrice: 3   },
  { code: 'CR40', name: 'เหล้าเล็ก',         refPrice: 5   },
  { code: 'CR41', name: 'เหล้าใหญ่',         refPrice: 8   },
  { code: 'CR42', name: 'ช้าง',              refPrice: 5   },
  { code: 'CR43', name: 'ลีโอ',              refPrice: 15  },
  { code: 'CR44', name: 'สิงห์',             refPrice: 10  },
  { code: 'CR45', name: 'หงส์กลม',           refPrice: 8   },
  { code: 'CR46', name: 'หงส์แบน',           refPrice: 8   },
  { code: 'CR47', name: 'คอยาวรวม',          refPrice: 6   },
  { code: 'CR48', name: 'ข้าวหอมเล็ก',       refPrice: 5   },
  { code: 'CR49', name: 'ข้าวหอมใหญ่',       refPrice: 7   },
  { code: 'CR50', name: 'นิยมไทยเล็ก',       refPrice: 5   },
  { code: 'CR51', name: 'นิยมไทยใหญ่',       refPrice: 7   },
  { code: 'CR52', name: 'พญานาค',            refPrice: 6   },
  { code: 'CR53', name: 'นุ่นหมอน',          refPrice: 5   },
  { code: 'CR54', name: 'นุ่นที่นอน',        refPrice: 4   },
  { code: 'CR55', name: 'พัดลม',             refPrice: 10  },
  { code: 'CR56', name: 'ตู้เย็น',           refPrice: 15  },
  { code: 'CR57', name: 'เครื่องซักผ้า',     refPrice: 15  },
  { code: 'CR58', name: 'ทีวีเล็ก',          refPrice: 5   },
  { code: 'CR59', name: 'ทีวีกลาง',          refPrice: 8   },
  { code: 'CR60', name: 'ทีวีใหญ่',          refPrice: 10  },
  { code: 'CR61', name: 'จอแบนใหญ่',         refPrice: 8   },
  { code: 'CR62', name: 'จอแบนเล็ก',         refPrice: 5   },
  { code: 'CR63', name: 'จอคอมนูน',          refPrice: 5   },
  { code: 'CR64', name: 'จอคอมแบน',          refPrice: 5   },
  { code: 'CR65', name: 'คอมชุด',            refPrice: 20  },
  { code: 'CR66', name: 'CPU',               refPrice: 10  },
  { code: 'CR67', name: 'ขวดแก้วแดง',        refPrice: 1   },
  { code: 'CR68', name: 'ขวดแก้วขาว',        refPrice: 1   },
  { code: 'CR69', name: 'ขวดแก้วเขียว',      refPrice: 1   },
  { code: 'CR70', name: 'ขวดรวม',            refPrice: 1   },
  { code: 'CR71', name: 'สแตนเลส',           refPrice: 30  },
  { code: 'CR72', name: 'แบตเล็ก',           refPrice: 26  },
  { code: 'CR73', name: 'แบตใหญ่',           refPrice: 27  },
  { code: 'CR74', name: 'แบตทรู',            refPrice: 23  },
  { code: 'CR75', name: 'ซีล',               refPrice: 5   },
  { code: 'CR76', name: 'ข้าวแห้ง',          refPrice: 3   },
  { code: 'CR77', name: 'เพทสกรีน',          refPrice: 2   },
  { code: 'CR78', name: 'ถังแก๊ส',           refPrice: 10  },
]

interface Item {
  id:     number
  code:   string
  name:   string
  weight: string
  price:  string
  search: string    // keyword ที่พิมพ์ใน input
  open:   boolean   // dropdown เปิดอยู่ไหม
}

let nextId = 1
const newItem = (): Item => ({
  id: nextId++, code: '', name: '', weight: '', price: '', search: '', open: false,
})

// Component Autocomplete สำหรับแต่ละ row
function ProductSearch({ item, onSelect, onChange }: {
  item:     Item
  onSelect: (p: typeof PRODUCTS[0]) => void
  onChange: (search: string) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onChange(item.name || '') // reset ถ้าไม่ได้เลือก
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [item.name])

  const filtered = item.search
    ? PRODUCTS.filter(p =>
        p.name.includes(item.search) ||
        p.code.toLowerCase().includes(item.search.toLowerCase())
      ).slice(0, 8)
    : []

  const showDrop = item.open && item.search.length > 0 && filtered.length > 0

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        type="text"
        className="input"
        placeholder="พิมพ์ชื่อหรือรหัส เช่น เหล็ก, CR32..."
        value={item.search}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
      {/* แสดงชื่อที่เลือกแล้ว */}
      {item.name && item.search === item.name && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
          {item.code}
        </span>
      )}

      {/* Dropdown ผลลัพธ์ */}
      {showDrop && (
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
              <span className="text-xs font-medium text-brand-600 ml-2">฿{p.refPrice}/น.</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PurchasePage() {
  const navigate = useNavigate()

  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [sellerName, setSellerName] = useState('')
  const [items,      setItems]      = useState<Item[]>([newItem()])

  const updateItem = (id: number, patch: Partial<Item>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

  const selectProduct = (id: number, p: typeof PRODUCTS[0]) => {
    updateItem(id, {
      code: p.code, name: p.name,
      price: String(p.refPrice),
      search: p.name, open: false,
    })
  }

  const handleSearch = (id: number, search: string) => {
    updateItem(id, { search, open: true, code: '', name: '' })
  }

  const addRow    = () => setItems(prev => [...prev, newItem()])
  const removeRow = (id: number) => {
    if (items.length === 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total      = items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (parseFloat(i.price) || 0), 0)
  const validItems = items.filter(i => i.name && parseFloat(i.weight) > 0)

  const handleSubmit = () => {
    if (!sellerName)             { alert('กรุณาใส่ชื่อผู้ขาย'); return }
    if (validItems.length === 0) { alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'); return }

    const thDate = new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })

    sessionStorage.setItem('receipt', JSON.stringify({
      date:       thDate,
      receiptNo:  `REC-${Date.now()}`,
      sellerName,
      items: validItems.map(i => ({
        name:   i.name,
        weight: parseFloat(i.weight),
        price:  parseFloat(i.price),
      })),
      total,
    }))
    navigate('/receipt')
  }

  return (
    <div className="max-w-4xl space-y-5">

      <div>
        <h2 className="text-base font-semibold text-slate-800">บันทึกซื้อเข้า</h2>
        <p className="text-sm text-slate-400 mt-0.5">กรอกข้อมูลแล้วกด "บันทึกและออกใบเสร็จ"</p>
      </div>

      {/* วันที่ + ชื่อผู้ขาย */}
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
            <input type="date" className="input" value={date}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              ชื่อผู้ขาย <span className="text-red-400">*</span>
            </label>
            <input type="text" className="input"
              placeholder="ชื่อ-นามสกุล หรือชื่อร้าน"
              value={sellerName}
              onChange={e => setSellerName(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ตารางรายการ */}
      <div className="card overflow-visible">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <p className="text-sm font-medium text-slate-700">รายการสินค้า</p>
          <button onClick={addRow} className="btn-secondary text-xs py-1 px-3">
            + เพิ่มรายการ
          </button>
        </div>

        <div className="p-3 space-y-2">
          {/* Header */}
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
              <div key={item.id}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg px-2 py-2">
                <div className="col-span-1 text-center text-sm text-slate-400">{idx + 1}</div>

                {/* Autocomplete search */}
                <div className="col-span-5">
                  <ProductSearch
                    item={item}
                    onSelect={p => selectProduct(item.id, p)}
                    onChange={s => handleSearch(item.id, s)}
                  />
                </div>

                {/* น้ำหนัก */}
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    className="input text-center font-mono"
                    value={item.weight}
                    onChange={e => updateItem(item.id, { weight: e.target.value })} />
                </div>

                {/* ราคา */}
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    className="input text-center font-mono"
                    value={item.price}
                    onChange={e => updateItem(item.id, { price: e.target.value })} />
                </div>

                {/* จำนวนเงิน + ลบ */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {amount > 0 ? amount.toFixed(2) : '—'}
                  </span>
                  <button onClick={() => removeRow(item.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0">
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ยอดรวม */}
        <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-400">{validItems.length} รายการ</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">รวมทั้งสิ้น</span>
            <span className="text-2xl font-semibold text-brand-600 font-mono">
              ฿{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button onClick={handleSubmit}
        disabled={!sellerName || validItems.length === 0}
        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
        🧾 บันทึกและออกใบเสร็จ
      </button>

    </div>
  )
}
