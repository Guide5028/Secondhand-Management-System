import { useState } from 'react'

interface TxItem {
  name:   string
  weight: number
  price:  number
}

interface TxRecord {
  id:    string
  type:  'purchase' | 'sale'
  date:  string
  time:  string
  party: string  // seller หรือ buyer
  items: TxItem[]
}

function total(items: TxItem[]) {
  return items.reduce((s, i) => s + i.weight * i.price, 0)
}

const HISTORY: TxRecord[] = [
  // 2026-05-16
  { id: 'REC-1747356001', type: 'purchase', date: '2026-05-16', time: '08:42', party: 'นายสมชาย ใจดี',
    items: [{ name: 'ทองแดงปอกสวย1', weight: 5.2, price: 386 }, { name: 'ทองเหลือง', weight: 12.5, price: 200 }] },
  { id: 'REC-1747356002', type: 'purchase', date: '2026-05-16', time: '10:15', party: 'นางสาวมาลี วงศ์ดี',
    items: [{ name: 'เหล็กหนา', weight: 85.0, price: 25 }, { name: 'มีเนียมสายไฟ', weight: 15.0, price: 80 }] },
  { id: 'REC-1747356003', type: 'purchase', date: '2026-05-16', time: '11:50', party: 'นายวิชัย สุขสมบูรณ์',
    items: [{ name: 'พลาสติกใส', weight: 45.0, price: 8 }, { name: 'กระดาษลัง', weight: 120.0, price: 3 }] },
  { id: 'REC-1747356004', type: 'purchase', date: '2026-05-16', time: '14:30', party: 'นายประสิทธิ์ มั่งมี',
    items: [{ name: 'มีเนียมกระป๋อง', weight: 32.5, price: 71 }, { name: 'แบตเล็ก', weight: 18.0, price: 26 }] },
  { id: 'SAL-1747390001', type: 'sale',     date: '2026-05-16', time: '15:30', party: 'บริษัท โลหะรีไซเคิล จำกัด',
    items: [{ name: 'ทองแดง (รวม)', weight: 25.0, price: 420 }, { name: 'มีเนียม (รวม)', weight: 180.0, price: 72 }] },

  // 2026-05-15
  { id: 'REC-1747269001', type: 'purchase', date: '2026-05-15', time: '09:10', party: 'นายสุรชัย ทองดี',
    items: [{ name: 'เหล็กหนา', weight: 210.0, price: 25 }, { name: 'เหล็กบาง', weight: 95.0, price: 6 }, { name: 'สังกะสี', weight: 40.0, price: 5 }] },
  { id: 'REC-1747269002', type: 'purchase', date: '2026-05-15', time: '13:00', party: 'นางจันทร์ แก้วมณี',
    items: [{ name: 'ทองแดงช็อต2', weight: 8.5, price: 376 }, { name: 'ตะกั่ว', weight: 22.0, price: 35 }] },
  { id: 'SAL-1747303001', type: 'sale',     date: '2026-05-15', time: '16:00', party: 'ร้านเหล็กชัยภูมิ',
    items: [{ name: 'เหล็กหนา (รวม)', weight: 450.0, price: 27 }, { name: 'เหล็กบาง (รวม)', weight: 280.0, price: 7 }] },

  // 2026-05-14
  { id: 'REC-1747182001', type: 'purchase', date: '2026-05-14', time: '08:20', party: 'นายบุญมา ศรีวิลัย',
    items: [{ name: 'กระดาษลัง', weight: 280.0, price: 3 }, { name: 'กระดาษเศษ', weight: 155.0, price: 2 }, { name: 'พลาสติกสี', weight: 95.0, price: 4 }] },
  { id: 'REC-1747182002', type: 'purchase', date: '2026-05-14', time: '10:45', party: 'นางสาวพิมพ์ใจ รักดี',
    items: [{ name: 'แบตใหญ่', weight: 35.0, price: 27 }, { name: 'แบตทรู', weight: 12.0, price: 23 }] },
  { id: 'REC-1747182003', type: 'purchase', date: '2026-05-14', time: '15:20', party: 'นายสำราญ ปราโมทย์',
    items: [{ name: 'มีเนียมบาง', weight: 55.0, price: 64 }, { name: 'มู่ลี่', weight: 28.0, price: 30 }] },

  // 2026-05-13
  { id: 'REC-1747095001', type: 'purchase', date: '2026-05-13', time: '09:30', party: 'นายอนันต์ พรมสิทธิ์',
    items: [{ name: 'ทองแดงปอกสวย1', weight: 3.8, price: 386 }, { name: 'มีเนียมหนา', weight: 28.0, price: 63 }] },
  { id: 'REC-1747095002', type: 'purchase', date: '2026-05-13', time: '14:00', party: 'นางวิไล ดีมาก',
    items: [{ name: 'ช้าง', weight: 120.0, price: 5 }, { name: 'ลีโอ', weight: 45.0, price: 15 }] },
  { id: 'SAL-1747130001', type: 'sale',     date: '2026-05-13', time: '15:45', party: 'บริษัท รีไซเคิลไทย จำกัด',
    items: [{ name: 'กระดาษ (รวม)', weight: 620.0, price: 3 }, { name: 'พลาสติก (รวม)', weight: 340.0, price: 5 }] },

  // 2026-05-12
  { id: 'REC-1747008001', type: 'purchase', date: '2026-05-12', time: '08:55', party: 'นายประพันธ์ ใจเย็น',
    items: [{ name: 'เหล็กหนา', weight: 155.0, price: 25 }, { name: 'สแตนเลส', weight: 18.5, price: 30 }] },
  { id: 'REC-1747008002', type: 'purchase', date: '2026-05-12', time: '11:20', party: 'นางสาวสุดา มาดี',
    items: [{ name: 'ทองเหลือง', weight: 22.0, price: 200 }, { name: 'หม้อน้ำทองแดง', weight: 15.0, price: 40 }] },
  { id: 'REC-1747008003', type: 'purchase', date: '2026-05-12', time: '15:10', party: 'นายเกียรติ ศรีสุข',
    items: [{ name: 'แบตเล็ก', weight: 42.0, price: 26 }, { name: 'แบตใหญ่', weight: 25.0, price: 27 }] },
  { id: 'SAL-1747043001', type: 'sale',     date: '2026-05-12', time: '16:30', party: 'ร้านทองแดงชัย',
    items: [{ name: 'ทองแดง (รวม)', weight: 18.0, price: 415 }, { name: 'ทองเหลือง (รวม)', weight: 55.0, price: 215 }] },
]

