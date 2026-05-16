import { useState } from 'react'

const MONTHS = [
  {
    label: 'ม.ค. 2569', key: '01',
    sales: 909717, purchases: 683566,
    labor: 43565, fuel: 10800, utility: 2200, rent: 20000,
    misc: 4728, other: 4196, vehicle: 34539,
  },
  {
    label: 'ก.พ. 2569', key: '02',
    sales: 1053819, purchases: 816749,
    labor: 0, fuel: 0, utility: 0, rent: 0,
    misc: 0, other: 0, vehicle: 34539,
  },
  {
    label: 'มี.ค. 2569', key: '03',
    sales: 941166, purchases: 749835,
    labor: 0, fuel: 0, utility: 0, rent: 0,
    misc: 0, other: 0, vehicle: 1080,
  },
  {
    label: 'เม.ย. 2569', key: '04',
    sales: 174846, purchases: 152355,
    labor: 0, fuel: 0, utility: 0, rent: 0,
    misc: 0, other: 0, vehicle: 280,
  },
]

const fmt  = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)
const pct  = (n: number, base: number) => base > 0 ? ((n / base) * 100).toFixed(2) + '%' : '—'

export default function DashboardPage() {
  const [selectedKey, setSelectedKey] = useState<string | 'all'>('all')

  const filtered = selectedKey === 'all' ? MONTHS : MONTHS.filter(m => m.key === selectedKey)

  const agg = filtered.reduce((acc, m) => ({
    sales:     acc.sales     + m.sales,
    purchases: acc.purchases + m.purchases,
    labor:     acc.labor     + m.labor,
    fuel:      acc.fuel      + m.fuel,
    utility:   acc.utility   + m.utility,
    rent:      acc.rent      + m.rent,
    misc:      acc.misc      + m.misc,
    other:     acc.other     + m.other,
    vehicle:   acc.vehicle   + m.vehicle,
  }), { sales: 0, purchases: 0, labor: 0, fuel: 0, utility: 0, rent: 0, misc: 0, other: 0, vehicle: 0 })

  const totalExpenses = agg.labor + agg.fuel + agg.utility + agg.rent + agg.misc + agg.other + agg.vehicle
  const profit        = agg.sales - agg.purchases - totalExpenses
  const profitMargin  = agg.sales > 0 ? ((profit / agg.sales) * 100).toFixed(2) : '0'

  return (
    <div className="space-y-6">

      {/* Filter เดือน */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500">ดูข้อมูล:</span>
        <button onClick={() => setSelectedKey('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors
            ${selectedKey === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
          ทุกเดือน
        </button>
        {MONTHS.map(m => (
          <button key={m.key} onClick={() => setSelectedKey(m.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors
              ${selectedKey === m.key ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดขาย</p>
          <p className="text-2xl font-semibold">฿{fmt(agg.sales)}</p>
          <p className="text-xs text-slate-400 mt-1">100%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดซื้อสินค้า</p>
          <p className="text-2xl font-semibold text-slate-700">฿{fmt(agg.purchases)}</p>
          <p className="text-xs text-slate-400 mt-1">{pct(agg.purchases, agg.sales)} ของยอดขาย</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ค่าใช้จ่ายรวม</p>
          <p className="text-2xl font-semibold text-orange-500">฿{fmt(totalExpenses)}</p>
          <p className="text-xs text-slate-400 mt-1">{pct(totalExpenses, agg.sales)} ของยอดขาย</p>
        </div>
        <div className="card p-4 border-2 border-brand-200 bg-brand-50">
          <p className="text-xs text-brand-600 mb-1 font-medium">P&L กำไรสุทธิ</p>
          <p className={`text-2xl font-semibold ${profit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            ฿{fmt(profit)}
          </p>
          <p className="text-xs text-brand-500 mt-1 font-medium">{profitMargin}% ของยอดขาย</p>
        </div>
      </div>

      {/* P&L Breakdown — ตรงกับ Excel */}
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
                { label: 'ยอดขาย',          value: agg.sales,      highlight: true  },
                { label: 'ยอดซื้อสินค้า',    value: agg.purchases,  highlight: false },
                { label: 'ค่าแรง',           value: agg.labor,      highlight: false },
                { label: 'ค่าน้ำมัน',        value: agg.fuel,       highlight: false },
                { label: 'สาธารณูปโภค',      value: agg.utility,    highlight: false },
                { label: 'ค่าเช่า',          value: agg.rent,       highlight: false },
                { label: 'เบ็ดเตล็ด',        value: agg.misc,       highlight: false },
                { label: 'คชจ.อื่นๆ',        value: agg.other,      highlight: false },
                { label: 'งวดรถ',            value: agg.vehicle,    highlight: false },
              ].map(row => (
                <tr key={row.label}
                  className={`border-b border-slate-50 ${row.highlight ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-2.5 text-slate-700">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono">฿{fmt(row.value)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{pct(row.value, agg.sales)}</td>
                </tr>
              ))}

              {/* รวมค่าใช้จ่าย */}
              <tr className="border-b border-slate-200 bg-orange-50">
                <td className="px-4 py-2.5 font-medium text-orange-700">ค่าใช้จ่ายรวม</td>
                <td className="px-4 py-2.5 text-right font-mono font-medium text-orange-700">฿{fmt(totalExpenses)}</td>
                <td className="px-4 py-2.5 text-right text-orange-600">{pct(totalExpenses, agg.sales)}</td>
              </tr>

              {/* P&L */}
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

      {/* ราคาอ้างอิง */}
      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">ราคาอ้างอิง ฿/น. (จากข้อมูลจริง)</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'ทองแดงปอกสวย #1', price: 386 },
            { name: 'ทองแดงช็อต #2',   price: 376 },
            { name: 'ทองเหลือง',        price: 200 },
            { name: 'มีเนียมสายไฟ',     price: 80  },
            { name: 'มีเนียมกระป๋อง',   price: 71  },
            { name: 'เหล็กหนา',         price: 25  },
            { name: 'แบตทรู',           price: 23  },
            { name: 'พลาสติกใส',        price: 8   },
          ].map(item => (
            <div key={item.name} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-slate-50">
              <span className="text-sm text-slate-600">{item.name}</span>
              <span className="text-sm font-mono font-medium text-slate-800">฿{item.price}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
