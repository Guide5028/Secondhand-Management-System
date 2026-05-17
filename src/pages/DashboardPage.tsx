import { useState } from 'react'
import { loadTransactions } from '../data/transactions'

interface DailyRecord {
  date: string; sale: number; purchase: number
  labor: number; fuel: number; utility: number
  rent: number; misc: number; other: number; vehicle: number
}

function loadDailyRecords(): DailyRecord[] {
  try { const r = localStorage.getItem('kankrong_daily'); if (r) return JSON.parse(r) } catch {}
  return []
}

const N   = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)
const pct = (n: number, base: number) => base > 0 ? ((n / base) * 100).toFixed(1) + '%' : '—'

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const monthLabel  = (ym: string) => { const [y,m] = ym.split('-').map(Number); return `${MONTH_NAMES[m-1]} ${y+543}` }

export default function DashboardPage() {
  const [tab, setTab] = useState<'overview' | 'report'>('overview')
  const [selectedYM, setSelectedYM] = useState<string>('all')

  const transactions = loadTransactions()
  const dailyRecords = loadDailyRecords()

  // ── Month list from real data ──
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthSet = new Set([currentMonth,
    ...transactions.map(t => t.date.slice(0, 7)),
    ...dailyRecords.map(d => d.date.slice(0, 7)),
  ])
  const months = [...monthSet].sort().reverse()

  // ── Aggregate helper ──
  function aggregate(ym: string | 'all') {
    const txs  = ym === 'all' ? transactions : transactions.filter(t => t.date.startsWith(ym))
    const days = ym === 'all' ? dailyRecords  : dailyRecords.filter(d => d.date.startsWith(ym))
    const sales     = txs.filter(t => t.type === 'sale').reduce((s,t) => s + t.total, 0)
    const purchases = txs.filter(t => t.type === 'purchase').reduce((s,t) => s + t.total, 0)
    const labor   = days.reduce((s,d) => s + d.labor, 0)
    const fuel    = days.reduce((s,d) => s + d.fuel, 0)
    const utility = days.reduce((s,d) => s + d.utility, 0)
    const rent    = days.reduce((s,d) => s + d.rent, 0)
    const misc    = days.reduce((s,d) => s + d.misc, 0)
    const other   = days.reduce((s,d) => s + d.other, 0)
    const vehicle = days.reduce((s,d) => s + d.vehicle, 0)
    const exp     = labor + fuel + utility + rent + misc + other + vehicle
    return { sales, purchases, labor, fuel, utility, rent, misc, other, vehicle, exp,
             profit: sales - purchases - exp }
  }

  // ── Monthly rows (for overview table) ──
  const monthlyRows = months.map(ym => ({ ym, ...aggregate(ym) }))
  const agg = aggregate(selectedYM)
  const profitMargin = agg.sales > 0 ? ((agg.profit / agg.sales) * 100).toFixed(1) : '0'

  // ── Top 5 hero products (from transactions) ──
  function getTop5(ym: string | 'all') {
    const txs = ym === 'all' ? transactions : transactions.filter(t => t.date.startsWith(ym))

    // Purchase top 5 by total weight
    const buyMap: Record<string, { name: string; weight: number; value: number }> = {}
    txs.filter(t => t.type === 'purchase').forEach(t =>
      t.items.forEach(it => {
        if (!buyMap[it.name]) buyMap[it.name] = { name: it.name, weight: 0, value: 0 }
        buyMap[it.name].weight += it.weight
        buyMap[it.name].value  += it.weight * it.price
      })
    )
    const top5buy = Object.values(buyMap).sort((a,b) => b.value - a.value).slice(0, 5)

    // Sale top 5 by total value
    const sellMap: Record<string, { name: string; weight: number; value: number }> = {}
    txs.filter(t => t.type === 'sale').forEach(t =>
      t.items.forEach(it => {
        if (!sellMap[it.name]) sellMap[it.name] = { name: it.name, weight: 0, value: 0 }
        sellMap[it.name].weight += it.weight
        sellMap[it.name].value  += it.weight * it.price
      })
    )
    const top5sell = Object.values(sellMap).sort((a,b) => b.value - a.value).slice(0, 5)
    return { top5buy, top5sell }
  }

  const { top5buy, top5sell } = getTop5(selectedYM)
  const reportLabel = selectedYM === 'all' ? 'ทุกเดือน' : monthLabel(selectedYM)

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex gap-2">
        {([['overview','📊 ภาพรวม'],['report','📋 รายงานรายเดือน']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Month filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500">ดูข้อมูล:</span>
        <button onClick={() => setSelectedYM('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors
            ${selectedYM === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
          ทุกเดือน
        </button>
        {months.map(ym => (
          <button key={ym} onClick={() => setSelectedYM(ym)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors
              ${selectedYM === ym ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            {monthLabel(ym)}
          </button>
        ))}
      </div>

      {transactions.length === 0 && dailyRecords.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">ยังไม่มีข้อมูล — เริ่มบันทึกซื้อ/ขาย และ P&L รายวัน</p>
        </div>
      )}

      {/* ── TAB: ภาพรวม ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-xs text-slate-400 mb-1">ยอดขาย</p>
              <p className="text-2xl font-semibold font-mono">฿{N(agg.sales)}</p>
              <p className="text-xs text-slate-400 mt-1">100%</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-400 mb-1">ยอดซื้อสินค้า</p>
              <p className="text-2xl font-semibold text-slate-700 font-mono">฿{N(agg.purchases)}</p>
              <p className="text-xs text-slate-400 mt-1">{pct(agg.purchases, agg.sales)} ของยอดขาย</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-400 mb-1">ค่าใช้จ่ายรวม</p>
              <p className="text-2xl font-semibold text-orange-500 font-mono">฿{N(agg.exp)}</p>
              <p className="text-xs text-slate-400 mt-1">{pct(agg.exp, agg.sales)} ของยอดขาย</p>
            </div>
            <div className="card p-4 border-2 border-brand-200 bg-brand-50">
              <p className="text-xs text-brand-600 mb-1 font-medium">P&L กำไรสุทธิ</p>
              <p className={`text-2xl font-semibold font-mono ${agg.profit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                ฿{N(agg.profit)}
              </p>
              <p className="text-xs text-brand-500 mt-1 font-medium">{profitMargin}% ของยอดขาย</p>
            </div>
          </div>

          {/* Monthly P&L table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">P&L รายเดือน</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2 text-left">เดือน</th>
                    <th className="px-4 py-2 text-right">ยอดขาย</th>
                    <th className="px-4 py-2 text-right">ยอดซื้อ</th>
                    <th className="px-4 py-2 text-right">ค่าใช้จ่าย</th>
                    <th className="px-4 py-2 text-right">กำไร</th>
                    <th className="px-4 py-2 text-right">margin</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">ยังไม่มีข้อมูล</td></tr>
                  ) : monthlyRows.map(r => (
                    <tr key={r.ym}
                      onClick={() => setSelectedYM(selectedYM === r.ym ? 'all' : r.ym)}
                      className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer text-sm
                        ${selectedYM === r.ym ? 'bg-brand-50' : ''}`}>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{monthLabel(r.ym)}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{N(r.sales)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">{N(r.purchases)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-orange-600">{N(r.exp)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-semibold ${r.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {r.profit >= 0 ? '+' : ''}{N(r.profit)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${r.sales > 0 && (r.profit/r.sales)*100 >= 15 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.sales > 0 ? ((r.profit/r.sales)*100).toFixed(1) + '%' : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* P&L Breakdown */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">รายละเอียดค่าใช้จ่าย</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2 text-left">รายการ</th>
                    <th className="px-4 py-2 text-right">จำนวนเงิน</th>
                    <th className="px-4 py-2 text-right">% ของยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'ยอดขาย',       value: agg.sales,     cls: 'bg-slate-50 font-medium' },
                    { label: 'ยอดซื้อสินค้า', value: agg.purchases, cls: '' },
                    { label: 'ค่าแรง',        value: agg.labor,     cls: '' },
                    { label: 'ค่าน้ำมัน',     value: agg.fuel,      cls: '' },
                    { label: 'สาธารณูปโภค',   value: agg.utility,   cls: '' },
                    { label: 'ค่าเช่า',       value: agg.rent,      cls: '' },
                    { label: 'เบ็ดเตล็ด',     value: agg.misc,      cls: '' },
                    { label: 'คชจ.อื่นๆ',     value: agg.other,     cls: '' },
                    { label: 'งวดรถ',         value: agg.vehicle,   cls: '' },
                  ].map(row => (
                    <tr key={row.label} className={`border-b border-slate-50 hover:bg-slate-50 ${row.cls}`}>
                      <td className="px-4 py-2.5 text-slate-700">{row.label}</td>
                      <td className="px-4 py-2.5 text-right font-mono">฿{N(row.value)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{pct(row.value, agg.sales)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-orange-50">
                    <td className="px-4 py-2.5 font-medium text-orange-700">ค่าใช้จ่ายรวม</td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-orange-700">฿{N(agg.exp)}</td>
                    <td className="px-4 py-2.5 text-right text-orange-600">{pct(agg.exp, agg.sales)}</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="px-4 py-3 font-bold text-slate-800">P&L กำไรสุทธิ</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold text-xl ${agg.profit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                      ฿{N(agg.profit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-sm font-semibold
                        ${Number(profitMargin) >= 15 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {profitMargin}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: รายงานรายเดือน ── */}
      {tab === 'report' && (
        <div className="space-y-5">

          {/* Hero KPIs */}
          <div className="card p-5 bg-gradient-to-br from-brand-50 to-white border border-brand-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">📋 รายงานสรุป — {reportLabel}</h3>
                <p className="text-xs text-slate-400 mt-0.5">อ่านเข้าใจภาพรวมในไม่กี่นาที</p>
              </div>
              <span className={`text-lg font-bold px-3 py-1 rounded-full
                ${agg.profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {agg.profit >= 0 ? '✅ กำไร' : '⚠️ ขาดทุน'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '💰', label: 'รายรับ',       val: `฿${N(agg.sales)}`,     sub: '100%' },
                { icon: '🛒', label: 'ต้นทุนสินค้า', val: `฿${N(agg.purchases)}`, sub: pct(agg.purchases, agg.sales) },
                { icon: '📉', label: 'ค่าใช้จ่าย',   val: `฿${N(agg.exp)}`,       sub: pct(agg.exp, agg.sales) },
                { icon: '📈', label: 'กำไรสุทธิ',    val: `฿${N(agg.profit)}`,    sub: profitMargin + '%' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                  <p className="text-2xl mb-1">{c.icon}</p>
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className="text-base font-bold font-mono text-slate-800 mt-0.5">{c.val}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 ขาย */}
          <div className="card overflow-hidden max-w-xl">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h3 className="text-sm font-semibold text-slate-700">Hero Products — ขายออก (Top 5)</h3>
              </div>
              {top5sell.length === 0 ? (
                <p className="px-5 py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูล</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {top5sell.map((p, i) => {
                    const maxVal = top5sell[0].value
                    return (
                      <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                        <span className={`text-sm font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                          <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(p.value / maxVal) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-medium text-slate-800">฿{N(p.value)}</p>
                          <p className="text-xs text-slate-400">{p.weight.toFixed(1)} น.</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  )
}
