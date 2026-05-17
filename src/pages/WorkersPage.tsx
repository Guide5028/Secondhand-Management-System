import { useState, useMemo } from 'react'
import {
  loadWorkers, saveWorkers,
  loadAttendance, upsertAttendance,
  loadAdvances, saveAdvances,
  loadSpecialDays, saveSpecialDays,
  calcMonthlyWage, isSunday, defaultDayType,
  type Worker, type AttendanceRecord, type AdvanceRecord,
  type SpecialDay, type Shop, type DayType,
} from '../data/workers'

type Tab = 'workers' | 'attendance' | 'summary'

const SHOP_LABEL: Record<Shop, string>    = { chaisila: 'Chaisila', mvp: 'MVP' }
const SHOP_COLOR: Record<Shop, string>    = { chaisila: 'bg-brand-100 text-brand-700', mvp: 'bg-blue-100 text-blue-700' }
const DAY_LABEL: Record<DayType, string>  = { full: 'เต็มวัน', half: 'ครึ่งวัน', absent: 'หยุด', holiday: 'วันหยุด' }
const DAY_COLOR: Record<DayType, string>  = {
  full:    'bg-green-100 text-green-700',
  half:    'bg-amber-100 text-amber-700',
  absent:  'bg-slate-100 text-slate-400',
  holiday: 'bg-red-100 text-red-600',
}

const fmt = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)
const today = new Date().toISOString().slice(0, 10)
const currentYM = today.slice(0, 7)

function todayHHMM(): string {
  return new Date().toTimeString().slice(0, 5)
}

// ─── Tab 1: Workers Management ────────────────────────────────

