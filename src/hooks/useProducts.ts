import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DEFAULT_PRODUCTS, type Product } from '../data/products'
import { DEFAULT_CATEGORIES, CAT_COLORS, type Category } from '../data/categories'

// ── DB row shapes ────────────────────────────────────────────────────────────────
interface DbProduct {
  code: string; name: string; ref_price: number; sell_price: number
  category_key: string | null; active: boolean
}
interface DbCategory { key: string; label: string; color: string; sort_order: number }

// ── Extended type (includes Supabase-only fields) ────────────────────────────────
export interface ProductRow extends Product {
  categoryKey: string | null
}

// ── Mappers ──────────────────────────────────────────────────────────────────────
const toProduct  = (d: DbProduct):  ProductRow => ({ code: d.code, name: d.name, refPrice: +d.ref_price, sellPrice: +d.sell_price, categoryKey: d.category_key })
const toCategory = (d: DbCategory): Category => ({ key: d.key, label: d.label })

// ── Products ─────────────────────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductRow[]> => {
      const { data, error } = await supabase.from('products').select('*').order('code')
      if (error) throw error
      if (!data?.length) {
        // auto-seed ครั้งแรก
        await supabase.from('products').insert(
          DEFAULT_PRODUCTS.map(p => ({
            code: p.code, name: p.name,
            ref_price: p.refPrice, sell_price: p.sellPrice,
            category_key: null, active: true,
          }))
        )
        return DEFAULT_PRODUCTS
      }
      return data.map(toProduct) as ProductRow[]
    },
  })
}

export function useSaveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await supabase.from('products').upsert(
        { code: p.code, name: p.name, ref_price: p.refPrice, sell_price: p.sellPrice },
        { onConflict: 'code' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useSaveProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ code, categoryKey }: { code: string; categoryKey: string }) => {
      const { error } = await supabase.from('products').update({ category_key: categoryKey }).eq('code', code)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await supabase.from('products').delete().eq('code', code)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

// ── Categories ───────────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order')
      if (error) throw error
      if (!data?.length) {
        await supabase.from('categories').insert(
          DEFAULT_CATEGORIES.map((c, i) => ({
            key: c.key, label: c.label,
            color: CAT_COLORS[c.key] ?? '#94a3b8', sort_order: i,
          }))
        )
        return DEFAULT_CATEGORIES
      }
      return data.map(toCategory)
    },
  })
}

export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cat: Category & { color?: string }) => {
      const { error } = await supabase.from('categories').upsert(
        { key: cat.key, label: cat.label, color: cat.color ?? '#94a3b8' },
        { onConflict: 'key' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase.from('categories').delete().eq('key', key)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
