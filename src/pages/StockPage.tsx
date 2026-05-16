import { useState } from 'react'

const PRODUCTS = [
  { code: 'CR1',  name: 'ทองแดงปอกสวย1',           refPrice: 386 },
  { code: 'CR2',  name: 'ทองแดงช็อต2',              refPrice: 376 },
  { code: 'CR3',  name: 'ทองแดงเส้นใหญ่3',           refPrice: 360 },
  { code: 'CR4',  name: 'ทองแดงเส้นเล็ก4',           refPrice: 355 },
  { code: 'CR5',  name: 'ทองแดงเผา',                refPrice: 340 },
  { code: 'CR6',  name: 'ทองเหลือง',                refPrice: 200 },
  { code: 'CR7',  name: 'มีเนียมบาง',               refPrice: 64  },
  { code: 'CR8',  name: 'มีเนียมหนา',               refPrice: 63  },
  { code: 'CR9',  name: 'มีเนียมฉาก',               refPrice: 60  },
  { code: 'CR10', name: 'มีเนียมกระป๋อง',           refPrice: 71  },
  { code: 'CR11', name: 'หม้อน้ำทองแดง',            refPrice: 40  },
  { code: 'CR12', name: 'มีมีเนียมไส้ทองแดง',       refPrice: 55  },
  { code: 'CR13', name: 'มีมีเนียมไส้ทองเหลือง',    refPrice: 50  },
  { code: 'CR14', name: 'มู่ลี่',                   refPrice: 30  },
  { code: 'CR15', name: 'มีเนียมจั๊บ',              refPrice: 45  },
  { code: 'CR16', name: 'ตะกั่ว',                   refPrice: 35  },
  { code: 'CR17', name: 'กระทะ',                    refPrice: 40  },
  { code: 'CR18', name: 'มีเนียมติดเหล็ก',          refPrice: 25  },
  { code: 'CR19', name: 'มีเนียมสายไฟ',             refPrice: 80  },
  { code: 'CR20', name: 'มีเนียมติดเปลือก',         refPrice: 20  },
  { code: 'CR21', name: 'มอเตอร์',                  refPrice: 15  },
  { code: 'CR22', name: 'ทองแดงติดเปลือก',          refPrice: 100 },
  { code: 'CR23', name: 'พลาสติกสี',                refPrice: 4   },
  { code: 'CR24', name: 'พลาสติกใส',                refPrice: 8   },
  { code: 'CR25', name: 'พลาสติกใส 2',              refPrice: 6   },
  { code: 'CR26', name: 'พลาสติกกรอบ',              refPrice: 3   },
  { code: 'CR27', name: 'ท่อฟ้า',                   refPrice: 2   },
  { code: 'CR28', name: 'สายยาง',                   refPrice: 2   },
  { code: 'CR29', name: 'เปลือกสายไฟ',              refPrice: 3   },
  { code: 'CR30', name: 'รองเท้าบูท',               refPrice: 2   },
  { code: 'CR31', name: 'รองเท้า',                  refPrice: 2   },
  { code: 'CR32', name: 'เหล็กหนา',                 refPrice: 25  },
  { code: 'CR33', name: 'เหล็กบาง',                 refPrice: 6   },
  { code: 'CR34', name: 'สังกะสี',                  refPrice: 5   },
  { code: 'CR35', name: 'กระป๋องกาแฟ',              refPrice: 4   },
  { code: 'CR36', name: 'กระดาษลัง',                refPrice: 3   },
  { code: 'CR37', name: 'กระดาษเศษ',                refPrice: 2   },
  { code: 'CR38', name: 'กระดาษขาวดำ',              refPrice: 3   },
  { code: 'CR39', name: 'ลังเปล่า',                 refPrice: 3   },
  { code: 'CR40', name: 'เหล้าเล็ก',                refPrice: 5   },
  { code: 'CR41', name: 'เหล้าใหญ่',                refPrice: 8   },
  { code: 'CR42', name: 'ช้าง',                     refPrice: 5   },
  { code: 'CR43', name: 'ลีโอ',                     refPrice: 15  },
  { code: 'CR44', name: 'สิงห์',                    refPrice: 10  },
  { code: 'CR45', name: 'หงส์กลม',                  refPrice: 8   },
  { code: 'CR46', name: 'หงส์แบน',                  refPrice: 8   },
  { code: 'CR47', name: 'คอยาวรวม',                 refPrice: 6   },
  { code: 'CR48', name: 'ข้าวหอมเล็ก',              refPrice: 5   },
  { code: 'CR49', name: 'ข้าวหอมใหญ่',              refPrice: 7   },
  { code: 'CR50', name: 'นิยมไทยเล็ก',              refPrice: 5   },
  { code: 'CR51', name: 'นิยมไทยใหญ่',              refPrice: 7   },
  { code: 'CR52', name: 'พญานาค',                   refPrice: 6   },
  { code: 'CR53', name: 'นุ่นหมอน',                 refPrice: 5   },
  { code: 'CR54', name: 'นุ่นที่นอน',               refPrice: 4   },
  { code: 'CR55', name: 'พัดลม',                    refPrice: 10  },
  { code: 'CR56', name: 'ตู้เย็น',                  refPrice: 15  },
  { code: 'CR57', name: 'เครื่องซักผ้า',            refPrice: 15  },
  { code: 'CR58', name: 'ทีวีเล็ก',                 refPrice: 5   },
  { code: 'CR59', name: 'ทีวีกลาง',                 refPrice: 8   },
  { code: 'CR60', name: 'ทีวีใหญ่',                 refPrice: 10  },
  { code: 'CR61', name: 'จอแบนใหญ่',                refPrice: 8   },
  { code: 'CR62', name: 'จอแบนเล็ก',                refPrice: 5   },
  { code: 'CR63', name: 'จอคอมนูน',                 refPrice: 5   },
  { code: 'CR64', name: 'จอคอมแบน',                 refPrice: 5   },
  { code: 'CR65', name: 'คอมชุด',                   refPrice: 20  },
  { code: 'CR66', name: 'CPU',                      refPrice: 10  },
  { code: 'CR67', name: 'ขวดแก้วแดง',               refPrice: 1   },
  { code: 'CR68', name: 'ขวดแก้วขาว',               refPrice: 1   },
  { code: 'CR69', name: 'ขวดแก้วเขียว',             refPrice: 1   },
  { code: 'CR70', name: 'ขวดรวม',                   refPrice: 1   },
  { code: 'CR71', name: 'สแตนเลส',                  refPrice: 30  },
  { code: 'CR72', name: 'แบตเล็ก',                  refPrice: 26  },
  { code: 'CR73', name: 'แบตใหญ่',                  refPrice: 27  },
  { code: 'CR74', name: 'แบตทรู',                   refPrice: 23  },
  { code: 'CR75', name: 'ซีล',                      refPrice: 5   },
  { code: 'CR76', name: 'ข้าวแห้ง',                 refPrice: 3   },
  { code: 'CR77', name: 'เพทสกรีน',                 refPrice: 2   },
  { code: 'CR78', name: 'ถังแก๊ส',                  refPrice: 10  },
]

