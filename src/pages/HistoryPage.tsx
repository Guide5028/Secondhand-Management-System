import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'

type FilterType = 'all' | 'purchase' | 'sale'

const TYPE_LABEL: Record<FilterType, string> = {
  all: 'ทั้งหมด', purchase: 'ซื้อเข้า', sale: 'ขายออก',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)

export default function HistoryPage() {
  const [filter,   setFilter]   = useState<FilterType>('all')
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data: all = [], isLoading } = useTransactions()

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const rows = all
    .filter(r => filter === 'all' || r.type === filter)
    .filter(r =>
      !search ||
      r.party.includes(search) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    )

  const purchaseCount = all.filter(r => r.type === 'purchase').length
  const saleCount     = all.filter(r => r.type === 'sale').length
  const totalBuy      = all.filter(r => r.type === 'purchase').reduce((s, r) => s + r.total, 0)
  const totalSell     = all.filter(r => r.type === 'sale').reduce((s, r) => s + r.total, 0)

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
          <p className="text-2xl font-semibold">{isLoading ? '…' : all.length}</p>
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
          <p className={`text-2xl font-semibold font-mono ${totalSell - totalBuy >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            ฿{fmt(totalSell - totalBuy)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalSell > 0 ? `margin ${(((totalSell - totalBuy) / totalSell) * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text" className="input max-w-xs text-sm"
          placeholder="ค้นหา ชื่อคู่ค้า หรือ เลขที่เอกสาร..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5">
          {(['all', 'purchase', 'sale'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-colors
                ${filter === f
                  ? f === 'purchase' ? 'bg-slate-700 text-white border-slate-700'
                  : f === 'sale'     ? 'bg-blue-600 text-white border-blue-600'
                  :                   'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
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
        {isLoading ? (
          <div className="px-5 py-16 text-center text-slate-400 text-sm">กำลังโหลด…</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-slate-400">
              {all.length === 0
                ? 'ยังไม่มีรายการ — บันทึกซื้อหรือขายเพื่อเริ่มต้น'
                : 'ไม่พบรายการที่ค้นหา'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-xs text-slate-400">
              <div className="col-span-2">วันที่ / เวลา</div>
              <div className="col-span-1">ประเภท</div>
              <div className="col-span-2">เลขที่</div>
              <div className="col-span-4">คู่ค้า</div>
              <div className="col-span-1 text-center">รายการ</div>
              <div className="col-span-2 text-right">ยอดรวม (฿)</div>
            </div>

            {rows.map(r => {
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
                        ${r.type === 'purchase' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                        {r.type === 'purchase' ? 'ซื้อ' : 'ขาย'}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-slate-400 truncate">{r.receiptNo}</div>
                    <div className="col-span-4 text-sm text-slate-800 font-medium truncate">{r.party}</div>
                    <div className="col-span-1 text-center text-sm text-slate-500">{r.items.length}</div>
                    <div className="col-span-2 text-right">
                      <span className={`font-mono font-semibold text-sm
                        ${r.type === 'purchase' ? 'text-slate-700' : 'text-blue-600'}`}>
                        {fmt(r.total)}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

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
                              <td className="py-1.5 text-slate-700">
                                {it.code && <span className="text-slate-400 font-mono mr-1">{it.code}</span>}
                                {it.name}
                              </td>
                              <td className="py-1.5 text-right font-mono">
                                {it.weight.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
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
                            <td className="pt-2 text-right font-mono text-slate-800">฿{fmt(r.total)}</td>
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
