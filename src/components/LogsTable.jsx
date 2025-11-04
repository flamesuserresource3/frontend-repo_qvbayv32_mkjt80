import { useEffect, useState } from 'react'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function LogsTable({ backendUrl, project, filters }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!project) return
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ project_id: project.id })
        if (filters?.q) params.set('q', filters.q)
        params.set('limit', '200')
        const res = await fetch(`${backendUrl}/api/logs?` + params.toString(), { signal: controller.signal })
        const data = await res.json()
        setLogs(data)
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => { controller.abort(); clearInterval(t) }
  }, [project?.id, filters?.q])

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <div className="font-medium">Logs {project ? `• ${project.name}` : ''}</div>
        {loading && <div className="text-xs text-slate-500">Refreshing…</div>}
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Service</th>
              <th className="text-left px-4 py-2">Framework</th>
              <th className="text-left px-4 py-2">Method</th>
              <th className="text-left px-4 py-2">Path</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Duration</th>
              <th className="text-left px-4 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(l.created_at)}</td>
                <td className="px-4 py-2">{l.service || '-'}</td>
                <td className="px-4 py-2">{l.framework || '-'}</td>
                <td className="px-4 py-2">{l.method || '-'}</td>
                <td className="px-4 py-2 font-mono text-xs">{l.path || '-'}</td>
                <td className="px-4 py-2">{l.status ?? '-'}</td>
                <td className="px-4 py-2">{l.duration_ms ? `${l.duration_ms} ms` : '-'}</td>
                <td className="px-4 py-2">{l.ip || '-'}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-slate-500">No logs yet. Hook up the middleware to start seeing requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