type CatKey = 'all' | 'copper' | 'aluminum' | 'steel' | 'plastic' | 'paper' | 'glass' | 'electronics' | 'battery' | 'other'

function getCat(code: string): Exclude<CatKey, 'all'> {
  const n = parseInt(code.replace('CR', ''))
  if ([1,2,3,4,5,6,11,22].includes(n)) return 'copper'
  if (n >= 7 && n <= 20) return 'aluminum'
  if ([32,33,34,71].includes(n)) return 'steel'
  if (n >= 23 && n <= 31) return 'plastic'
  if (n >= 36 && n <= 39) return 'paper'
  if ([35,40,41,42,43,44,45,46,47,48,49,50,51,52,67,68,69,70].includes(n)) return 'glass'
  if (n >= 55 && n <= 66) return 'electronics'
  if ([72,73,74].includes(n)) return 'battery'
  return 'other'
}

const CAT_LABEL: Record<CatKey, string> = {
  all:         'ทั้งหมด',
  copper:      'ทองแดง/ทองเหลือง',
  aluminum:    'มีเนียม',
  steel:       'เหล็ก',
  plastic:     'พลาสติก',
  paper:       'กระดาษ',
  glass:       'แก้ว/ขวด',
  electronics: 'อิเล็กทรอนิกส์',
  battery:     'แบตเตอรี่',
  other:       'อื่นๆ',
}

function getCatBadge(cat: Exclude<CatKey, 'all'>) {
  const map: Record<Exclude<CatKey, 'all'>, string> = {
    copper:      'badge-copper',
    aluminum:    'bg-zinc-100 text-zinc-600 text-xs px-2 py-0.5 rounded-full font-medium',
    steel:       'badge-steel',
    plastic:     'badge-plastic',
    paper:       'badge-paper',
    glass:       'badge-glass',
    electronics: 'badge-electronics',
    battery:     'badge-battery',
    other:       'bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium',
  }
  return map[cat]
}

