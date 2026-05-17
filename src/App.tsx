import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
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
  return (
    <Routes>
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
