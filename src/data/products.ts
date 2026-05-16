export interface Product {
  code:      string
  name:      string
  refPrice:  number  // ราคาซื้ออ้างอิง ฿/กก.
  sellPrice: number  // ราคาขายอ้างอิง ฿/กก.
}

const STORAGE_KEY = 'kankrong_products'

export const DEFAULT_PRODUCTS: Product[] = [
  { code: 'CR1',  name: 'ทองแดงปอกสวย1',           refPrice: 386, sellPrice: 420 },
  { code: 'CR2',  name: 'ทองแดงช็อต2',              refPrice: 376, sellPrice: 410 },
  { code: 'CR3',  name: 'ทองแดงเส้นใหญ่3',           refPrice: 360, sellPrice: 395 },
  { code: 'CR4',  name: 'ทองแดงเส้นเล็ก4',           refPrice: 355, sellPrice: 390 },
  { code: 'CR5',  name: 'ทองแดงเผา',                refPrice: 340, sellPrice: 375 },
  { code: 'CR6',  name: 'ทองเหลือง',                refPrice: 200, sellPrice: 220 },
  { code: 'CR7',  name: 'มีเนียมบาง',               refPrice: 64,  sellPrice: 72  },
  { code: 'CR8',  name: 'มีเนียมหนา',               refPrice: 63,  sellPrice: 70  },
  { code: 'CR9',  name: 'มีเนียมฉาก',               refPrice: 60,  sellPrice: 67  },
  { code: 'CR10', name: 'มีเนียมกระป๋อง',           refPrice: 71,  sellPrice: 78  },
  { code: 'CR11', name: 'หม้อน้ำทองแดง',            refPrice: 40,  sellPrice: 45  },
  { code: 'CR12', name: 'มีมีเนียมไส้ทองแดง',       refPrice: 55,  sellPrice: 62  },
  { code: 'CR13', name: 'มีมีเนียมไส้ทองเหลือง',    refPrice: 50,  sellPrice: 57  },
  { code: 'CR14', name: 'มู่ลี่',                   refPrice: 30,  sellPrice: 35  },
  { code: 'CR15', name: 'มีเนียมจั๊บ',              refPrice: 45,  sellPrice: 52  },
  { code: 'CR16', name: 'ตะกั่ว',                   refPrice: 35,  sellPrice: 40  },
  { code: 'CR17', name: 'กระทะ',                    refPrice: 40,  sellPrice: 45  },
  { code: 'CR18', name: 'มีเนียมติดเหล็ก',          refPrice: 25,  sellPrice: 28  },
  { code: 'CR19', name: 'มีเนียมสายไฟ',             refPrice: 80,  sellPrice: 88  },
  { code: 'CR20', name: 'มีเนียมติดเปลือก',         refPrice: 20,  sellPrice: 23  },
  { code: 'CR21', name: 'มอเตอร์',                  refPrice: 15,  sellPrice: 18  },
  { code: 'CR22', name: 'ทองแดงติดเปลือก',          refPrice: 100, sellPrice: 115 },
  { code: 'CR23', name: 'พลาสติกสี',                refPrice: 4,   sellPrice: 5   },
  { code: 'CR24', name: 'พลาสติกใส',                refPrice: 8,   sellPrice: 9   },
  { code: 'CR25', name: 'พลาสติกใส 2',              refPrice: 6,   sellPrice: 7   },
  { code: 'CR26', name: 'พลาสติกกรอบ',              refPrice: 3,   sellPrice: 4   },
  { code: 'CR27', name: 'ท่อฟ้า',                   refPrice: 2,   sellPrice: 3   },
  { code: 'CR28', name: 'สายยาง',                   refPrice: 2,   sellPrice: 3   },
  { code: 'CR29', name: 'เปลือกสายไฟ',              refPrice: 3,   sellPrice: 4   },
  { code: 'CR30', name: 'รองเท้าบูท',               refPrice: 2,   sellPrice: 3   },
  { code: 'CR31', name: 'รองเท้า',                  refPrice: 2,   sellPrice: 3   },
  { code: 'CR32', name: 'เหล็กหนา',                 refPrice: 25,  sellPrice: 28  },
  { code: 'CR33', name: 'เหล็กบาง',                 refPrice: 6,   sellPrice: 7   },
  { code: 'CR34', name: 'สังกะสี',                  refPrice: 5,   sellPrice: 6   },
  { code: 'CR35', name: 'กระป๋องกาแฟ',              refPrice: 4,   sellPrice: 5   },
  { code: 'CR36', name: 'กระดาษลัง',                refPrice: 3,   sellPrice: 4   },
  { code: 'CR37', name: 'กระดาษเศษ',                refPrice: 2,   sellPrice: 3   },
  { code: 'CR38', name: 'กระดาษขาวดำ',              refPrice: 3,   sellPrice: 4   },
  { code: 'CR39', name: 'ลังเปล่า',                 refPrice: 3,   sellPrice: 4   },
  { code: 'CR40', name: 'เหล้าเล็ก',                refPrice: 5,   sellPrice: 6   },
  { code: 'CR41', name: 'เหล้าใหญ่',                refPrice: 8,   sellPrice: 9   },
  { code: 'CR42', name: 'ช้าง',                     refPrice: 5,   sellPrice: 6   },
  { code: 'CR43', name: 'ลีโอ',                     refPrice: 15,  sellPrice: 17  },
  { code: 'CR44', name: 'สิงห์',                    refPrice: 10,  sellPrice: 12  },
  { code: 'CR45', name: 'หงส์กลม',                  refPrice: 8,   sellPrice: 9   },
  { code: 'CR46', name: 'หงส์แบน',                  refPrice: 8,   sellPrice: 9   },
  { code: 'CR47', name: 'คอยาวรวม',                 refPrice: 6,   sellPrice: 7   },
  { code: 'CR48', name: 'ข้าวหอมเล็ก',              refPrice: 5,   sellPrice: 6   },
  { code: 'CR49', name: 'ข้าวหอมใหญ่',              refPrice: 7,   sellPrice: 8   },
  { code: 'CR50', name: 'นิยมไทยเล็ก',              refPrice: 5,   sellPrice: 6   },
  { code: 'CR51', name: 'นิยมไทยใหญ่',              refPrice: 7,   sellPrice: 8   },
  { code: 'CR52', name: 'พญานาค',                   refPrice: 6,   sellPrice: 7   },
  { code: 'CR53', name: 'นุ่นหมอน',                 refPrice: 5,   sellPrice: 6   },
  { code: 'CR54', name: 'นุ่นที่นอน',               refPrice: 4,   sellPrice: 5   },
  { code: 'CR55', name: 'พัดลม',                    refPrice: 10,  sellPrice: 12  },
  { code: 'CR56', name: 'ตู้เย็น',                  refPrice: 15,  sellPrice: 18  },
  { code: 'CR57', name: 'เครื่องซักผ้า',            refPrice: 15,  sellPrice: 18  },
  { code: 'CR58', name: 'ทีวีเล็ก',                 refPrice: 5,   sellPrice: 6   },
  { code: 'CR59', name: 'ทีวีกลาง',                 refPrice: 8,   sellPrice: 10  },
  { code: 'CR60', name: 'ทีวีใหญ่',                 refPrice: 10,  sellPrice: 12  },
  { code: 'CR61', name: 'จอแบนใหญ่',                refPrice: 8,   sellPrice: 10  },
  { code: 'CR62', name: 'จอแบนเล็ก',                refPrice: 5,   sellPrice: 6   },
  { code: 'CR63', name: 'จอคอมนูน',                 refPrice: 5,   sellPrice: 6   },
  { code: 'CR64', name: 'จอคอมแบน',                 refPrice: 5,   sellPrice: 6   },
  { code: 'CR65', name: 'คอมชุด',                   refPrice: 20,  sellPrice: 25  },
  { code: 'CR66', name: 'CPU',                      refPrice: 10,  sellPrice: 12  },
  { code: 'CR67', name: 'ขวดแก้วแดง',               refPrice: 1,   sellPrice: 2   },
  { code: 'CR68', name: 'ขวดแก้วขาว',               refPrice: 1,   sellPrice: 2   },
  { code: 'CR69', name: 'ขวดแก้วเขียว',             refPrice: 1,   sellPrice: 2   },
  { code: 'CR70', name: 'ขวดรวม',                   refPrice: 1,   sellPrice: 2   },
  { code: 'CR71', name: 'สแตนเลส',                  refPrice: 30,  sellPrice: 34  },
  { code: 'CR72', name: 'แบตเล็ก',                  refPrice: 26,  sellPrice: 30  },
  { code: 'CR73', name: 'แบตใหญ่',                  refPrice: 27,  sellPrice: 31  },
  { code: 'CR74', name: 'แบตทรู',                   refPrice: 23,  sellPrice: 27  },
  { code: 'CR75', name: 'ซีล',                      refPrice: 5,   sellPrice: 6   },
  { code: 'CR76', name: 'ข้าวแห้ง',                 refPrice: 3,   sellPrice: 4   },
  { code: 'CR77', name: 'เพทสกรีน',                 refPrice: 2,   sellPrice: 3   },
  { code: 'CR78', name: 'ถังแก๊ส',                  refPrice: 10,  sellPrice: 12  },
  { code: 'CR79', name: 'มอไซค์',                   refPrice: 15,  sellPrice: 18  },
  { code: 'CR80', name: 'ของแกะ',                   refPrice: 5,   sellPrice: 6   },
  { code: 'CR81', name: 'เครื่องตัดหญ้า',           refPrice: 15,  sellPrice: 18  },
  { code: 'CR82', name: 'อาชา',                     refPrice: 5,   sellPrice: 6   },
  { code: 'CR83', name: 'กระดาษสี',                 refPrice: 2,   sellPrice: 3   },
  { code: 'CR84', name: 'พลาสติกรวม',               refPrice: 4,   sellPrice: 5   },
  { code: 'CR86', name: 'ซีดี',                     refPrice: 3,   sellPrice: 4   },
]

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Product[]
  } catch {}
  return DEFAULT_PRODUCTS
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function nextProductCode(products: Product[]): string {
  const nums = products
    .map(p => parseInt(p.code.replace('CR', '')))
    .filter(n => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 78
  return `CR${max + 1}`
}
