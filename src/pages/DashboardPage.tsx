// หน้า Dashboard — แสดงภาพรวม P&L และ stock summary

export default function DashboardPage() {
  // ตัวอย่างข้อมูล (ทดแทน API ชั่วคราว จนกว่า backend พร้อม)
  const monthly = [
    { month: 'ม.ค. 2569', sales: 909717,  purchases: 683566, expenses: 119993, profit: 106158 },
    { month: 'ก.พ. 2569', sales: 1053819, purchases: 816749, expenses: 34539,  profit: 202531 },
    { month: 'มี.ค. 2569', sales: 941166,  purchases: 749835, expenses: 1080,   profit: 190251 },
    { month: 'เม.ย. 2569', sales: 174846,  purchases: 152355, expenses: 280,    profit: 22211  },
  ]

  const fmt = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'decimal', maximumFractionDigits: 0 }).format(n)

  const totalProfit = monthly.reduce((s, m) => s + m.profit, 0)
  const totalSales  = monthly.reduce((s, m) => s + m.sales, 0)
  const margin      = ((totalProfit / totalSales) * 100).toFixed(1)

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ยอดขายรวม (4 เดือน)</p>
          <p className="text-2xl font-semibold">฿{fmt(totalSales)}</p>
          <p className="text-xs text-slate-400 mt-1">ม.ค. — เม.ย. 2569</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">กำไรสุทธิรวม</p>
          <p className="text-2xl font-semibold text-brand-600">฿{fmt(totalProfit)}</p>
          <p className="text-xs text-slate-400 mt-1">margin {margin}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Fixed costs / เดือน</p>
          <p className="text-2xl font-semibold text-slate-700">฿56,171</p>
          <p className="text-xs text-slate-400 mt-1">งวดรถ + เช่า + utility</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ประเภทสินค้า</p>
          <p className="text-2xl font-semibold">78</p>
          <p className="text-xs text-slate-400 mt-1">78 ประเภท (CR1–CR78)</p>
        </div>
      </div>

      {/* Monthly P&L table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">P&L รายเดือน</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3 text-left">เดือน</th>
                <th className="px-5 py-3 text-right">ยอดขาย</th>
                <th className="px-5 py-3 text-right">ยอดซื้อ</th>
                <th className="px-5 py-3 text-right">ค่าใช้จ่าย</th>
                <th className="px-5 py-3 text-right">กำไร</th>
                <th className="px-5 py-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map(m => {
                const mg = ((m.profit / m.sales) * 100).toFixed(1)
                return (
                  <tr key={m.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{m.month}</td>
                    <td className="px-5 py-3 text-right">฿{fmt(m.sales)}</td>
                    <td className="px-5 py-3 text-right text-slate-500">฿{fmt(m.purchases)}</td>
                    <td className="px-5 py-3 text-right text-slate-500">฿{fmt(m.expenses)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-600">
                      ฿{fmt(m.profit)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${Number(mg) >= 15
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'}`}>
                        {mg}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top items by price */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">ราคาอ้างอิง ฿/kg (จากข้อมูลจริง Feb.Out)</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'ทองแดง1',   price: 386, cat: 'copper' },
            { name: 'ทองแดง2',   price: 376, cat: 'copper' },
            { name: 'ทองเหลือง', price: 200, cat: 'copper' },
            { name: 'มีเนียมสายไฟ', price: 80, cat: 'copper' },
            { name: 'มีเนียมกระป๋อง', price: 71, cat: 'copper' },
            { name: 'เหล็กหนา',  price: 25,  cat: 'steel'  },
            { name: 'แบตทรู',    price: 23,  cat: 'battery' },
            { name: 'พลาสติกใส', price: 8,   cat: 'plastic' },
          ].map(item => (
            <div key={item.name} className="flex justify-between items-center py-1.5">
              <span className={`badge-${item.cat}`}>{item.name}</span>
              <span className="text-sm font-mono font-medium">฿{item.price}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
