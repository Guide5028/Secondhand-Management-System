import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Worker, AttendanceRecord, AdvanceRecord, SpecialDay } from '../data/workers'

// ── Workers ───────────────────────────────────────────────────────────────────────
export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: async (): Promise<Worker[]> => {
      const { data, error } = await supabase.from('workers').select('*').order('created_at')
      if (error) throw error
      return (data ?? []).map(d => ({
        id:          d.id,
        name:        d.name,
        dailyWage:   +d.daily_wage,
        defaultShop: d.default_shop as Worker['defaultShop'],
        active:      d.active,
      }))
    },
  })
}

export function useSaveWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (w: Worker) => {
      const { error } = await supabase.from('workers').upsert(
        { id: w.id, name: w.name, daily_wage: w.dailyWage,
          default_shop: w.defaultShop, active: w.active },
        { onConflict: 'id' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

// ── Attendance ────────────────────────────────────────────────────────────────────
export function useAttendance(ym?: string) {
  return useQuery({
    queryKey: ['attendance', ym ?? 'all'],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      let q = supabase.from('attendance').select('*').order('date')
      if (ym) q = q.gte('date', `${ym}-01`).lte('date', `${ym}-31`)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []).map(d => ({
        id:       d.id,
        workerId: d.worker_id,
        date:     d.date,
        shop:     d.shop     as AttendanceRecord['shop'],
        dayType:  d.day_type as AttendanceRecord['dayType'],
        checkIn:  d.check_in,
        note:     d.note,
      }))
    },
  })
}

export function useUpsertAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: AttendanceRecord) => {
      const { error } = await supabase.from('attendance').upsert(
        { id: r.id, worker_id: r.workerId, date: r.date,
          shop: r.shop, day_type: r.dayType, check_in: r.checkIn, note: r.note },
        { onConflict: 'id' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  })
}

// ── Advances ──────────────────────────────────────────────────────────────────────
export function useAdvances(ym?: string) {
  return useQuery({
    queryKey: ['advances', ym ?? 'all'],
    queryFn: async (): Promise<AdvanceRecord[]> => {
      let q = supabase.from('advances').select('*').order('date')
      if (ym) q = q.gte('date', `${ym}-01`).lte('date', `${ym}-31`)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []).map(d => ({
        id:       d.id,
        workerId: d.worker_id,
        date:     d.date,
        amount:   +d.amount,
        note:     d.note,
      }))
    },
  })
}

export function useSaveAdvance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: AdvanceRecord) => {
      const { error } = await supabase.from('advances').upsert(
        { id: r.id, worker_id: r.workerId, date: r.date, amount: r.amount, note: r.note },
        { onConflict: 'id' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['advances'] }),
  })
}

export function useDeleteAdvance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('advances').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['advances'] }),
  })
}

// ── Special Days ──────────────────────────────────────────────────────────────────
export function useSpecialDays() {
  return useQuery({
    queryKey: ['special_days'],
    queryFn: async (): Promise<SpecialDay[]> => {
      const { data, error } = await supabase.from('special_days').select('*').order('date')
      if (error) throw error
      return (data ?? []).map(d => ({ date: d.date, type: d.type, label: d.label }))
    },
  })
}

export function useUpsertSpecialDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: SpecialDay) => {
      const { error } = await supabase.from('special_days').upsert(
        { date: d.date, type: d.type, label: d.label },
        { onConflict: 'date' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['special_days'] }),
  })
}

export function useDeleteSpecialDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from('special_days').delete().eq('date', date)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['special_days'] }),
  })
}
