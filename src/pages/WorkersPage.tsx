import { useState, useMemo } from 'react'
import {
  loadWorkers, saveWorkers,
  loadAttendance, upsertAttendance,
  loadAdvances, saveAdvances,
  loadSpecialDays, saveSpecialDays,
  calcMonthlyWageChaisila, isSunday, defaultDayType,
  type Worker, type AttendanceRecord, type AdvanceRecord,
  type SpecialDay, type Shop, type DayType,
} from '../data/workers'

type Tab = 'workers' | 'attendance' | 'summary'

const SHOP_LABEL: Record<Shop, string>   = { chaisila: 'Chaisila', mvp: 'MVP' }
const DAY_LABEL: Record<DayType, string> = { full: 'เต็มวัน', half: 'ครึ่งวัน', absent: 'หยุด', holiday: 'วันหยุด' }
const DAY_COLOR: Record<DayType, string> = {
  full:    'bg-green-100 text-green-700',
  half:    'bg-amber-100 text-amber-700',
  absent:  'bg-slate-100 text-slate-400',
  holiday: 'bg-red-100 text-red-600',
}

const fmt = (n: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)
const today      = new Date().toISOString().slice(0, 10)
const currentYM  = today.slice(0, 7)

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
    setWorkers(updated); saveWorkers(updated)
    setDraft({ name: '', dailyWage: '', defaultShop: 'chaisila' })
    setAdding(false); flash()
  }

  const toggleActive = (id: string) => {
    const updated = workers.map(w => w.id === id ? { ...w, active: !w.active } : w)
    setWorkers(updated); saveWorkers(updated)
  }

  const startEdit = (w: Worker) => { setEditing(w.id); setEditDraft({ name: w.name, dailyWage: w.dailyWage, defaultShop: w.defaultShop }) }

  const commitEdit = () => {
    if (!editing) return
    const updated = workers.map(w =>
      w.id === editing ? { ...w, ...editDraft, dailyWage: Number(editDraft.dailyWage) || w.dailyWage } : w
    )
    setWorkers(updated); saveWorkers(updated); setEditing(null); flash()
  }

  const handleDelete = (id: string) => {
    if (!confirm('ต้องการลบคนงานคนนี้?')) return
    const updated = workers.filter(w => w.id !== id)
    setWorkers(updated); saveWorkers(updated)
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
                      {isEditing
                        ? <input className="input text-sm py-1" value={editDraft.name ?? ''} onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))} />
                        : <span className="font-medium text-slate-800">{w.name}</span>}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing
                        ? <select className="input text-xs py-1" value={editDraft.defaultShop ?? 'chaisila'} onChange={e => setEditDraft(p => ({ ...p, defaultShop: e.target.value as Shop }))}>
                            <option value="chaisila">Chaisila</option>
                            <option value="mvp">MVP</option>
                          </select>
                        : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.defaultShop === 'chaisila' ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700'}`}>
                            {SHOP_LABEL[w.defaultShop]}
                          </span>}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {isEditing
                        ? <input type="number" className="input text-sm py-1 text-right font-mono w-28 ml-auto block" value={editDraft.dailyWage ?? ''} onChange={e => setEditDraft(p => ({ ...p, dailyWage: Number(e.target.value) }))} />
                        : <span>฿{fmt(w.dailyWage)}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleActive(w.id)} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${w.active ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}>
                        {w.active ? 'ทำงาน' : 'หยุดงาน'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isEditing
                        ? <div className="flex gap-1 justify-end">
                            <button onClick={commitEdit} className="text-xs bg-brand-600 text-white px-2 py-1 rounded">บันทึก</button>
                            <button onClick={() => setEditing(null)} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">ยกเลิก</button>
                          </div>
                        : <div className="flex gap-1 justify-end">
                            <button onClick={() => startEdit(w)} className="text-xs text-slate-400 hover:text-brand-500 transition-colors px-1">✎</button>
                            <button onClick={() => handleDelete(w.id)} className="text-xs text-slate-200 hover:text-red-400 transition-colors px-1">✕</button>
                          </div>}
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

  const toggleCheckIn = (workerId: string) => {
    const rec = getRecord(workerId)
    // ถ้ายังไม่ได้เข้างาน → เข้างาน; ถ้าเข้าแล้ว → เอาออก
    updateRecord(workerId, { checkIn: rec.checkIn ? '' : 'checked' })
  }

  const markSpecial = () => {
    if (!specialDraft.label.trim()) return
    const updated = specialDays.filter(s => s.date !== selDate)
    updated.push({ date: selDate, type: specialDraft.type, label: specialDraft.label.trim() })
    setSpecialDays(updated); saveSpecialDays(updated)
    setShowSpecial(false); setSpecialDraft({ type: 'holiday', label: '' })
  }

  const removeSpecial = () => {
    const updated = specialDays.filter(s => s.date !== selDate)
    setSpecialDays(updated); saveSpecialDays(updated)
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
          <div className="flex flex-wrap gap-2 mt-1">
            {isSun && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">วันอาทิตย์ (ครึ่งวัน)</span>}
            {special && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${special.type === 'holiday' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700'}`}>
                {special.type === 'holiday' ? '🏖️' : '🎉'} {special.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {special
            ? <button onClick={removeSpecial} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors">ลบวันพิเศษ</button>
            : <button onClick={() => setShowSpecial(true)} className="btn-secondary text-xs py-1.5 px-3">+ วันพิเศษ/หยุด</button>}
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
            const checkedIn = !!rec.checkIn
            return (
              <div key={w.id} className={`card p-4 transition-colors ${checkedIn ? 'border-green-200 bg-green-50/30' : ''}`}>
                <div className="flex flex-wrap gap-3 items-center">

                  {/* Name */}
                  <div className="flex-1 min-w-40">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{w.name}</p>
                      {w.defaultShop === 'mvp' && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">MVP</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ฿{fmt(w.dailyWage)}/วัน
                      {w.defaultShop === 'mvp' && (
                        <span className="ml-1 text-blue-400">(คิดค่าแรงเฉพาะวันที่ Chaisila)</span>
                      )}
                    </p>
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

                  {/* Check-in toggle */}
                  <button
                    onClick={() => toggleCheckIn(w.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                      ${checkedIn
                        ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600'}`}
                  >
                    {checkedIn ? '✓ เข้างานแล้ว' : '🕐 เข้างาน'}
                  </button>

                  {/* Status badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DAY_COLOR[rec.dayType]}`}>
                    {DAY_LABEL[rec.dayType]}
                    {rec.shop === 'mvp' && rec.dayType !== 'absent' && rec.dayType !== 'holiday' && (
                      <span className="ml-1 opacity-70">(MVP)</span>
                    )}
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
                <input autoFocus className="input" placeholder="เช่น ขึ้นบ้านใหม่, วันนักขัตฤกษ์..."
                  value={specialDraft.label}
                  onChange={e => setSpecialDraft(p => ({ ...p, label: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') markSpecial() }} />
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

// ─── Pay Slip Helper ──────────────────────────────────────────

interface ExtraDeduction { label: string; amount: string }

interface PaySlipConfig {
  worker:          Worker
  dateFrom:        string
  dateTo:          string
  extraDeductions: ExtraDeduction[]
  payerName:       string
}

function calcWageRange(worker: Worker, dateFrom: string, dateTo: string, attendance: AttendanceRecord[]) {
  const recs = attendance.filter(r =>
    r.workerId === worker.id && r.date >= dateFrom && r.date <= dateTo
  )
  const chaisilaRecs = recs.filter(r => r.shop === 'chaisila')
  const fullDays   = chaisilaRecs.filter(r => r.dayType === 'full').length
  const halfDays   = chaisilaRecs.filter(r => r.dayType === 'half').length
  const mvpDays    = recs.filter(r => r.shop === 'mvp' && (r.dayType === 'full' || r.dayType === 'half')).length
  const absentDays = recs.filter(r => r.dayType === 'absent' || r.dayType === 'holiday').length
  const wage       = fullDays * worker.dailyWage + halfDays * (worker.dailyWage / 2)
  return { recs, fullDays, halfDays, mvpDays, absentDays, wage }
}

function doPrintPaySlip(
  cfg: PaySlipConfig,
  attendance: AttendanceRecord[],
  advances: AdvanceRecord[],
) {
  const { worker, dateFrom, dateTo, extraDeductions, payerName } = cfg
  const F = (n: number) => new Intl.NumberFormat('th-TH').format(Math.round(n))
  const thD = (iso: string) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  const thDShort = (iso: string) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

  const { recs, fullDays, halfDays, mvpDays, absentDays, wage } = calcWageRange(worker, dateFrom, dateTo, attendance)
  const advRecs  = advances.filter(a => a.workerId === worker.id && a.date >= dateFrom && a.date <= dateTo)
  const totalAdv = advRecs.reduce((s, a) => s + a.amount, 0)
  const totalExtra = extraDeductions.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0)
  const net = wage - totalAdv - totalExtra

  const printDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  // Attendance rows
  const attendRows = recs
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => {
      const isMVP  = r.shop === 'mvp'
      const dayLbl: Record<string, string> = { full: 'เต็มวัน', half: 'ครึ่งวัน', absent: 'หยุด', holiday: 'วันหยุด' }
      const dayWage = isMVP ? 0 : (r.dayType === 'full' ? worker.dailyWage : r.dayType === 'half' ? worker.dailyWage / 2 : 0)
      return `<tr>
        <td>${thDShort(r.date)}</td>
        <td style="text-align:center">${isMVP ? 'MVP' : 'Chaisila'}</td>
        <td style="text-align:center">${dayLbl[r.dayType] ?? r.dayType}</td>
        <td style="text-align:right">${dayWage > 0 ? F(dayWage) : isMVP ? '<span style="color:#94a3b8">—</span>' : '—'}</td>
      </tr>`
    }).join('')

  // Advances rows
  const advRows = advRecs
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(a => `<tr>
      <td style="color:#94a3b8">${thDShort(a.date)}</td>
      <td>${a.note || 'เบิกเงิน'}</td>
      <td style="text-align:right;color:#ef4444">฿${F(a.amount)}</td>
    </tr>`).join('')

  // Extra deductions rows
  const extraRows = extraDeductions
    .filter(d => parseFloat(d.amount) > 0)
    .map(d => `<tr>
      <td>หัก ${d.label}</td>
      <td style="text-align:right;color:#ef4444">฿${F(parseFloat(d.amount))}</td>
    </tr>`).join('')

  const win = window.open('', '_blank', 'width=740,height=900')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Pay Slip — ${worker.name}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Noto Sans Thai', Tahoma, sans-serif; color: #1e293b; font-size: 13px; }
      .page { max-width: 680px; margin: 0 auto; padding: 36px 40px; }

      /* Header */
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 14px; margin-bottom: 18px; }
      .header-left h1 { font-size: 22px; font-weight: 800; color: #f97316; letter-spacing: -0.5px; }
      .header-left p  { font-size: 12px; color: #94a3b8; margin-top: 2px; }
      .header-right   { text-align: right; }
      .header-right .shop-name { font-size: 14px; font-weight: 700; color: #1e293b; }
      .header-right .shop-sub  { font-size: 11px; color: #94a3b8; }

      /* Worker info bar */
      .info-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .info-item label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
      .info-item span  { font-size: 14px; font-weight: 700; color: #1e293b; }

      /* Tables */
      .section-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 16px 0 6px; }
      table  { width: 100%; border-collapse: collapse; font-size: 12.5px; }
      th, td { padding: 6px 10px; }
      thead tr { background: #f1f5f9; }
      th { font-weight: 600; font-size: 11px; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; }
      tbody tr { border-bottom: 1px solid #f1f5f9; }
      tbody tr:last-child { border-bottom: none; }

      /* Two-column layout for income/deductions */
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }

      /* Net payable box */
      .net-box { margin-top: 20px; border: 2px solid #1e293b; border-radius: 8px; overflow: hidden; }
      .net-box-header { background: #1e293b; color: white; padding: 8px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .net-box-body   { padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
      .net-label      { font-size: 13px; color: #64748b; }
      .net-amount     { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
      .net-positive   { color: #16a34a; }
      .net-negative   { color: #dc2626; }
      .net-note       { font-size: 11px; color: #94a3b8; margin-top: 2px; }

      /* Signature */
      .sig-area { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
      .sig-box  { text-align: center; }
      .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 12px; color: #475569; margin-top: 40px; }
      .sig-date { font-size: 11px; color: #94a3b8; margin-top: 4px; }

      .badge { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 99px; background: #fee2e2; color: #dc2626; font-weight: 600; }

      @media print {
        .page { padding: 20px 24px; }
        .net-amount { font-size: 24px; }
      }
    </style>
  </head><body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>ใบรับเงิน (Pay Slip)</h1>
        <p>จ่ายเป็นเงินสด</p>
      </div>
      <div class="header-right">
        <div class="shop-name">ไชยศิลา ค้าของเก่า</div>
        <div class="shop-sub">Chaisila Recycle</div>
      </div>
    </div>

    <!-- Worker info -->
    <div class="info-bar">
      <div class="info-item">
        <label>ชื่อคนงาน</label>
        <span>${worker.name}</span>
      </div>
      <div class="info-item">
        <label>งวดวันที่</label>
        <span style="font-size:12px">${thD(dateFrom)} — ${thD(dateTo)}</span>
      </div>
      <div class="info-item">
        <label>ค่าแรง/วัน</label>
        <span>฿${F(worker.dailyWage)}</span>
      </div>
    </div>

    <!-- Two-column: income + deductions -->
    <div class="two-col">

      <!-- รายรับ -->
      <div>
        <div class="section-label">รายรับ</div>
        <table>
          <thead><tr><th>รายการ</th><th style="text-align:right">จำนวน (฿)</th></tr></thead>
          <tbody>
            ${fullDays > 0 ? `<tr><td>เต็มวัน (Chaisila) ${fullDays} วัน</td><td style="text-align:right">${F(fullDays * worker.dailyWage)}</td></tr>` : ''}
            ${halfDays > 0 ? `<tr><td>ครึ่งวัน (Chaisila) ${halfDays} วัน</td><td style="text-align:right">${F(halfDays * (worker.dailyWage / 2))}</td></tr>` : ''}
            ${mvpDays > 0 ? `<tr><td style="color:#94a3b8">MVP ${mvpDays} วัน <span class="badge">ไม่คิดค่าแรง</span></td><td style="text-align:right;color:#94a3b8">—</td></tr>` : ''}
            ${fullDays === 0 && halfDays === 0 ? '<tr><td colspan="2" style="color:#94a3b8;text-align:center">ไม่มีข้อมูลการเข้างาน</td></tr>' : ''}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid #e2e8f0;font-weight:700;background:#f8fafc">
              <td>รวมรายรับ</td>
              <td style="text-align:right">฿${F(wage)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- รายการหัก -->
      <div>
        <div class="section-label">รายการหัก</div>
        <table>
          <thead><tr><th>รายการ</th><th style="text-align:right">จำนวน (฿)</th></tr></thead>
          <tbody>
            ${totalAdv > 0 ? `<tr><td>เบิกเงินล่วงหน้า (${advRecs.length} ครั้ง)</td><td style="text-align:right;color:#ef4444">฿${F(totalAdv)}</td></tr>` : ''}
            ${extraRows || ''}
            ${totalAdv === 0 && totalExtra === 0 ? '<tr><td colspan="2" style="color:#94a3b8;text-align:center">ไม่มีรายการหัก</td></tr>' : ''}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid #e2e8f0;font-weight:700;background:#fff5f5">
              <td>รวมหัก</td>
              <td style="text-align:right;color:#ef4444">฿${F(totalAdv + totalExtra)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Net payable -->
    <div class="net-box">
      <div class="net-box-header">💰 ยอดสุทธิที่ต้องได้รับ</div>
      <div class="net-box-body" style="padding:18px 20px;">
        <div style="font-size:22px;font-weight:800;color:#1e293b;">ยอดสุทธิ</div>
        <div class="net-amount ${net >= 0 ? 'net-positive' : 'net-negative'}" style="font-size:42px;">฿${F(net)}</div>
      </div>
    </div>

    <!-- Signature -->
    <div class="sig-area">
      <div class="sig-box">
        <div class="sig-line">ลายเซ็นผู้รับเงิน</div>
        <div style="font-size:12px;color:#475569;margin-top:4px">(${worker.name})</div>
        <div class="sig-date">วันที่รับเงิน ............../............../..............&nbsp;</div>
      </div>
      <div class="sig-box">
        <div class="sig-line">ลายเซ็นผู้จ่าย</div>
        <div style="font-size:12px;color:#475569;margin-top:4px">(${payerName})</div>
        <div class="sig-date">ณ วันที่ ${printDate}</div>
      </div>
    </div>

  </div>
  </body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 350)
}

// ─── Pay Slip Modal ────────────────────────────────────────────

const DEFAULT_PAYER = 'ปรีชญารัตน์ ไชยศิลา'

interface PaySlipModalProps {
  worker:     Worker
  selYM:      string
  attendance: AttendanceRecord[]
  advances:   AdvanceRecord[]
  onClose:    () => void
}

function PaySlipModal({ worker, selYM, attendance, advances, onClose }: PaySlipModalProps) {
  // Default range = first→last day of selYM
  const firstDay = `${selYM}-01`
  const lastDay  = (() => {
    const [y, m] = selYM.split('-').map(Number)
    return new Date(y, m, 0).toISOString().slice(0, 10)
  })()

  const [dateFrom, setDateFrom] = useState(firstDay)
  const [dateTo,   setDateTo]   = useState(lastDay)
  const [extras,   setExtras]   = useState<ExtraDeduction[]>([])
  const [payer,    setPayer]    = useState(DEFAULT_PAYER)

  const addExtra = () => setExtras(p => [...p, { label: '', amount: '' }])
  const updateExtra = (i: number, patch: Partial<ExtraDeduction>) =>
    setExtras(p => p.map((e, idx) => idx === i ? { ...e, ...patch } : e))
  const removeExtra = (i: number) => setExtras(p => p.filter((_, idx) => idx !== i))

  // Live preview numbers
  const { wage, fullDays, halfDays, mvpDays } = calcWageRange(worker, dateFrom, dateTo, attendance)
  const advRecs    = advances.filter(a => a.workerId === worker.id && a.date >= dateFrom && a.date <= dateTo)
  const totalAdv   = advRecs.reduce((s, a) => s + a.amount, 0)
  const totalExtra = extras.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const net        = wage - totalAdv - totalExtra

  const F = (n: number) => new Intl.NumberFormat('th-TH').format(Math.round(n))

  const handlePrint = () => {
    doPrintPaySlip(
      { worker, dateFrom, dateTo, extraDeductions: extras.filter(e => e.label && parseFloat(e.amount) > 0), payerName: payer },
      attendance,
      advances,
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">🖨️ Pay Slip</h3>
            <p className="text-xs text-slate-400 mt-0.5">{worker.name} · ฿{F(worker.dailyWage)}/วัน</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Period */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">งวดวันที่</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">ตั้งแต่</label>
                <input type="date" className="input text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">ถึงวันที่</label>
                <input type="date" className="input text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">ตัวอย่างสรุป</p>
            <div className="flex justify-between">
              <span className="text-slate-600">เต็มวัน {fullDays} วัน</span>
              <span className="font-mono">฿{F(fullDays * worker.dailyWage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">ครึ่งวัน {halfDays} วัน</span>
              <span className="font-mono">฿{F(halfDays * (worker.dailyWage / 2))}</span>
            </div>
            {mvpDays > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>MVP {mvpDays} วัน (ไม่คิดค่าแรง)</span>
                <span className="font-mono">—</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-slate-200 pt-2 mt-1">
              <span>รวมค่าแรง</span>
              <span className="font-mono text-slate-800">฿{F(wage)}</span>
            </div>
            {totalAdv > 0 && (
              <div className="flex justify-between text-red-500">
                <span>หักเบิก ({advRecs.length} รายการ)</span>
                <span className="font-mono">−฿{F(totalAdv)}</span>
              </div>
            )}
            {extras.filter(e => parseFloat(e.amount) > 0).map((e, i) => (
              <div key={i} className="flex justify-between text-red-500">
                <span>หัก {e.label || '...'}</span>
                <span className="font-mono">−฿{F(parseFloat(e.amount))}</span>
              </div>
            ))}
            <div className={`flex justify-between text-base font-bold border-t-2 border-slate-300 pt-2 mt-1 ${net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              <span>ยอดสุทธิ</span>
              <span className="font-mono">฿{F(net)}</span>
            </div>
          </div>

          {/* Extra deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">รายการหักเพิ่มเติม</p>
              <button onClick={addExtra} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ เพิ่มรายการหัก</button>
            </div>
            {extras.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">ไม่มีรายการหักเพิ่มเติม — กด "+ เพิ่มรายการหัก" ถ้าต้องการ</p>
            ) : (
              <div className="space-y-2">
                {extras.map((e, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="input flex-1 text-sm"
                      placeholder="ชื่อรายการ เช่น ค่าหนี้, ค่าเหล้า..."
                      value={e.label}
                      onChange={ev => updateExtra(i, { label: ev.target.value })}
                    />
                    <input
                      type="number" min="0" step="50"
                      className="input w-28 text-sm font-mono text-right"
                      placeholder="จำนวน ฿"
                      value={e.amount}
                      onChange={ev => updateExtra(i, { amount: ev.target.value })}
                    />
                    <button onClick={() => removeExtra(i)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payer name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">ชื่อผู้จ่าย</label>
            <input className="input text-sm" value={payer} onChange={e => setPayer(e.target.value)} placeholder="ชื่อผู้จ่ายเงิน" />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">ยกเลิก</button>
          <button onClick={handlePrint} className="btn-primary text-sm py-2 px-6 flex items-center gap-2">
            🖨️ พิมพ์ Pay Slip
          </button>
        </div>
      </div>
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
  const [paySlipWorker, setPaySlipWorker] = useState<Worker | null>(null)

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
    setAdvances(updated); saveAdvances(updated)
    setAdvDraft({ workerId: '', amount: '', date: today, note: '' })
    setAddOpen(false)
  }

  const deleteAdvance = (id: string) => {
    const updated = advances.filter(a => a.id !== id)
    setAdvances(updated); saveAdvances(updated)
  }

  const summary = useMemo(() => activeWorkers.map(w => {
    const wage   = calcMonthlyWageChaisila(w, selYM, attendance)
    const totalAdv = advances.filter(a => a.workerId === w.id && a.date.startsWith(selYM)).reduce((s, a) => s + a.amount, 0)
    return { worker: w, ...wage, advancesTotal: totalAdv, net: wage.wage - totalAdv }
  }), [activeWorkers, selYM, attendance, advances])

  const monthAdvances = advances.filter(a => a.date.startsWith(selYM)).sort((a, b) => b.date.localeCompare(a.date))

  const allMonths = useMemo(() => {
    const set = new Set<string>()
    attendance.forEach(r => set.add(r.date.slice(0, 7)))
    advances.forEach(a => set.add(a.date.slice(0, 7)))
    set.add(currentYM)
    return Array.from(set).sort().reverse()
  }, [attendance, advances])

  const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const thMonth = (ym: string) => { const [y,m] = ym.split('-').map(Number); return `${MONTH_NAMES[m-1]} ${y+543}` }
  const workerName = (id: string) => workers.find(w => w.id === id)?.name ?? id

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เดือน</label>
          <select className="input text-sm" value={selYM} onChange={e => setSelYM(e.target.value)}>
            {allMonths.map(ym => <option key={ym} value={ym}>{thMonth(ym)}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={() => setAddOpen(true)} className="btn-secondary text-sm py-1.5 px-4">+ บันทึกเบิกเงิน</button>
      </div>

      {/* Monthly wage summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">สรุปเงินเดือน — {thMonth(selYM)}</h3>
          <p className="text-xs text-slate-400">* คิดค่าแรงเฉพาะวันทำงานที่ Chaisila</p>
        </div>
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
                  <th className="px-5 py-3 text-center">MVP</th>
                  <th className="px-5 py-3 text-right">ค่าแรงรวม</th>
                  <th className="px-5 py-3 text-right">เบิกแล้ว</th>
                  <th className="px-5 py-3 text-right font-semibold">ค้างจ่าย</th>
                  <th className="px-5 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {summary.map(({ worker: w, fullDays, halfDays, mvpDays, wage, advancesTotal: adv, net }) => (
                  <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{w.name}</p>
                      <p className="text-xs text-slate-400">฿{fmt(w.dailyWage)}/วัน</p>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-green-700">{fullDays}</td>
                    <td className="px-5 py-3 text-center font-mono text-amber-600">{halfDays}</td>
                    <td className="px-5 py-3 text-center font-mono text-blue-400">{mvpDays || '—'}</td>
                    <td className="px-5 py-3 text-right font-mono font-medium">฿{fmt(wage)}</td>
                    <td className="px-5 py-3 text-right font-mono text-red-500">{adv > 0 ? `−฿${fmt(adv)}` : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-mono font-bold text-sm ${net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>฿{fmt(net)}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setPaySlipWorker(w)}
                        title="พิมพ์ Pay Slip"
                        className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                  <td className="px-5 py-3 text-slate-500">รวมทั้งหมด</td>
                  <td className="px-5 py-3 text-center font-mono">{summary.reduce((s, r) => s + r.fullDays, 0)}</td>
                  <td className="px-5 py-3 text-center font-mono">{summary.reduce((s, r) => s + r.halfDays, 0)}</td>
                  <td className="px-5 py-3 text-center font-mono text-blue-400">{summary.reduce((s, r) => s + r.mvpDays, 0) || '—'}</td>
                  <td className="px-5 py-3 text-right font-mono">฿{fmt(summary.reduce((s, r) => s + r.wage, 0))}</td>
                  <td className="px-5 py-3 text-right font-mono text-red-500">−฿{fmt(summary.reduce((s, r) => s + r.advancesTotal, 0))}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">฿{fmt(summary.reduce((s, r) => s + r.net, 0))}</td>
                  <td />
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
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{new Date(a.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}</td>
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
                  {workers.filter(w => w.active).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
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

      {/* Pay Slip modal */}
      {paySlipWorker && (
        <PaySlipModal
          worker={paySlipWorker}
          selYM={selYM}
          attendance={attendance}
          advances={advances}
          onClose={() => setPaySlipWorker(null)}
        />
      )}
    </div>
  )
}

// ─── Main WorkersPage ─────────────────────────────────────────

export default function WorkersPage() {
  const [tab, setTab] = useState<Tab>('attendance')

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'attendance', label: 'เช็คชื่อ',       icon: '📅' },
    { key: 'summary',    label: 'เบิก/สรุปเดือน', icon: '💰' },
    { key: 'workers',    label: 'จัดการคนงาน',    icon: '👷' },
  ]

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">คนงาน</h2>
        <p className="text-sm text-slate-400 mt-0.5">จัดการคนงาน เช็คชื่อ ค่าแรง และการเบิกเงิน</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
              ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400'}`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'summary'    && <SummaryTab />}
      {tab === 'workers'    && <WorkersTab />}
    </div>
  )
}
