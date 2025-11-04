import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import ProjectPanel from './components/ProjectPanel'
import Filters from './components/Filters'
import LogsTable from './components/LogsTable'
import { Code, BarChart2 } from 'lucide-react'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function CodeBlock({ title, code }) {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <div className="px-3 py-2 text-xs text-slate-300 bg-slate-800/70">{title}</div>
      <pre className="p-3 text-xs text-slate-100 overflow-auto"><code>{code}</code></pre>
    </div>
  )
}

function Stats({ backendUrl, project }) {
  const [stats, setStats] = useState({ total: 0, last_24h: 0, by_status: {} })
  useEffect(() => {
    if (!project) return
    async function load() {
      const params = new URLSearchParams({ project_id: project.id })
      const res = await fetch(`${backendUrl}/api/stats?` + params.toString())
      setStats(await res.json())
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [project?.id])

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-xs text-slate-500">Total Logs</div>
        <div className="text-2xl font-semibold">{stats.total}</div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-xs text-slate-500">Last 24 hours</div>
        <div className="text-2xl font-semibold">{stats.last_24h}</div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="text-xs text-slate-500">By status</div>
        <div className="text-sm text-slate-700 flex gap-2 flex-wrap">
          {Object.entries(stats.by_status || {}).map(([k,v])=> (
            <span key={k} className="px-2 py-1 rounded bg-slate-100">{k}: {v}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [project, setProject] = useState(null)
  const [filters, setFilters] = useState({})
  const [snippets, setSnippets] = useState({ express: '', hono: '' })

  useEffect(() => {
    async function load() {
      const res = await fetch(`${backendUrl}/api/snippets`)
      setSnippets(await res.json())
    }
    load()
  }, [])

  const expressSnippet = useMemo(() => snippets.express?.replace('https://your-backend-url', backendUrl), [snippets, backendUrl])
  const honoSnippet = useMemo(() => snippets.hono?.replace('https://your-backend-url', backendUrl), [snippets, backendUrl])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <ProjectPanel backendUrl={backendUrl} onProjectSelected={setProject} />

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium"><BarChart2 size={18}/> Quick stats</div>
            <Stats backendUrl={backendUrl} project={project} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium"><Code size={18}/> Integration</div>
            <p className="text-sm text-slate-600">Attach the middleware to your API service. Use the project key when sending logs.</p>
            <CodeBlock title="Express.js" code={(expressSnippet || '').replace('your-backend-url', backendUrl)} />
            <CodeBlock title="Hono.js" code={(honoSnippet || '').replace('your-backend-url', backendUrl)} />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <Filters onChange={setFilters} />
          <LogsTable backendUrl={backendUrl} project={project} filters={filters} />
        </div>
      </main>
    </div>
  )
}
