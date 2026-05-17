import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Transaction, TxItem } from '../data/transactions'

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .order('date', { ascending: false })
        .order('time', { ascending: false })
      if (error) throw error
      return (data ?? []).map(t => ({
        id:        t.id,
        type:      t.type as 'purchase' | 'sale',
        receiptNo: t.receipt_no,
        date:      t.date,
        time:      t.time,
        party:     t.party,
        total:     +t.total,
        items: (t.transaction_items ?? []).map((i: any): TxItem => ({
          code: i.code, name: i.name, weight: +i.weight, price: +i.price,
        })),
      }))
    },
  })
}

export function useSaveTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tx: Transaction) => {
      // 1) upsert header
      const { error: e1 } = await supabase.from('transactions').upsert(
        { id: tx.id, type: tx.type, receipt_no: tx.receiptNo,
          date: tx.date, time: tx.time, party: tx.party, total: tx.total },
        { onConflict: 'id' }
      )
      if (e1) throw e1
      // 2) replace items
      await supabase.from('transaction_items').delete().eq('transaction_id', tx.id)
      if (tx.items.length > 0) {
        const { error: e2 } = await supabase.from('transaction_items').insert(
          tx.items.map(i => ({
            transaction_id: tx.id, code: i.code, name: i.name,
            weight: i.weight, price: i.price,
          }))
        )
        if (e2) throw e2
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