function WorkersTab() {
  const [workers, setWorkers] = useState<Worker[]>(loadWorkers)
  const [adding,  setAdding]  = useState(false)
  const [draft,   setDraft]   = useState({ name: '', dailyWage: '', defaultShop: 'chaisila' as Shop })
  const [saved,   setSaved]   = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Worker>>({})

  const handleAdd = () => {
    if (!draft.name.trim()) return
    const w: Worker = {
      id: `W${Date.now()}`,
      name: draft.name.trim(),
      dailyWage: parseFloat(draft.dailyWage) || 0,
      defaultShop: draft.defaultShop,
      active: true,
    }
    const updated = [...workers, w]
    setWorkers(updated)
    saveWorkers(updated)
    setDraft({ name: '', dailyWage: '', defaultShop: 'chaisila' })
    setAdding(false)
    flash()
  }

  const toggleActive = (id: string) => {
    const updated = workers.map(w => w.id === id ? { ...w, active: !w.active } : w)
    setWorkers(updated)
    saveWorkers(updated)
  }

  const startEdit = (w: Worker) => {
    setEditing(w.id)
    setEditDraft({ name: w.name, dailyWage: w.dailyWage, defaultShop: w.defaultShop })
  }

  const commitEdit = () => {
    if (!editing) return
    const updated = workers.map(w =>
      w.id === editing
        ? { ...w, ...editDraft, dailyWage: Number(editDraft.dailyWage) || w.dailyWage }
        : w
    )
    setWorkers(updated)
    saveWorkers(updated)
    setEditing(null)
    flash()
  }

  const handleDelete = (id: string) => {
    if (!confirm('ต้องการลบคนงานคนนี้?')) return
    const updated = workers.filter(w => w.id !== id)
    setWorkers(updated)
    saveWorkers(updated)
  }

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">คนงานทั้งหมด {workers.length} คน · active {workers.filter(w => w.active).length} คน</p>
        <div className="flex gap-2 items-center">
          {saved && <span className="text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-lg">บันทึกแล้ว ✓</span>}
          <button onClick={() => setAdding(true)} className="btn-primary text-sm py-1.5 px-4">+ เพิ่มคนงาน</button>
        </div>
      </div>

      {workers.length === 0 && !adding && (
        <div className="card px-5 py-16 text-center">
          <p className="text-3xl mb-2">👷</p>
          <p className="text-sm text-slate-400">ยังไม่มีข้อมูลคนงาน — กด "เพิ่มคนงาน" เพื่อเริ่มต้น</p>
        </div>
      )}

      {workers.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left">ชื่อ</th>
                <th className="px-5 py-3 text-left w-28">ร้านหลัก</th>
                <th className="px-5 py-3 text-right w-36">ค่าแรง/วัน</th>
                <th className="px-5 py-3 text-center w-20">สถานะ</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {workers.map(w => {
                const isEditing = editing === w.id
                return (
                  <tr key={w.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${!w.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input className="input text-sm py-1" value={editDraft.name ?? ''} onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))} />
                      ) : (
                        <span className="font-medium text-slate-800">{w.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <select className="input text-xs py-1" value={editDraft.defaultShop ?? 'chaisila'} onChange={e => setEditDraft(p => ({ ...p, defaultShop: e.target.value as Shop }))}>
                          <option value="chaisila">Chaisila</option>
                          <option value="mvp">MVP</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SHOP_COLOR[w.defaultShop]}`}>
                          {SHOP_LABEL[w.defaultShop]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {isEditing ? (
                        <input type="number" className="input text-sm py-1 text-right font-mono w-28 ml-auto block" value={editDraft.dailyWage ?? ''} onChange={e => setEditDraft(p => ({ ...p, dailyWage: Number(e.target.value) }))} />
                      ) : (
                        <span>฿{fmt(w.dailyWage)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleActive(w.id)} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${w.active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}>
                        {w.active ? 'ทำงาน' : 'หยุดงาน'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <button onClick={commitEdit} className="text-xs bg-brand-600 text-white px-2 py-1 rounded">บันทึก</button>
                          <button onClick={() => setEditing(null)} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">ยกเลิก</button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => startEdit(w)} className="text-xs text-slate-400 hover:text-brand-500 transition-colors px-1">✎</button>
                          <button onClick={() => handleDelete(w.id)} className="text-xs text-slate-200 hover:text-red-400 transition-colors px-1">✕</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add worker modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">เพิ่มคนงานใหม่</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ชื่อ-นามสกุล <span className="text-red-400">*</span></label>
                <input autoFocus className="input" placeholder="เช่น สมชาย ใจดี" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ค่าแรงเต็มวัน (฿)</label>
                <input type="number" min="0" step="50" className="input font-mono" placeholder="เช่น 400" value={draft.dailyWage} onChange={e => setDraft(p => ({ ...p, dailyWage: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ร้านหลัก</label>
                <div className="flex gap-2">
                  {(['chaisila', 'mvp'] as Shop[]).map(s => (
                    <button key={s} onClick={() => setDraft(p => ({ ...p, defaultShop: s }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${draft.defaultShop === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'}`}>
                      {SHOP_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAdding(false); setDraft({ name: '', dailyWage: '', defaultShop: 'chaisila' }) }} className="btn-secondary text-sm py-1.5 px-4">ยกเลิก</button>
              <button onClick={handleAdd} disabled={!draft.name.trim()} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40">เพิ่ม</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Attendance ────────────────────────────────────────

function AttendanceTab() {
  const [selDate,    setSelDate]    = useState(today)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(loadAttendance)
  const [workers]                   = useState<Worker[]>(loadWorkers)
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>(loadSpecialDays)
  const [showSpecial, setShowSpecial] = useState(false)
  const [specialDraft, setSpecialDraft] = useState({ type: 'holiday' as 'holiday' | 'special', label: '' })

  const activeWorkers = workers.filter(w => w.active)
  const special       = specialDays.find(s => s.date === selDate)
  const isSun         = isSunday(selDate)

  // Get or create attendance record for a worker on selDate
  const getRecord = (workerId: string): AttendanceRecord => {
    const existing = attendance.find(r => r.workerId === workerId && r.date === selDate)
    if (existing) return existing
    const w = workers.find(w => w.id === workerId)!
    return {
      id: `ATT-${workerId}-${selDate}`,
      workerId,
      date: selDate,
      shop: w?.defaultShop ?? 'chaisila',
      dayType: defaultDayType(selDate, specialDays),
      checkIn: '',
      note: '',
    }
  }

  const updateRecord = (workerId: string, patch: Partial<AttendanceRecord>) => {
    const rec     = getRecord(workerId)
    const updated = { ...rec, ...patch }
    upsertAttendance(updated)
    setAttendance(loadAttendance())
  }

  const checkInNow = (workerId: string) => {
    updateRecord(workerId, { checkIn: todayHHMM(), dayType: 'half' })
  }

  // Special day management
  const markSpecial = () => {
    if (!specialDraft.label.trim()) return
    const updated = specialDays.filter(s => s.date !== selDate)
    updated.push({ date: selDate, type: specialDraft.type, label: specialDraft.label.trim() })
    setSpecialDays(updated)
    saveSpecialDays(updated)
    setShowSpecial(false)
    setSpecialDraft({ type: 'holiday', label: '' })
  }

  const removeSpecial = () => {
    const updated = specialDays.filter(s => s.date !== selDate)
    setSpecialDays(updated)
    saveSpecialDays(updated)
  }

  const thDate = new Date(selDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เลือกวันที่</label>
          <input type="date" className="input text-sm" value={selDate} onChange={e => setSelDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">{thDate}</p>
          <div className="flex gap-2 mt-1">
            {isSun && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">วันอาทิตย์ (ครึ่งวัน)</span>}
            {special && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${special.type === 'holiday' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700'}`}>
                {special.type === 'holiday' ? '🏖️' : '🎉'} {special.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {special ? (
            <button onClick={removeSpecial} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors">
              ลบวันพิเศษ
            </button>
          ) : (
            <button onClick={() => setShowSpecial(true)} className="btn-secondary text-xs py-1.5 px-3">
              + วันพิเศษ/หยุด
            </button>
          )}
        </div>
      </div>

      {activeWorkers.length === 0 ? (
        <div className="card px-5 py-12 text-center">
          <p className="text-3xl mb-2">👷</p>
          <p className="text-sm text-slate-400">ยังไม่มีคนงาน — ไปที่แท็บ "คนงาน" เพื่อเพิ่ม</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeWorkers.map(w => {
            const rec = getRecord(w.id)
            return (
              <div key={w.id} className="card p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Name + shop */}
                  <div className="flex-1 min-w-40">
                    <p className="font-semibold text-slate-800">{w.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">ค่าแรง ฿{fmt(w.dailyWage)}/วัน</p>
                  </div>

                  {/* Shop selector */}
                  <div className="flex gap-1">
                    {(['chaisila', 'mvp'] as Shop[]).map(s => (
                      <button key={s}
                        onClick={() => updateRecord(w.id, { shop: s })}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                          ${rec.shop === s
                            ? s === 'chaisila' ? 'bg-brand-600 text-white border-brand-600' : 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                      >
                        {SHOP_LABEL[s]}
                      </button>
                    ))}
                  </div>

                  {/* Day type */}
                  <div className="flex gap-1">
                    {(['full', 'half', 'absent', 'holiday'] as DayType[]).map(dt => (
                      <button key={dt}
                        onClick={() => updateRecord(w.id, { dayType: dt })}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                          ${rec.dayType === dt
                            ? dt === 'full'    ? 'bg-green-500 text-white border-green-500'
                            : dt === 'half'    ? 'bg-amber-500 text-white border-amber-500'
                            : dt === 'absent'  ? 'bg-slate-400 text-white border-slate-400'
                            :                   'bg-red-400 text-white border-red-400'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                      >
                        {DAY_LABEL[dt]}
                      </button>
                    ))}
                  </div>

                  {/* Check-in */}
                  <div className="flex items-center gap-2">
                    {rec.checkIn ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">เข้างาน</span>
                        <input
                          type="time"
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-brand-400 font-mono"
                          value={rec.checkIn}
                          onChange={e => updateRecord(w.id, { checkIn: e.target.value })}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => checkInNow(w.id)}
                        className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors font-medium"
                      >
                        🕐 เข้างาน
                      </button>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DAY_COLOR[rec.dayType]}`}>
                    {DAY_LABEL[rec.dayType]}
                  </span>
                </div>

                {/* Note */}
                <div className="mt-2">
                  <input
                    type="text"
                    className="w-full text-xs border-0 border-b border-transparent focus:border-slate-200 bg-transparent focus:outline-none text-slate-400 placeholder-slate-300 py-0.5"
                    placeholder="หมายเหตุ..."
                    value={rec.note}
                    onChange={e => updateRecord(w.id, { note: e.target.value })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Special day modal */}
      {showSpecial && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">เพิ่มวันพิเศษ</h3>
            <p className="text-sm text-slate-500">{thDate}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ประเภท</label>
                <div className="flex gap-2">
                  <button onClick={() => setSpecialDraft(p => ({ ...p, type: 'holiday' }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                      ${specialDraft.type === 'holiday' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}>
                    🏖️ วันหยุด
                  </button>
                  <button onClick={() => setSpecialDraft(p => ({ ...p, type: 'special' }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                      ${specialDraft.type === 'special' ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'}`}>
                    🎉 โอกาสพิเศษ
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">รายละเอียด</label>
                <input autoFocus className="input" placeholder="เช่น ขึ้นบ้านใหม่, วันนักขัตฤกษ์..." value={specialDraft.label} onChange={e => setSpecialDraft(p => ({ ...p, label: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') markSpecial() }} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSpecial(false)} className="btn-secondary text-sm py-1.5 px-4">ยกเลิก</button>
              <button onClick={markSpecial} disabled={!specialDraft.label.trim()} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: Advances & Monthly Summary ───────────────────────

function SummaryTab() {
  const [workers]    = useState<Worker[]>(loadWorkers)
  const [attendance] = useState<AttendanceRecord[]>(loadAttendance)
  const [advances,   setAdvances]  = useState<AdvanceRecord[]>(loadAdvances)
  const [selYM,      setSelYM]     = useState(currentYM)
  const [addOpen,    setAddOpen]   = useState(false)
  const [advDraft,   setAdvDraft]  = useState({ workerId: '', amount: '', date: today, note: '' })

  const activeWorkers = workers.filter(w => w.active)

  const handleAddAdvance = () => {
    if (!advDraft.workerId || !advDraft.amount) return
    const rec: AdvanceRecord = {
      id: `ADV-${Date.now()}`,
      workerId: advDraft.workerId,
      date: advDraft.date,
      amount: parseFloat(advDraft.amount) || 0,
      note: advDraft.note,
    }
    const updated = [...advances, rec]
    setAdvances(updated)
    saveAdvances(updated)
    setAdvDraft({ workerId: '', amount: '', date: today, note: '' })
    setAddOpen(false)
  }

  const deleteAdvance = (id: string) => {
    const updated = advances.filter(a => a.id !== id)
    setAdvances(updated)
    saveAdvances(updated)
  }

  // Monthly wage summary per worker
  const summary = useMemo(() => activeWorkers.map(w => {
    const wage   = calcMonthlyWage(w, selYM, attendance)
    const totalAdv = advances
      .filter(a => a.workerId === w.id && a.date.startsWith(selYM))
      .reduce((s, a) => s + a.amount, 0)
    return { worker: w, ...wage, advances: totalAdv, net: wage.wage - totalAdv }
  }), [activeWorkers, selYM, attendance, advances])

  // Advances for selected month
  const monthAdvances = advances
    .filter(a => a.date.startsWith(selYM))
    .sort((a, b) => b.date.localeCompare(a.date))

  // Months list from attendance
  const allMonths = useMemo(() => {
    const set = new Set<string>()
    attendance.forEach(r => set.add(r.date.slice(0, 7)))
    advances.forEach(a => set.add(a.date.slice(0, 7)))
    set.add(currentYM)
    return Array.from(set).sort().reverse()
  }, [attendance, advances])

  const thMonth = (ym: string) => {
    const [y, m] = ym.split('-')
    return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
  }

  const workerName = (id: string) => workers.find(w => w.id === id)?.name ?? id

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เดือน</label>
          <select className="input text-sm" value={selYM} onChange={e => setSelYM(e.target.value)}>
            {allMonths.map(ym => (
              <option key={ym} value={ym}>{thMonth(ym)}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={() => setAddOpen(true)} className="btn-secondary text-sm py-1.5 px-4">+ บันทึกเบิกเงิน</button>
      </div>

      {/* Monthly wage summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">สรุปเงินเดือน — {thMonth(selYM)}</h3>
        {activeWorkers.length === 0 ? (
          <div className="card px-5 py-10 text-center text-slate-400 text-sm">ยังไม่มีคนงาน</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left">ชื่อ</th>
                  <th className="px-5 py-3 text-center">เต็มวัน</th>
                  <th className="px-5 py-3 text-center">ครึ่งวัน</th>
                  <th className="px-5 py-3 text-right">ค่าแรงรวม</th>
                  <th className="px-5 py-3 text-right">เบิกแล้ว</th>
                  <th className="px-5 py-3 text-right font-semibold">ยังค้างจ่าย</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(({ worker: w, fullDays, halfDays, wage, advances: adv, net }) => (
                  <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{w.name}</p>
                      <p className="text-xs text-slate-400">฿{fmt(w.dailyWage)}/วัน</p>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-green-700">{fullDays}</td>
                    <td className="px-5 py-3 text-center font-mono text-amber-600">{halfDays}</td>
                    <td className="px-5 py-3 text-right font-mono font-medium">฿{fmt(wage)}</td>
                    <td className="px-5 py-3 text-right font-mono text-red-500">
                      {adv > 0 ? `−฿${fmt(adv)}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-mono font-bold text-sm ${net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        ฿{fmt(net)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                  <td className="px-5 py-3 text-slate-500">รวมทั้งหมด</td>
                  <td className="px-5 py-3 text-center font-mono">{summary.reduce((s, r) => s + r.fullDays, 0)}</td>
                  <td className="px-5 py-3 text-center font-mono">{summary.reduce((s, r) => s + r.halfDays, 0)}</td>
                  <td className="px-5 py-3 text-right font-mono">฿{fmt(summary.reduce((s, r) => s + r.wage, 0))}</td>
                  <td className="px-5 py-3 text-right font-mono text-red-500">−฿{fmt(summary.reduce((s, r) => s + r.advances, 0))}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">฿{fmt(summary.reduce((s, r) => s + r.net, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Advance records */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">รายการเบิกเงิน — {thMonth(selYM)}</h3>
        {monthAdvances.length === 0 ? (
          <div className="card px-5 py-8 text-center text-slate-400 text-sm">ไม่มีรายการเบิกในเดือนนี้</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left w-28">วันที่</th>
                  <th className="px-5 py-3 text-left">ชื่อ</th>
                  <th className="px-5 py-3 text-left">หมายเหตุ</th>
                  <th className="px-5 py-3 text-right w-32">จำนวน (฿)</th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {monthAdvances.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                      {new Date(a.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">{workerName(a.workerId)}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{a.note || '—'}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-red-500">฿{fmt(a.amount)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => deleteAdvance(a.id)} className="text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add advance modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">บันทึกเบิกเงิน</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">คนงาน <span className="text-red-400">*</span></label>
                <select className="input text-sm" value={advDraft.workerId} onChange={e => setAdvDraft(p => ({ ...p, workerId: e.target.value }))}>
                  <option value="">— เลือกคนงาน —</option>
                  {workers.filter(w => w.active).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
                <input type="date" className="input" value={advDraft.date} onChange={e => setAdvDraft(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">จำนวนเงิน (฿) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="50" className="input font-mono" placeholder="เช่น 200" value={advDraft.amount} onChange={e => setAdvDraft(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">หมายเหตุ</label>
                <input className="input text-sm" placeholder="เช่น ค่าข้าว, ยา..." value={advDraft.note} onChange={e => setAdvDraft(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddOpen(false)} className="btn-secondary text-sm py-1.5 px-4">ยกเลิก</button>
              <button onClick={handleAddAdvance} disabled={!advDraft.workerId || !advDraft.amount} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main WorkersPage ─────────────────────────────────────────

export default function WorkersPage() {
  const [tab, setTab] = useState<Tab>('attendance')

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'attendance', label: 'เช็คชื่อ',    icon: '📅' },
    { key: 'summary',    label: 'เบิก/สรุปเดือน', icon: '💰' },
    { key: 'workers',    label: 'จัดการคนงาน',  icon: '👷' },
  ]

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">คนงาน</h2>
        <p className="text-sm text-slate-400 mt-0.5">จัดการคนงาน เช็คชื่อ ค่าแรง และการเบิกเงิน</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
              ${tab === t.key
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'summary'    && <SummaryTab />}
      {tab === 'workers'    && <WorkersTab />}
    </div>
  )
}
