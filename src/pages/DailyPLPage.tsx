import { useState } from 'react'
import { loadTransactions } from '../data/transactions'

const STORAGE_KEY = 'kankrong_daily'

interface DailyRecord {
  date:     string
  sale:     number
  purchase: number
  labor:    number  // ค่าแรง
  fuel:     number  // ค่าน้ำมัน
  utility:  number  // สาธารณูปโภค
  rent:     number  // ค่าเช่า
  misc:     number  // เบ็ดเตล็ด
  other:    number  // คชจ.อื่นๆ
  vehicle:  number  // งวดรถ
  note:     string
}

const BLANK: Omit<DailyRecord, 'date'> = {
  sale: 0, purchase: 0, labor: 0, fuel: 0,
  utility: 0, rent: 0, misc: 0, other: 0, vehicle: 0, note: '',
}

const FIXED_COSTS = [
  { label: 'งวดรถโฟลค์ลิฟ',     amount: 10109 },
  { label: 'งวดรถหกล้อ ISUZU',   amount: 13000 },
  { label: 'งวดรถกระบะ REVO',    amount: 11430 },
  { label: 'ค่าเช่า',            amount: 20000 },
  { label: 'ค่าตู้แดง สภ.',      amount: 500   },
  { label: 'Internet (AIS)',      amount: 632   },
  { label: 'ค่าขยะ อบต.',        amount: 500   },
]

function loadRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveRecords(records: DailyRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function totalExp(r: DailyRecord) {
  return r.labor + r.fuel + r.utility + r.rent + r.misc + r.other + r.vehicle
}

function profit(r: DailyRecord) {
  return r.sale - r.purchase - totalExp(r)
}

const fmt = (n: number) =>
  n === 0 ? '—' : new Intl.NumberFormat('th-TH').format(Math.round(n))

const thDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

export default function DailyPLPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [year,  setYear]  = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [records, setRecords] = useState<DailyRecord[]>(loadRecords)
  const [draft, setDraft] = useState<DailyRecord | null>(null)

  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const monthRecords = records
    .filter(r => r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date))

  const openAdd = () => {
    const txs      = loadTransactions().filter(t => t.date === today)
    const sale     = txs.filter(t => t.type === 'sale').reduce((s, t) => s + t.total, 0)
    const purchase = txs.filter(t => t.type === 'purchase').reduce((s, t) => s + t.total, 0)
    setDraft({ date: today, ...BLANK, sale, purchase })
  }
  const openEdit = (r: DailyRecord) => setDraft({ ...r })
  const closeModal = () => setDraft(null)

  const saveModal = () => {
    if (!draft) return
    const next = [...records.filter(r => r.date !== draft.date), draft]
      .sort((a, b) => a.date.localeCompare(b.date))
    setRecords(next)
    saveRecords(next)
    closeModal()
  }

  const deleteRecord = (date: string) => {
    if (!confirm('ลบรายการวันนี้?')) return
    const next = records.filter(r => r.date !== date)
    setRecords(next)
    saveRecords(next)
  }

  const setField = (field: keyof DailyRecord, val: string | number) =>
    setDraft(prev => prev ? { ...prev, [field]: val } : prev)

  const totSale     = monthRecords.reduce((s, r) => s + r.sale, 0)
  const totPurchase = monthRecords.reduce((s, r) => s + r.purchase, 0)
  const totExp      = monthRecords.reduce((s, r) => s + totalExp(r), 0)
  const totProfit   = totSale - totPurchase - totExp

  const fixedTotal  = FIXED_COSTS.reduce((s, f) => s + f.amount, 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">P&L รายวัน</h2>
          <p className="text-sm text-slate-400 mt-0.5">บันทึกรายได้และค่าใช้จ่ายประจำวัน</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          + เพิ่มรายวัน
        </button>
      </div>

      {/* Month selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <select className="input max-w-[120px] text-sm" value={month}
          onChange={e => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className="input max-w-[100px] text-sm" value={year}
          onChange={e => setYear(Number(e.target.value))}>
          {[2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y + 543}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">{monthRecords.length} วัน</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'ยอดขายรวม',    val: totSale,     color: 'text-slate-800' },
          { label: 'ยอดซื้อรวม',   val: totPurchase, color: 'text-slate-800' },
          { label: 'ค่าใช้จ่ายรวม', val: totExp,      color: 'text-slate-800' },
          { label: 'กำไร/ขาดทุน',  val: totProfit,   color: totProfit >= 0 ? 'text-green-600' : 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className={`text-xl font-semibold font-mono ${c.color}`}>
              {c.val >= 0 && c.label === 'กำไร/ขาดทุน' ? '+' : ''}฿{new Intl.NumberFormat('th-TH').format(c.val)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Main table */}
        <div className="flex-1 card overflow-x-auto min-w-0">
          {monthRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <p className="text-3xl mb-2">📋</p>
              <p>ยังไม่มีข้อมูล — กด "เพิ่มรายวัน" เพื่อเริ่มบันทึก</p>
            </div>
          ) : (
            <table className="w-full text-sm" style={{ minWidth: '820px' }}>
              <thead>
                <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-left w-20">วันที่</th>
                  <th className="px-3 py-2 text-right">ยอดขาย</th>
                  <th className="px-3 py-2 text-right">ยอดซื้อ</th>
                  <th className="px-3 py-2 text-right">ค่าแรง</th>
                  <th className="px-3 py-2 text-right">น้ำมัน</th>
                  <th className="px-3 py-2 text-right">สาธา.</th>
                  <th className="px-3 py-2 text-right">ค่าเช่า</th>
                  <th className="px-3 py-2 text-right">เบ็ดฯ</th>
                  <th className="px-3 py-2 text-right">คชจ.อื่น</th>
                  <th className="px-3 py-2 text-right">งวดรถ</th>
                  <th className="px-3 py-2 text-right">กำไร</th>
                  <th className="px-3 py-2 w-14"></th>
                </tr>
              </thead>
              <tbody>
                {monthRecords.map(r => {
                  const pl = profit(r)
                  return (
                    <tr key={r.date} className="border-b border-slate-50 hover:bg-slate-50 text-xs">
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {thDate(r.date)}
                        {r.note && <span className="ml-1 text-slate-400">({r.note})</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(r.sale)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(r.purchase)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.labor)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.fuel)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.utility)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.rent)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.misc)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.other)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(r.vehicle)}</td>
                      <td className={`px-3 py-2 text-right font-mono font-semibold ${pl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {pl >= 0 ? '+' : ''}{fmt(pl)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => openEdit(r)}
                            className="text-slate-400 hover:text-brand-600 transition-colors">✏️</button>
                          <button onClick={() => deleteRecord(r.date)}
                            className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold text-xs border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-600">รวม</td>
                  <td className="px-3 py-2 text-right font-mono">{new Intl.NumberFormat('th-TH').format(totSale)}</td>
                  <td className="px-3 py-2 text-right font-mono">{new Intl.NumberFormat('th-TH').format(totPurchase)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.labor,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.fuel,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.utility,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.rent,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.misc,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.other,0))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {new Intl.NumberFormat('th-TH').format(monthRecords.reduce((s,r)=>s+r.vehicle,0))}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${totProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {totProfit >= 0 ? '+' : ''}{new Intl.NumberFormat('th-TH').format(totProfit)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Fixed costs sidebar */}
        <div className="w-full lg:w-60 shrink-0">
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">ค่าใช้จ่ายประจำ/เดือน</p>
            <div className="space-y-2">
              {FIXED_COSTS.map(f => (
                <div key={f.label} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="font-mono font-medium text-slate-700">
                    {new Intl.NumberFormat('th-TH').format(f.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700">รวม</span>
                <span className="font-mono text-brand-700">
                  {new Intl.NumberFormat('th-TH').format(fixedTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {draft && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">บันทึกรายวัน</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">วันที่</label>
                <input type="date" className="input text-sm"
                  value={draft.date}
                  onChange={e => setField('date', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['sale',     'ยอดขาย (฿) — ดึงจากรายการขาย'],
                  ['purchase', 'ยอดซื้อ (฿) — ดึงจากรายการซื้อ'],
                  ['labor',    'ค่าแรง (฿)'],
                  ['fuel',     'ค่าน้ำมัน (฿)'],
                  ['utility',  'สาธารณูปโภค (฿)'],
                  ['rent',     'ค่าเช่า (฿)'],
                  ['misc',     'เบ็ดเตล็ด (฿)'],
                  ['other',    'คชจ.อื่นๆ (฿)'],
                  ['vehicle',  'งวดรถ (฿)'],
                ] as [keyof DailyRecord, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                    <input type="number" min="0" step="1" className="input text-sm font-mono"
                      value={(draft[field] as number) || ''}
                      placeholder="0"
                      onChange={e => setField(field, parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">หมายเหตุ</label>
                <input type="text" className="input text-sm"
                  value={draft.note}
                  placeholder="เช่น หยุด, ลูกค้าพิเศษ..."
                  onChange={e => setField('note', e.target.value)} />
              </div>

              {/* preview */}
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">ค่าใช้จ่ายรวม</span>
                  <span className="font-mono font-medium">฿{new Intl.NumberFormat('th-TH').format(totalExp(draft))}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>กำไร/ขาดทุน</span>
                  <span className={`font-mono ${profit(draft) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {profit(draft) >= 0 ? '+' : ''}฿{new Intl.NumberFormat('th-TH').format(profit(draft))}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeModal} className="btn-secondary text-sm">ยกเลิก</button>
              <button onClick={saveModal} className="btn-primary text-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
