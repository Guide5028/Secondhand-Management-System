import { useState } from 'react'

interface TxItem {
  name:   string
  weight: number
  price:  number
}

interface PurchaseTx {
  receiptNo: string
  time:      string
  seller:    string
  items:     TxItem[]
}

interface SaleTx {
  saleNo: string
  time:   string
  buyer:  string
  items:  TxItem[]
}

interface Expense {
  label:  string
  amount: number
}

interface DayData {
  purchases: PurchaseTx[]
  sales:     SaleTx[]
  expenses:  Expense[]
}

const MOCK: Record<string, DayData> = {
  '2026-05-16': {
    purchases: [
      {
        receiptNo: 'REC-1747356001',
        time: '08:42',
        seller: 'นายสมชาย ใจดี',
        items: [
          { name: 'ทองแดงปอกสวย1', weight: 5.2,  price: 386 },
          { name: 'ทองเหลือง',      weight: 12.5, price: 200 },
        ],
      },
      {
        receiptNo: 'REC-1747356002',
        time: '10:15',
        seller: 'นางสาวมาลี วงศ์ดี',
        items: [
          { name: 'เหล็กหนา',      weight: 85.0, price: 25 },
          { name: 'มีเนียมสายไฟ', weight: 15.0, price: 80 },
        ],
      },
      {
        receiptNo: 'REC-1747356003',
        time: '11:50',
        seller: 'นายวิชัย สุขสมบูรณ์',
        items: [
          { name: 'พลาสติกใส', weight: 45.0,  price: 8 },
          { name: 'กระดาษลัง', weight: 120.0, price: 3 },
        ],
      },
      {
        receiptNo: 'REC-1747356004',
        time: '14:30',
        seller: 'นายประสิทธิ์ มั่งมี',
        items: [
          { name: 'มีเนียมกระป๋อง', weight: 32.5, price: 71 },
          { name: 'แบตเล็ก',        weight: 18.0, price: 26 },
        ],
      },
    ],
    sales: [
      {
        saleNo: 'SAL-1747390001',
        time:   '15:30',
        buyer:  'บริษัท โลหะรีไซเคิล จำกัด',
        items: [
          { name: 'ทองแดง (รวม)',  weight: 25.0,  price: 420 },
          { name: 'มีเนียม (รวม)', weight: 180.0, price: 72  },
        ],
      },
    ],
    expenses: [
      { label: 'น้ำมันรถ', amount: 300 },
    ],
  },
  '2026-05-15': {
    purchases: [
      {
        receiptNo: 'REC-1747269001',
        time: '09:10',
        seller: 'นายสุรชัย ทองดี',
        items: [
          { name: 'เหล็กหนา',  weight: 210.0, price: 25 },
          { name: 'เหล็กบาง',  weight: 95.0,  price: 6  },
          { name: 'สังกะสี',   weight: 40.0,  price: 5  },
        ],
      },
      {
        receiptNo: 'REC-1747269002',
        time: '13:00',
        seller: 'นางจันทร์ แก้วมณี',
        items: [
          { name: 'ทองแดงช็อต2', weight: 8.5, price: 376 },
          { name: 'ตะกั่ว',      weight: 22.0, price: 35  },
        ],
      },
    ],
    sales: [
      {
        saleNo: 'SAL-1747303001',
        time:   '16:00',
        buyer:  'ร้านเหล็กชัยภูมิ',
        items: [
          { name: 'เหล็กหนา (รวม)', weight: 450.0, price: 27 },
          { name: 'เหล็กบาง (รวม)', weight: 280.0, price: 7  },
        ],
      },
    ],
    expenses: [
      { label: 'ค่าแรงคนงาน', amount: 600 },
      { label: 'น้ำมันรถ',   amount: 200 },
    ],
  },
  '2026-05-14': {
    purchases: [
      {
        receiptNo: 'REC-1747182001',
        time: '08:20',
        seller: 'นายบุญมา ศรีวิลัย',
        items: [
          { name: 'กระดาษลัง',   weight: 280.0, price: 3 },
          { name: 'กระดาษเศษ',   weight: 155.0, price: 2 },
          { name: 'พลาสติกสี',   weight: 95.0,  price: 4 },
        ],
      },
      {
        receiptNo: 'REC-1747182002',
        time: '10:45',
        seller: 'นางสาวพิมพ์ใจ รักดี',
        items: [
          { name: 'แบตใหญ่', weight: 35.0, price: 27 },
          { name: 'แบตทรู',  weight: 12.0, price: 23 },
        ],
      },
      {
        receiptNo: 'REC-1747182003',
        time: '15:20',
        seller: 'นายสำราญ ปราโมทย์',
        items: [
          { name: 'มีเนียมบาง', weight: 55.0, price: 64 },
          { name: 'มู่ลี่',     weight: 28.0, price: 30 },
        ],
      },
    ],
    sales: [],
    expenses: [
      { label: 'ค่าไฟฟ้า', amount: 1080 },
    ],
  },
}

