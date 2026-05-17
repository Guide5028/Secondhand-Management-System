import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface DailyRecord {
  date: string; sale: number; purchase: number
  labor: number; fuel: number; utility: number
  rent: number; misc: number; other: number; vehicle: number; note: string
}

export function useDailyPL() {
  return useQuery({
    queryKey: ['daily_pl'],
    queryFn: async (): Promise<DailyRecord[]> => {
      const { data, error } = await supabase
        .from('daily_pl')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []).map(d => ({
        date:     d.date,
        sale:     +d.sale,    purchase: +d.purchase,
        labor:    +d.labor,   fuel:     +d.fuel,
        utility:  +d.utility, rent:     +d.rent,
        misc:     +d.misc,    other:    +d.other,
        vehicle:  +d.vehicle, note:     d.note ?? '',
      }))
    },
  })
}

export function useUpsertDailyPL() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: DailyRecord) => {
      const { error } = await supabase.from('daily_pl').upsert(
        { date: r.date, sale: r.sale, purchase: r.purchase,
          labor: r.labor, fuel: r.fuel, utility: r.utility,
          rent: r.rent, misc: r.misc, other: r.other,
          vehicle: r.vehicle, note: r.note },
        { onConflict: 'date' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_pl'] }),
  })
}

export function useDeleteDailyPL() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from('daily_pl').delete().eq('date', date)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_pl'] }),
  })
}
