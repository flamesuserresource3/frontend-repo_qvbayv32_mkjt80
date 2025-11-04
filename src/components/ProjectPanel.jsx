import { useEffect, useState } from 'react'
import { KeyRound, PlusCircle, Copy } from 'lucide-react'

export default function ProjectPanel({ backendUrl, onProjectSelected }) {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  async function fetchProjects() {
    try {
      const res = await fetch(`${backendUrl}/api/projects`)
      const data = await res.json()
      setProjects(data)
      if (data.length) onProjectSelected(data[0])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  async function createProject(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${backendUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const proj = await res.json()
      setProjects([proj, ...projects])
      onProjectSelected(proj)
      setName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Projects</h2>
      </div>
      <form onSubmit={createProject} className="flex gap-2 mb-4">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New project name"
               className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button disabled={creating} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg">
          <PlusCircle size={16} /> Create
        </button>
      </form>

      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={()=>onProjectSelected(p)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-slate-500">id: {p.id}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                  <KeyRound size={14} /> {p.api_key.slice(0,8)}•••
                </span>
                <button onClick={(e)=>{e.stopPropagation(); navigator.clipboard.writeText(p.api_key)}} className="p-2 hover:bg-slate-100 rounded">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
