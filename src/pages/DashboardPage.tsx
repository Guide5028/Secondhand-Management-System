import { useState } from 'react'
import { loadTransactions } from '../data/transactions'
import { loadProducts } from '../data/products'

interface DailyRecord {
  date: string
  sale: number; purchase: number
  labor: number; fuel: number; utility: number
  rent: number; misc: number; other: number; vehicle: number
}

function loadDailyRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem('kankrong_daily')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

const fmt = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)
const pct = (n: number, base: number) => base > 0 ? ((n / base) * 100).toFixed(1) + '%' : '—'

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y + 543}`
}

export default function DashboardPage() {
  const [selectedKey, setSelectedKey] = useState<string>('all')

  const transactions  = loadTransactions()
  const dailyRecords  = loadDailyRecords()
  const products      = loadProducts()

  // Collect all months that have any data + current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthSet = new Set<string>([
    currentMonth,
    ...transactions.map(t => t.date.slice(0, 7)),
    ...dailyRecords.map(d => d.date.slice(0, 7)),
  ])
  const months = [...monthSet].sort().reverse()

  const filterTx    = selectedKey === 'all' ? transactions : transactions.filter(t => t.date.startsWith(selectedKey))
  const filterDaily = selectedKey === 'all' ? dailyRecords : dailyRecords.filter(d => d.date.startsWith(selectedKey))

  const agg = {
    sales:     filterTx.filter(t => t.type === 'sale').reduce((s, t) => s + t.total, 0),
    purchases: filterTx.filter(t => t.type === 'purchase').reduce((s, t) => s + t.total, 0),
    labor:     filterDaily.reduce((s, d) => s + d.labor, 0),
    fuel:      filterDaily.reduce((s, d) => s + d.fuel, 0),
    utility:   filterDaily.reduce((s, d) => s + d.utility, 0),
    rent:      filterDaily.reduce((s, d) => s + d.rent, 0),
    misc:      filterDaily.reduce((s, d) => s + d.misc, 0),
    other:     filterDaily.reduce((s, d) => s + d.other, 0),
    vehicle:   filterDaily.reduce((s, d) => s + d.vehicle, 0),
  }

  const totalExpenses = agg.labor + agg.fuel + agg.utility + agg.rent + agg.misc + agg.other + agg.vehicle
  const profit        = agg.sales - agg.purchases - totalExpenses
  const profitMargin  = agg.sales > 0 ? ((profit / agg.sales) * 100).toFixed(1) : '0'

  const hasData = transactions.length > 0 || dailyRecords.length > 0

  return (
    <div className="space-y-6">

      {/* Month filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500">ดูข้อมูล:</span>
        <button onClick={() => setSelectedKey('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors
            ${selectedKey === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
          ทุกเดือน
        </button>
        {months.map(ym => (
          <button key={ym} onClick={() => setSelectedKey(ym)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors
              ${selectedKey === ym ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            {monthLabel(ym)}
          </button>
        ))}
      </div>

      {!hasData && (
        <div className="card p-8 text-center text-slate-400">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">ยังไม่มีข้อมูล — เริ่มบันทึกซื้อ/ขาย และ P&L รายวัน เพื่อดูภาพรวม</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดขาย</p>
          <p className="text-2xl font-semibold font-mono">฿{fmt(agg.sales)}</p>
          <p className="text-xs text-slate-400 mt-1">100%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดซื้อสินค้า</p>
          <p className="text-2xl font-semibold text-slate-700 font-mono">฿{fmt(agg.purchases)}</p>
          <p className="text-xs text-slate-400 mt-1">{pct(agg.purchases, agg.sales)} ของยอดขาย</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ค่าใช้จ่ายรวม</p>
          <p className="text-2xl font-semibold text-orange-500 font-mono">฿{fmt(totalExpenses)}</p>
          <p className="text-xs text-slate-400 mt-1">{pct(totalExpenses, agg.sales)} ของยอดขาย</p>
        </div>
        <div className="card p-4 border-2 border-brand-200 bg-brand-50">
          <p className="text-xs text-brand-600 mb-1 font-medium">P&L กำไรสุทธิ</p>
          <p className={`text-2xl font-semibold font-mono ${profit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            ฿{fmt(profit)}
          </p>
          <p className="text-xs text-brand-500 mt-1 font-medium">{profitMargin}% ของยอดขาย</p>
        </div>
      </div>

      {/* P&L Breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">รายละเอียด P&L</h2>
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
                { label: 'ยอดขาย',       value: agg.sales,     highlight: true  },
                { label: 'ยอดซื้อสินค้า', value: agg.purchases, highlight: false },
                { label: 'ค่าแรง',        value: agg.labor,     highlight: false },
                { label: 'ค่าน้ำมัน',     value: agg.fuel,      highlight: false },
                { label: 'สาธารณูปโภค',   value: agg.utility,   highlight: false },
                { label: 'ค่าเช่า',       value: agg.rent,      highlight: false },
                { label: 'เบ็ดเตล็ด',     value: agg.misc,      highlight: false },
                { label: 'คชจ.อื่นๆ',     value: agg.other,     highlight: false },
                { label: 'งวดรถ',         value: agg.vehicle,   highlight: false },
              ].map(row => (
                <tr key={row.label}
                  className={`border-b border-slate-50 ${row.highlight ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-2.5 text-slate-700">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono">฿{fmt(row.value)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{pct(row.value, agg.sales)}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-200 bg-orange-50">
                <td className="px-4 py-2.5 font-medium text-orange-700">ค่าใช้จ่ายรวม</td>
                <td className="px-4 py-2.5 text-right font-mono font-medium text-orange-700">฿{fmt(totalExpenses)}</td>
                <td className="px-4 py-2.5 text-right text-orange-600">{pct(totalExpenses, agg.sales)}</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="px-4 py-3 font-bold text-slate-800">P&L กำไรสุทธิ</td>
                <td className={`px-4 py-3 text-right font-mono font-bold text-xl ${profit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                  ฿{fmt(profit)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  <span className={`px-2 py-0.5 rounded-full text-sm
                    ${Number(profitMargin) >= 15 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {profitMargin}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ราคาอ้างอิง จาก products จริง */}
      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">ราคาอ้างอิง ฿/น. (จัดการสินค้า)</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {products.slice(0, 8).map(p => (
            <div key={p.code} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-slate-50">
              <span className="text-sm text-slate-600">{p.name}</span>
              <span className="text-sm font-mono font-medium text-slate-800">฿{p.refPrice}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