function txTotal(items: TxItem[]) {
  return items.reduce((s, i) => s + i.weight * i.price, 0)
}

export default function DailyPLPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const fmt = (n: number) =>
    new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)

  const data = MOCK[date]

  const totalPurchases = data
    ? data.purchases.reduce((s, tx) => s + txTotal(tx.items), 0)
    : 0
  const totalSales = data
    ? data.sales.reduce((s, tx) => s + txTotal(tx.items), 0)
    : 0
  const totalExpenses = data
    ? data.expenses.reduce((s, e) => s + e.amount, 0)
    : 0
  const grossProfit = totalSales - totalPurchases
  const netProfit   = grossProfit - totalExpenses

  const thDate = new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const prevDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().slice(0, 10))
  }
  const nextDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d.toISOString().slice(0, 10))
  }

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header + date nav */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">P&L รายวัน</h2>
          <p className="text-sm text-slate-400 mt-0.5">{thDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevDay} className="btn-secondary px-3 py-1.5 text-sm">← ก่อนหน้า</button>
          <input
            type="date"
            className="input text-sm w-auto"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button onClick={nextDay} className="btn-secondary px-3 py-1.5 text-sm">ถัดไป →</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ซื้อเข้า</p>
          <p className="text-2xl font-semibold text-slate-700 font-mono">฿{fmt(totalPurchases)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {data ? data.purchases.length : 0} ใบรับ
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ขายออก</p>
          <p className="text-2xl font-semibold text-blue-600 font-mono">฿{fmt(totalSales)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {data ? data.sales.length : 0} รายการขาย
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">กำไรขั้นต้น</p>
          <p className={`text-2xl font-semibold font-mono ${grossProfit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            ฿{fmt(grossProfit)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalSales > 0 ? `margin ${((grossProfit / totalSales) * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ค่าใช้จ่าย</p>
          <p className="text-2xl font-semibold text-slate-700 font-mono">฿{fmt(totalExpenses)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {data ? data.expenses.map(e => e.label).join(', ') || '—' : '—'}
          </p>
        </div>
      </div>

      {!data ? (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm">ไม่มีข้อมูลสำหรับวันที่นี้</p>
        </div>
      ) : (
        <>
          {/* Purchases + Sales panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ซื้อเข้า */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">ซื้อเข้า</h3>
                <span className="text-xs text-slate-400">{data.purchases.length} รายการ</span>
              </div>
              {data.purchases.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">ไม่มีรายการซื้อ</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.purchases.map(tx => {
                    const total = txTotal(tx.items)
                    return (
                      <div key={tx.receiptNo} className="px-5 py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{tx.seller}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {tx.time} · {tx.receiptNo}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold text-slate-700">
                            ฿{fmt(total)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          {tx.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500">
                              <span>{it.name}</span>
                              <span className="font-mono">
                                {it.weight.toLocaleString('th-TH', { maximumFractionDigits: 1 })} น. × ฿{it.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between text-sm">
                <span className="text-slate-500">รวมซื้อเข้า</span>
                <span className="font-mono font-semibold text-slate-700">฿{fmt(totalPurchases)}</span>
              </div>
            </div>

            {/* ขายออก */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">ขายออก</h3>
                <span className="text-xs text-slate-400">{data.sales.length} รายการ</span>
              </div>
              {data.sales.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">ไม่มีรายการขาย</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.sales.map(tx => {
                    const total = txTotal(tx.items)
                    return (
                      <div key={tx.saleNo} className="px-5 py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{tx.buyer}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {tx.time} · {tx.saleNo}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            ฿{fmt(total)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          {tx.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500">
                              <span>{it.name}</span>
                              <span className="font-mono">
                                {it.weight.toLocaleString('th-TH', { maximumFractionDigits: 1 })} น. × ฿{it.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between text-sm">
                <span className="text-slate-500">รวมขายออก</span>
                <span className="font-mono font-semibold text-blue-600">฿{fmt(totalSales)}</span>
              </div>
            </div>

          </div>

          {/* Net P&L summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">สรุป P&L ประจำวัน</h3>
            <div className="space-y-2 text-sm max-w-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">ยอดขายออก</span>
                <span className="font-mono font-medium">฿{fmt(totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ยอดซื้อเข้า</span>
                <span className="font-mono text-red-500">− ฿{fmt(totalPurchases)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-600 font-medium">กำไรขั้นต้น</span>
                <span className={`font-mono font-semibold ${grossProfit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                  ฿{fmt(grossProfit)}
                </span>
              </div>
              {data.expenses.map((e, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-500">{e.label}</span>
                  <span className="font-mono text-red-400">− ฿{fmt(e.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t-2 border-slate-200 pt-2 mt-2">
                <span className="font-semibold text-slate-800">กำไรสุทธิ</span>
                <span className={`font-mono font-bold text-lg ${netProfit >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                  ฿{fmt(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
