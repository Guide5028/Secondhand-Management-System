import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase.from('stock').select('*')
      if (error) throw error
      const result: Record<string, number> = {}
      for (const d of data ?? []) result[d.product_code] = +d.weight
      return result
    },
  })
}

export function useSaveStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stock: Record<string, number>) => {
      const rows = Object.entries(stock).map(([product_code, weight]) => ({
        product_code, weight, updated_at: new Date().toISOString(),
      }))
      if (rows.length === 0) {
        // ถ้าไม่มี rows = ลบทั้งหมด
        await supabase.from('stock').delete().neq('product_code', '')
        return
      }
      const { error } = await supabase.from('stock').upsert(rows, { onConflict: 'product_code' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  })
}