// สต็อกคงเหลือ ณ ปัจจุบัน (น้ำหนัก กก.)
const STOCK_SNAPSHOT: Record<string, number> = {
  CR1:  45.5,
  CR2:  12.3,
  CR3:   8.0,
  CR5:   6.5,
  CR6:  33.0,
  CR7: 125.0,
  CR8:  42.0,
  CR10: 87.5,
  CR11: 18.0,
  CR16: 55.0,
  CR19: 22.0,
  CR21: 48.0,
  CR22:  5.5,
  CR23: 210.0,
  CR24: 145.0,
  CR32: 580.0,
  CR33: 320.0,
  CR34: 145.0,
  CR36: 340.0,
  CR37: 220.0,
  CR42:  85.0,
  CR43:  30.0,
  CR71:  12.5,
  CR72:  45.0,
  CR73:  28.0,
  CR74:  15.0,
}

const CATS: CatKey[] = ['all','copper','aluminum','steel','plastic','paper','glass','electronics','battery','other']

export default function StockPage() {
  const [search, setSearch] = useState('')
  const [cat,    setCat]    = useState<CatKey>('all')

  const fmt = (n: number) =>
    new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n)

  const allRows = PRODUCTS
    .filter(p => STOCK_SNAPSHOT[p.code] !== undefined)
    .map(p => ({
      ...p,
      cat:    getCat(p.code),
      weight: STOCK_SNAPSHOT[p.code],
      value:  STOCK_SNAPSHOT[p.code] * p.refPrice,
    }))

  const filtered = allRows
    .filter(r => cat === 'all' || r.cat === cat)
    .filter(r =>
      !search ||
      r.name.includes(search) ||
      r.code.toLowerCase().includes(search.toLowerCase())
    )

  const totalWeight = filtered.reduce((s, r) => s + r.weight, 0)
  const totalValue  = filtered.reduce((s, r) => s + r.value,  0)

  const thDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-base font-semibold text-slate-800">สต็อกคงเหลือ</h2>
        <p className="text-sm text-slate-400 mt-0.5">ข้อมูล ณ {thDate}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">รายการในสต็อก</p>
          <p className="text-2xl font-semibold">{allRows.length}
            <span className="text-sm font-normal text-slate-400 ml-1">ประเภท</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">จาก 78 ประเภทสินค้าทั้งหมด</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">น้ำหนักรวม</p>
          <p className="text-2xl font-semibold font-mono">
            {allRows.reduce((s, r) => s + r.weight, 0).toLocaleString('th-TH', {
              minimumFractionDigits: 1, maximumFractionDigits: 1,
            })}
            <span className="text-sm font-normal text-slate-400 ml-1">กก.</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">น้ำหนักรวมทุกประเภท</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">มูลค่าประมาณ</p>
          <p className="text-2xl font-semibold text-brand-600">
            ฿{fmt(allRows.reduce((s, r) => s + r.value, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">คำนวณจากราคาอ้างอิงปัจจุบัน</p>
        </div>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs text-sm"
          placeholder="ค้นหา ชื่อสินค้า หรือ รหัส..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {CATS.map(c => {
            const count = c === 'all' ? allRows.length : allRows.filter(r => r.cat === c).length
            if (c !== 'all' && count === 0) return null
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium
                  ${cat === c
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
              >
                {CAT_LABEL[c]}
                {c !== 'all' && <span className="ml-1 opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 text-left">รหัส</th>
              <th className="px-5 py-3 text-left">ชื่อสินค้า</th>
              <th className="px-5 py-3 text-left">หมวดหมู่</th>
              <th className="px-5 py-3 text-right">น้ำหนัก (กก.)</th>
              <th className="px-5 py-3 text-right">ราคา/กก. (฿)</th>
              <th className="px-5 py-3 text-right">มูลค่า (฿)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                  ไม่พบรายการสินค้าที่ค้นหา
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.code}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-3">
                  <span className={getCatBadge(r.cat)}>{CAT_LABEL[r.cat]}</span>
                </td>
                <td className="px-5 py-3 text-right font-mono">
                  {r.weight.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
                <td className="px-5 py-3 text-right font-mono text-slate-500">{r.refPrice}</td>
                <td className="px-5 py-3 text-right font-mono font-medium text-brand-700">
                  {fmt(r.value)}
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={3} className="px-5 py-3 text-sm text-slate-500 font-medium">
                  รวม {filtered.length} รายการ
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-sm">
                  {totalWeight.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right font-mono font-semibold text-sm text-brand-700">
                  ฿{fmt(totalValue)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

    </div>
  )
}
