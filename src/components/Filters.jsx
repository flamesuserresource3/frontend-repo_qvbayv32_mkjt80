import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export default function Filters({ onChange }) {
  const [q, setQ] = useState('')

  useEffect(() => {
    const t = setTimeout(()=> onChange({ q }), 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2">
      <Search size={16} className="text-slate-500" />
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter by path, method, service, framework" className="flex-1 outline-none" />
    </div>
  )
}
