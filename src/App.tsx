import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'

import Layout         from './components/layout/Layout'
import LoginPage      from './pages/LoginPage.tsx'
import DashboardPage  from './pages/DashboardPage.tsx'
import PurchasePage   from './pages/PurchasePage.tsx'
import SalePage       from './pages/SalePage.tsx'
import StockPage      from './pages/StockPage.tsx'
import DailyPLPage    from './pages/DailyPLPage.tsx'
import ReceiptPage    from './pages/ReceiptPage.tsx'
import HistoryPage    from './pages/HistoryPage.tsx'
import ProductsPage   from './pages/ProductsPage.tsx'
import WorkersPage    from './pages/WorkersPage.tsx'

export default function App() {
  const [session,  setSession]  = useState<Session | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Still checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">กำลังโหลด…</div>
      </div>
    )
  }

  // Not logged in → show login, redirect any protected route back to /login
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Logged in → full app
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="purchase"  element={<PurchasePage />} />
        <Route path="sale"      element={<SalePage />} />
        <Route path="stock"     element={<StockPage />} />
        <Route path="history"   element={<HistoryPage />} />
        <Route path="daily"     element={<DailyPLPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="workers"   element={<WorkersPage />} />
        <Route path="receipt"   element={<ReceiptPage />} />
      </Route>
    </Routes>
  )
}