type FilterType = 'all' | 'purchase' | 'sale'

const TYPE_LABEL: Record<FilterType, string> = {
  all: 'ทั้งหมด', purchase: 'ซื้อเข้า', sale: 'ขายออก',
}

export default function HistoryPage() {
  const [filter,   setFilter]   = useState<FilterType>('all')
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const fmt = (n: number) =>
    new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const rows = HISTORY
    .filter(r => filter === 'all' || r.type === filter)
    .filter(r =>
      !search ||
      r.party.includes(search) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    )

  const purchaseCount = HISTORY.filter(r => r.type === 'purchase').length
  const saleCount     = HISTORY.filter(r => r.type === 'sale').length
  const totalBuy  = HISTORY.filter(r => r.type === 'purchase').reduce((s, r) => s + total(r.items), 0)
  const totalSell = HISTORY.filter(r => r.type === 'sale').reduce((s, r) => s + total(r.items), 0)

  return (
    <div className="max-w-5xl space-y-5">

      <div>
        <h2 className="text-base font-semibold text-slate-800">ประวัติรายการ</h2>
        <p className="text-sm text-slate-400 mt-0.5">รายการซื้อเข้า-ขายออกทั้งหมด</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">รายการทั้งหมด</p>
          <p className="text-2xl font-semibold">{HISTORY.length}</p>
          <p className="text-xs text-slate-400 mt-1">ซื้อ {purchaseCount} · ขาย {saleCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดซื้อรวม</p>
          <p className="text-2xl font-semibold text-slate-700 font-mono">฿{fmt(totalBuy)}</p>
          <p className="text-xs text-slate-400 mt-1">{purchaseCount} ใบรับ</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดขายรวม</p>
          <p className="text-2xl font-semibold text-blue-600 font-mono">฿{fmt(totalSell)}</p>
          <p className="text-xs text-slate-400 mt-1">{saleCount} รายการขาย</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">กำไรรวม (ช่วงนี้)</p>
          <p className="text-2xl font-semibold text-brand-600 font-mono">฿{fmt(totalSell - totalBuy)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {totalSell > 0 ? `margin ${(((totalSell - totalBuy) / totalSell) * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs text-sm"
          placeholder="ค้นหา ชื่อคู่ค้า หรือ เลขที่เอกสาร..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5">
          {(['all', 'purchase', 'sale'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-colors
                ${filter === f
                  ? f === 'purchase'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : f === 'sale'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              {TYPE_LABEL[f]}
              {f !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({f === 'purchase' ? purchaseCount : saleCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">ไม่พบรายการที่ค้นหา</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-xs text-slate-400">
              <div className="col-span-2">วันที่ / เวลา</div>
              <div className="col-span-1">ประเภท</div>
              <div className="col-span-2">เลขที่</div>
              <div className="col-span-4">คู่ค้า</div>
              <div className="col-span-1 text-center">รายการ</div>
              <div className="col-span-2 text-right">ยอดรวม (฿)</div>
            </div>

            {rows.map(r => {
              const amt = total(r.items)
              const isOpen = expanded.has(r.id)
              const thDate = new Date(r.date).toLocaleDateString('th-TH', {
                day: '2-digit', month: 'short',
              })
              return (
                <div key={r.id}>
                  <button
                    onClick={() => toggle(r.id)}
                    className="w-full grid grid-cols-12 gap-2 px-5 py-3 hover:bg-slate-50 transition-colors text-left items-center"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-slate-700">{thDate}</p>
                      <p className="text-xs text-slate-400">{r.time}</p>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${r.type === 'purchase'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-600'}`}>
                        {r.type === 'purchase' ? 'ซื้อ' : 'ขาย'}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-slate-400">{r.id}</div>
                    <div className="col-span-4 text-sm text-slate-800 font-medium truncate">{r.party}</div>
                    <div className="col-span-1 text-center text-sm text-slate-500">{r.items.length}</div>
                    <div className="col-span-2 text-right">
                      <span className={`font-mono font-semibold text-sm
                        ${r.type === 'purchase' ? 'text-slate-700' : 'text-blue-600'}`}>
                        {fmt(amt)}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Expanded items */}
                  {isOpen && (
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-400">
                            <th className="text-left pb-1.5 font-medium">ชื่อสินค้า</th>
                            <th className="text-right pb-1.5 font-medium">น้ำหนัก (น.)</th>
                            <th className="text-right pb-1.5 font-medium">ราคา/น. (฿)</th>
                            <th className="text-right pb-1.5 font-medium">จำนวนเงิน (฿)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {r.items.map((it, i) => (
                            <tr key={i}>
                              <td className="py-1.5 text-slate-700">{it.name}</td>
                              <td className="py-1.5 text-right font-mono">
                                {it.weight.toLocaleString('th-TH', { maximumFractionDigits: 1 })}
                              </td>
                              <td className="py-1.5 text-right font-mono text-slate-500">{it.price}</td>
                              <td className="py-1.5 text-right font-mono font-medium">
                                {fmt(it.weight * it.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 font-semibold">
                            <td colSpan={3} className="pt-2 text-slate-500">รวม</td>
                            <td className="pt-2 text-right font-mono text-slate-800">฿{fmt(amt)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
