import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface ReceiptItem {
  name:   string
  weight: number
  price:  number
}

interface ReceiptData {
  receiptNo:  string
  date:       string
  sellerName: string
  items:      ReceiptItem[]
  total:      number
}

const MOCK: ReceiptData = {
  receiptNo:  'REC-ตัวอย่าง',
  date:       new Date().toLocaleDateString('th-TH'),
  sellerName: 'ลูกค้าทั่วไป',
  items: [
    { name: 'สแตนเลส', weight: 17.90, price: 2.60 },
    { name: 'มีเนียมบาง', weight: 1.40,  price: 9.50 },
    { name: 'กระดาษลัง', weight: 6.20, price: 3.00 },
  ],
  total: 0,
}

// ชื่อร้าน
const SHOP = {
  th:    'ไชยศิลา ค้าของเก่า',
  en:    'Chaisila Recycle',
  phone: '085-965-2667',
  hours: 'เปิด 8.00-17.00 น.',
}

export default function ReceiptPage() {
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const raw  = sessionStorage.getItem('receipt')
  const data: ReceiptData = raw ? JSON.parse(raw) : MOCK
  const total = data.items.reduce((s, i) => s + i.weight * i.price, 0)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>ใบรับสินค้า ${data.receiptNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Sarabun','Tahoma',sans-serif; font-size: 13px; padding: 20px; }
            h1 { font-size: 17px; text-align: center; font-weight: bold; }
            .en { text-align: center; font-size: 13px; color: #444; letter-spacing: 1px; }
            .sub { text-align: center; font-size: 12px; color: #666; margin-top: 2px; }
            .title { text-align: center; font-size: 14px; font-weight: bold; margin: 6px 0 10px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; font-size: 12px; }
            th { background: #f0f0f0; text-align: center; }
            .num { text-align: right; font-family: monospace; }
            .cen { text-align: center; }
            .total-row td { font-weight: bold; background: #f0f0f0; }
            .sign { display: flex; justify-content: space-around; margin-top: 40px; }
            .sign-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 4px; font-size: 12px; text-align: center; width: 120px; }
            .note { font-size: 10px; color: #888; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h1>${SHOP.th}</h1>
          <p class="en">${SHOP.en}</p>
          <p class="sub">โทร ${SHOP.phone} (${SHOP.hours})</p>
          <p class="title">ใบรับสินค้า</p>
          <div class="meta">
            <div>
              <div>เลขที่: <strong>${data.receiptNo}</strong></div>
              <div>ชื่อผู้ขาย: ${data.sellerName}</div>
            </div>
            <div style="text-align:right">
              <div>วันที่: ${data.date}</div>
              <div style="font-size:10px;color:#888">ราคาสินค้าแต่ละชนิด</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:28px">ลำดับ</th>
                <th>รายการ</th>
                <th style="width:75px">น้ำหนัก (น.)</th>
                <th style="width:65px">ราคา/น.</th>
                <th style="width:75px">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, i) => `
                <tr>
                  <td class="cen">${i + 1}</td>
                  <td>${item.name}</td>
                  <td class="num">${item.weight.toFixed(2)}</td>
                  <td class="num">${item.price.toFixed(2)}</td>
                  <td class="num">${(item.weight * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${[...Array(Math.max(0, 8 - data.items.length))].map((_, i) => `
                <tr>
                  <td class="cen" style="color:#ccc">${data.items.length + i + 1}</td>
                  <td></td><td></td><td></td><td></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align:right">รวมทั้งสิ้น</td>
                <td class="num">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p class="note">* น้ำหนักสุทธิ ซึ่งอาจละเอียดเป็นขีด แตกต่างในรูปตัวเลขคณิต</p>
          <div class="sign">
            <div class="sign-line">ผู้รับ</div>
            <div class="sign-line">ผู้ส่ง</div>
            <div class="sign-line">ผู้ตรวจ</div>
          </div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div className="max-w-3xl space-y-4">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">ใบรับสินค้า</h2>
          <p className="text-sm text-slate-400">{data.receiptNo}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/purchase')} className="btn-secondary">← กลับ</button>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            🖨️ พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="card p-6" ref={printRef}>

        {/* หัวร้าน */}
        <div className="text-center border-b border-slate-200 pb-4 mb-4">
          <h1 className="text-xl font-bold text-slate-800">{SHOP.th}</h1>
          <p className="text-sm font-medium text-slate-500 tracking-wide">{SHOP.en}</p>
          <p className="text-sm text-slate-400">โทร {SHOP.phone} ({SHOP.hours})</p>
          <p className="text-base font-semibold mt-2 pt-2 border-t border-slate-200">ใบรับสินค้า</p>
        </div>

        {/* Meta */}
        <div className="flex justify-between text-sm mb-5">
          <div className="space-y-1">
            <p><span className="text-slate-400">เลขที่:</span>{' '}
              <span className="font-mono font-medium">{data.receiptNo}</span></p>
            <p><span className="text-slate-400">ชื่อผู้ขาย:</span> {data.sellerName}</p>
          </div>
          <div className="text-right space-y-1">
            <p><span className="text-slate-400">วันที่:</span> {data.date}</p>
            <p className="text-xs text-slate-400">ราคาสินค้าแต่ละชนิด</p>
          </div>
        </div>

        {/* ตาราง */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500">
              <th className="border border-slate-200 px-2 py-2 text-center w-8">ลำดับ</th>
              <th className="border border-slate-200 px-3 py-2 text-left">รายการ</th>
              <th className="border border-slate-200 px-3 py-2 text-center w-24">น้ำหนัก (น.)</th>
              <th className="border border-slate-200 px-3 py-2 text-center w-20">ราคา/น.</th>
              <th className="border border-slate-200 px-3 py-2 text-right w-24">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="border border-slate-100 px-2 py-2 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-100 px-3 py-2">{item.name}</td>
                <td className="border border-slate-100 px-3 py-2 text-center font-mono">{item.weight.toFixed(2)}</td>
                <td className="border border-slate-100 px-3 py-2 text-center font-mono">{item.price.toFixed(2)}</td>
                <td className="border border-slate-100 px-3 py-2 text-right font-mono">
                  {(item.weight * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
            {[...Array(Math.max(0, 8 - data.items.length))].map((_, i) => (
              <tr key={`e${i}`}>
                <td className="border border-slate-100 px-2 py-3 text-center text-slate-200">
                  {data.items.length + i + 1}
                </td>
                <td className="border border-slate-100" colSpan={4}></td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <td colSpan={4} className="border border-slate-200 px-3 py-2 text-right">รวมทั้งสิ้น</td>
              <td className="border border-slate-200 px-3 py-2 text-right font-mono text-brand-700 text-base">
                {total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs text-slate-400 mb-8">
          * น้ำหนักสุทธิ ซึ่งอาจละเอียดเป็นขีด แตกต่างในรูปตัวเลขคณิต
        </p>

        <div className="flex justify-around mt-4">
          {['ผู้รับ', 'ผู้ส่ง', 'ผู้ตรวจ'].map(label => (
            <div key={label} className="text-center w-36">
              <div className="h-12"></div>
              <div className="border-t border-slate-400 pt-1 text-sm text-slate-500">({label})</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
