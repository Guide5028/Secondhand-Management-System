import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// QueryClient — ตั้งค่า cache และ retry strategy
// staleTime: 30 วินาที = ไม่ refetch ถ้าข้อมูลยังไม่เก่า
// retry: 1 = ลองใหม่แค่ 1 ครั้งถ้า request fail
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:         30 * 1000,
      retry:             1,
      refetchOnWindowFocus: false, // ไม่ refetch ทุกครั้งที่ focus window
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
