import { useState } from 'react'
import { loadProducts, saveProducts, nextProductCode, type Product } from '../data/products'
import {
  loadCategories,
  saveCategories,
  loadCatAssignments,
  saveCatAssignments,
  getCatKey,
  defaultCatKey,
  type Category,
} from '../data/categories'

const BLANK: Omit<Product, 'code'> = { name: '', refPrice: 0, sellPrice: 0 }

export default function ProductsPage() {
  const [products,    setProducts]    = useState<Product[]>(loadProducts)
  const [categories,  setCategories]  = useState<Category[]>(loadCategories)
  const [assignments, setAssignments] = useState<Record<string, string>>(loadCatAssignments)
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState<string>('all')
  const [dirty,       setDirty]       = useState(false)
  const [addMode,     setAddMode]     = useState(false)
  const [newItem,     setNewItem]     = useState<Omit<Product, 'code'>>(BLANK)
  const [newItemCat,  setNewItemCat]  = useState<string>('')
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)
  const [catMgrOpen,  setCatMgrOpen]  = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [editCatKey,  setEditCatKey]  = useState<string | null>(null)
  const [editCatVal,  setEditCatVal]  = useState('')

  const update = (code: string, field: keyof Product, raw: string) => {
    setProducts(prev => prev.map(p =>
      p.code === code
        ? { ...p, [field]: field === 'name' ? raw : Number(raw) || 0 }
        : p
    ))
    setDirty(true)
  }

  const handleSave = () => {
    saveProducts(products)
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCatChange = (code: string, catKey: string) => {
    const updated = { ...assignments, [code]: catKey }
    setAssignments(updated)
    saveCatAssignments(updated)
  }

  const handleAdd = () => {
    if (!newItem.name.trim()) return
    const code = nextProductCode(products)
    const added = [...products, { code, ...newItem }]
    setProducts(added)
    saveProducts(added)
    if (newItemCat) {
      const updatedAssign = { ...assignments, [code]: newItemCat }
      setAssignments(updatedAssign)
      saveCatAssignments(updatedAssign)
    }
    setNewItem(BLANK)
    setNewItemCat('')
    setAddMode(false)
    setDirty(false)
  }

  const handleDelete = (code: string) => {
    const updated = products.filter(p => p.code !== code)
    setProducts(updated)
    saveProducts(updated)
    const { [code]: _removed, ...restAssign } = assignments
    setAssignments(restAssign)
    saveCatAssignments(restAssign)
    setDeleteId(null)
    setDirty(false)
  }

  const handleAddCategory = () => {
    const label = newCatLabel.trim()
    if (!label) return
    const key = label
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') || `cat_${Date.now()}`
    const uniqueKey = categories.some(c => c.key === key) ? `${key}_${Date.now()}` : key
    const updated = [...categories, { key: uniqueKey, label }]
    setCategories(updated)
    saveCategories(updated)
    setNewCatLabel('')
  }

  const handleDeleteCategory = (key: string) => {
    const updated = categories.filter(c => c.key !== key)
    setCategories(updated)
    saveCategories(updated)
  }

  const startEditCat = (cat: { key: string; label: string }) => {
    setEditCatKey(cat.key)
    setEditCatVal(cat.label)
  }

  const commitEditCat = () => {
    if (!editCatKey) return
    const label = editCatVal.trim()
    if (!label) { setEditCatKey(null); return }
    const updated = categories.map(c => c.key === editCatKey ? { ...c, label } : c)
    setCategories(updated)
    saveCategories(updated)
    setEditCatKey(null)
  }

  const productCountForCat = (key: string) =>
    products.filter(p => getCatKey(p.code, assignments) === key).length

  const filtered = products
    .filter(p => catFilter === 'all' || getCatKey(p.code, assignments) === catFilter)
    .filter(p => !search || p.name.includes(search) || p.code.toLowerCase().includes(search.toLowerCase()))

  const inputCls = 'w-full text-sm bg-transparent border border-transparent rounded px-1.5 py-1 font-mono text-right focus:bg-white focus:border-brand-300 focus:outline-none transition-colors'

  const catLabel = (key: string) => {
    if (key === 'all') return 'ทั้งหมด'
    return categories.find(c => c.key === key)?.label ?? key
  }

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">จัดการสินค้า</h2>
          <p className="text-sm text-slate-400 mt-0.5">แก้ไขราคาได้โดยคลิกที่ช่องราคา · บันทึกอัตโนมัติเมื่อกด "บันทึก"</p>
        </div>
        <div className="flex gap-2 items-center">
          {dirty && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
              มีการเปลี่ยนแปลงที่ยังไม่บันทึก
            </span>
          )}
          {saved && (
            <span className="text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-lg">
              บันทึกแล้ว ✓
            </span>
          )}
          <button onClick={() => setAddMode(true)} className="btn-secondary text-sm py-1.5 px-4">
            + เพิ่มสินค้า
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            บันทึก
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">สินค้าทั้งหมด</p>
          <p className="text-2xl font-semibold">
            {products.length}
            <span className="text-sm font-normal text-slate-400 ml-1">ประเภท</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ราคาซื้อเฉลี่ย</p>
          <p className="text-2xl font-semibold font-mono">
            ฿{products.length ? (products.reduce((s, p) => s + p.refPrice, 0) / products.length).toFixed(0) : '0'}
            <span className="text-sm font-normal text-slate-400 ml-1">/กก.</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">ราคาขายเฉลี่ย</p>
          <p className="text-2xl font-semibold font-mono text-brand-600">
            ฿{products.length ? (products.reduce((s, p) => s + p.sellPrice, 0) / products.length).toFixed(0) : '0'}
            <span className="text-sm font-normal text-slate-400 ml-1">/กก.</span>
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs text-sm"
          placeholder="ค้นหา ชื่อ หรือ รหัส..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5 items-center">
          {(['all', ...categories.map(c => c.key)] as string[]).map(key => {
            const count = key === 'all'
              ? products.length
              : products.filter(p => getCatKey(p.code, assignments) === key).length
            if (key !== 'all' && count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setCatFilter(key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                  ${catFilter === key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
              >
                {catLabel(key)}{key !== 'all' && <span className="ml-1 opacity-60">({count})</span>}
              </button>
            )
          })}
          <button
            onClick={() => setCatMgrOpen(true)}
            title="จัดการหมวดหมู่"
            className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100">
              <th className="px-4 py-3 text-left w-16">รหัส</th>
              <th className="px-4 py-3 text-left">ชื่อสินค้า</th>
              <th className="px-4 py-3 text-left w-44">หมวดหมู่</th>
              <th className="px-4 py-3 text-right w-32">ราคาซื้อ (฿/กก.)</th>
              <th className="px-4 py-3 text-right w-32">ราคาขาย (฿/กก.)</th>
              <th className="px-4 py-3 text-right w-20">margin</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const margin = p.refPrice > 0
                ? (((p.sellPrice - p.refPrice) / p.sellPrice) * 100).toFixed(1)
                : '—'
              const currentCatKey = getCatKey(p.code, assignments)
              return (
                <tr key={p.code} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                  <td className="px-4 py-2 font-mono text-xs text-slate-400">{p.code}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full text-sm bg-transparent border border-transparent rounded px-1.5 py-1 focus:bg-white focus:border-brand-300 focus:outline-none transition-colors"
                      value={p.name}
                      onChange={e => update(p.code, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="w-full text-xs bg-transparent border border-transparent rounded px-1.5 py-1 focus:bg-white focus:border-brand-300 focus:outline-none transition-colors cursor-pointer"
                      value={currentCatKey}
                      onChange={e => handleCatChange(p.code, e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number" min="0" step="1"
                      className={inputCls}
                      value={p.refPrice}
                      onChange={e => update(p.code, 'refPrice', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number" min="0" step="1"
                      className={inputCls}
                      value={p.sellPrice}
                      onChange={e => update(p.code, 'sellPrice', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${Number(margin) >= 10
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'}`}>
                      {margin}{margin !== '—' ? '%' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setDeleteId(p.code)}
                      className="text-slate-200 hover:text-red-400 transition-colors text-base opacity-0 group-hover:opacity-100"
                      title="ลบสินค้า"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-400">ไม่พบสินค้าที่ค้นหา</p>
        )}
      </div>

      {/* Add new product modal */}
      {addMode && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-semibold text-slate-800">เพิ่มสินค้าใหม่</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อสินค้า <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="เช่น ทองแดงพิเศษ"
                  value={newItem.name}
                  onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">หมวดหมู่</label>
                <select
                  className="input text-sm"
                  value={newItemCat}
                  onChange={e => setNewItemCat(e.target.value)}
                >
                  <option value="">— ตามค่าเริ่มต้น —</option>
                  {categories.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">ราคาซื้อ (฿/กก.)</label>
                  <input
                    type="number" min="0" step="1"
                    className="input font-mono"
                    placeholder="0"
                    value={newItem.refPrice || ''}
                    onChange={e => setNewItem(prev => ({ ...prev, refPrice: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">ราคาขาย (฿/กก.)</label>
                  <input
                    type="number" min="0" step="1"
                    className="input font-mono"
                    placeholder="0"
                    value={newItem.sellPrice || ''}
                    onChange={e => setNewItem(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                รหัสสินค้าจะถูกกำหนดอัตโนมัติ: <span className="font-mono font-medium">{nextProductCode(products)}</span>
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setAddMode(false); setNewItem(BLANK); setNewItemCat('') }}
                className="btn-secondary text-sm py-1.5 px-4"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAdd}
                disabled={!newItem.name.trim()}
                className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                เพิ่มสินค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">ยืนยันการลบ</h3>
            <p className="text-sm text-slate-600">
              ต้องการลบ <span className="font-medium">
                {products.find(p => p.code === deleteId)?.name}
              </span> ({deleteId}) ออกจากระบบ?
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm py-1.5 px-4">
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="text-sm py-1.5 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                ลบสินค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category manager modal */}
      {catMgrOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">จัดการหมวดหมู่</h3>
              <button
                onClick={() => setCatMgrOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {categories.map(cat => {
                const count   = productCountForCat(cat.key)
                const editing = editCatKey === cat.key
                return (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50 gap-2"
                  >
                    {editing ? (
                      <input
                        autoFocus
                        className="flex-1 text-sm border border-brand-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
                        value={editCatVal}
                        onChange={e => setEditCatVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEditCat()
                          if (e.key === 'Escape') setEditCatKey(null)
                        }}
                        onBlur={commitEditCat}
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate">{cat.label}</span>
                        <button
                          onClick={() => startEditCat(cat)}
                          className="text-xs text-slate-300 hover:text-brand-500 transition-colors flex-shrink-0"
                          title="แก้ไขชื่อ"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${count > 0
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-100 text-slate-400'}`}>
                        {count} สินค้า
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.key)}
                        disabled={count > 0}
                        title={count > 0 ? `ไม่สามารถลบได้ มีสินค้า ${count} รายการ` : 'ลบหมวดหมู่'}
                        className="text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add category input */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">เพิ่มหมวดหมู่ใหม่</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1 text-sm"
                  placeholder="ชื่อหมวดหมู่ เช่น ยาง"
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatLabel.trim()}
                  className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
