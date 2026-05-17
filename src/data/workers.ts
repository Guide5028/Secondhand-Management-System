// ================================================================
// workers.ts — ข้อมูลคนงาน การเข้างาน และการเบิกเงิน
// ================================================================

export type Shop    = 'chaisila' | 'mvp'
export type DayType = 'full' | 'half' | 'absent' | 'holiday'

export interface Worker {
  id:          string
  name:        string
  dailyWage:   number     // ค่าแรงเต็มวัน (บาท)
  defaultShop: Shop
  active:      boolean
}

export interface AttendanceRecord {
  id:       string
  workerId: string
  date:     string       // YYYY-MM-DD
  shop:     Shop
  dayType:  DayType      // full=เต็มวัน, half=ครึ่งวัน, absent=หยุด, holiday=วันหยุด
  checkIn:  string       // HH:MM หรือ ''
  note:     string
}

export interface AdvanceRecord {
  id:       string
  workerId: string
  date:     string       // YYYY-MM-DD
  amount:   number
  note:     string
}

export interface SpecialDay {
  date:  string          // YYYY-MM-DD
  type:  'holiday' | 'special'
  label: string          // เช่น "วันหยุดนักขัตฤกษ์", "ขึ้นบ้านใหม่"
}

const WORKER_KEY     = 'kankrong_workers'
const ATTEND_KEY     = 'kankrong_attendance'
const ADVANCE_KEY    = 'kankrong_advances'
const SPECIAL_KEY    = 'kankrong_special_days'

// ─── Workers ───────────────────────────────────────────────────
export function loadWorkers(): Worker[] {
  try {
    const raw = localStorage.getItem(WORKER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveWorkers(workers: Worker[]): void {
  localStorage.setItem(WORKER_KEY, JSON.stringify(workers))
}

// ─── Attendance ────────────────────────────────────────────────
export function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(ATTEND_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(ATTEND_KEY, JSON.stringify(records))
}

export function upsertAttendance(record: AttendanceRecord): void {
  const all = loadAttendance()
  const idx = all.findIndex(r => r.workerId === record.workerId && r.date === record.date)
  if (idx >= 0) all[idx] = record
  else all.push(record)
  saveAttendance(all)
}

// ─── Advances ──────────────────────────────────────────────────
export function loadAdvances(): AdvanceRecord[] {
  try {
    const raw = localStorage.getItem(ADVANCE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveAdvances(records: AdvanceRecord[]): void {
  localStorage.setItem(ADVANCE_KEY, JSON.stringify(records))
}

// ─── Special Days ──────────────────────────────────────────────
export function loadSpecialDays(): SpecialDay[] {
  try {
    const raw = localStorage.getItem(SPECIAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveSpecialDays(days: SpecialDay[]): void {
  localStorage.setItem(SPECIAL_KEY, JSON.stringify(days))
}

// ─── Helper: เงินค่าแรงรายเดือน ────────────────────────────────
export function calcMonthlyWage(
  worker: Worker,
  ym: string,  // YYYY-MM
  attendance: AttendanceRecord[],
): { fullDays: number; halfDays: number; absentDays: number; wage: number } {
  const records = attendance.filter(r => r.workerId === worker.id && r.date.startsWith(ym))
  const fullDays   = records.filter(r => r.dayType === 'full').length
  const halfDays   = records.filter(r => r.dayType === 'half').length
  const absentDays = records.filter(r => r.dayType === 'absent' || r.dayType === 'holiday').length
  const wage = fullDays * worker.dailyWage + halfDays * (worker.dailyWage / 2)
  return { fullDays, halfDays, absentDays, wage }
}

/** วันอาทิตย์หรือไม่ */
export function isSunday(date: string): boolean {
  return new Date(date).getDay() === 0
}

/** หา dayType เริ่มต้น: วันหยุดพิเศษ = holiday, วันอาทิตย์ = half, ปกติ = full */
export function defaultDayType(date: string, specialDays: SpecialDay[]): DayType {
  const special = specialDays.find(s => s.date === date)
  if (special?.type === 'holiday') return 'holiday'
  if (isSunday(date)) return 'half'
  return 'full'
}

/** คำนวณค่าแรงรายเดือน — นับเฉพาะวันที่ทำงานที่ Chaisila เท่านั้น */
export function calcMonthlyWageChaisila(
  worker: Worker,
  ym: string,
  attendance: AttendanceRecord[],
): { fullDays: number; halfDays: number; absentDays: number; mvpDays: number; wage: number } {
  const records = attendance.filter(r => r.workerId === worker.id && r.date.startsWith(ym))
  const chaisilaRecs = records.filter(r => r.shop === 'chaisila')
  const fullDays   = chaisilaRecs.filter(r => r.dayType === 'full').length
  const halfDays   = chaisilaRecs.filter(r => r.dayType === 'half').length
  const absentDays = records.filter(r => r.dayType === 'absent' || r.dayType === 'holiday').length
  const mvpDays    = records.filter(r => r.shop === 'mvp' && (r.dayType === 'full' || r.dayType === 'half')).length
  const wage = fullDays * worker.dailyWage + halfDays * (worker.dailyWage / 2)
  return { fullDays, halfDays, absentDays, mvpDays, wage }
}
