import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage  from './pages/DashboardPage.tsx'
import PurchasePage   from './pages/PurchasePage.tsx'
import SalePage       from './pages/SalePage.tsx'
import StockPage      from './pages/StockPage.tsx'
import DailyPLPage    from './pages/DailyPLPage.tsx'
import ReceiptPage    from './pages/ReceiptPage.tsx'

// App = โครงสร้างหน้าทั้งหมด
// Layout = sidebar + topbar ที่แชร์กันทุกหน้า
// Routes = เส้นทางแต่ละหน้า
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="purchase"  element={<PurchasePage />} />
        <Route path="sale"      element={<SalePage />} />
        <Route path="stock"     element={<StockPage />} />
        <Route path="daily"     element={<DailyPLPage />} />
        <Route path="receipt"   element={<ReceiptPage />} />
      </Route>
    </Routes>
  )
}
