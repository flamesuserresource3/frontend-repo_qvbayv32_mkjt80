import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import ProjectPanel from "./components/ProjectPanel.jsx";
import Filters from "./components/Filters.jsx";
import LogsTable from "./components/LogsTable.jsx";
import { BarChart3, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function CodeBlock({ title, code, language = "" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-auto p-4 text-xs"><code className={`language-${language}`}>{code}</code></pre>
    </div>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("");
  const [stats, setStats] = useState(null);
  const [snippets, setSnippets] = useState({ express: "", hono: "" });
  const [loadingStats, setLoadingStats] = useState(false);

  // fetch backend health and snippets once
  useEffect(() => {
    const run = async () => {
      try {
        await fetch(`${BACKEND_URL}/`);
      } catch {
        // ignore health errors
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/snippets`);
        if (res.ok) {
          const data = await res.json();
          setSnippets({
            express: data.express || "",
            hono: data.hono || "",
          });
        }
      } catch {
        // ignore
      }
    };
    run();
  }, []);

  // stats polling for selected project
  useEffect(() => {
    if (!selectedProject?.id) return;
    let t;
    const load = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/stats?project_id=${selectedProject.id}`);
        if (!res.ok) throw new Error("stats failed");
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
    t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [selectedProject]);

  const projectPanel = ProjectPanel({ onSelect: setSelectedProject });

  const expressSnippet = useMemo(() => {
    const url = BACKEND_URL;
    return (
      snippets.express || `// Express.js middleware\nconst API_KEY = process.env.ZLOG_API_KEY;\nconst BASE_URL = '${url}';\n\nmodule.exports = function zlog(req, res, next) {\n  const start = Date.now();\n  res.on('finish', async () => {\n    const payload = {\n      method: req.method, path: req.originalUrl, status: res.statusCode,\n      ip: req.ip, latency_ms: Date.now()-start, message: res.statusMessage\n    };\n    try {\n      await fetch(BASE_URL + '/ingest', {\n        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },\n        body: JSON.stringify(payload)\n      });\n    } catch (e) {}\n  });\n  next();\n};`
    );
  }, [snippets.express]);

  const honoSnippet = useMemo(() => {
    const url = BACKEND_URL;
    return (
      snippets.hono || `// Hono.js middleware\nimport { Hono } from 'hono'\nconst API_KEY = process.env.ZLOG_API_KEY\nconst BASE_URL = '${url}'\n\nexport const zlog = async (c, next) => {\n  const start = Date.now()\n  await next()\n  const payload = {\n    method: c.req.method, path: c.req.path, status: c.res.status,\n    ip: c.req.header('x-forwarded-for') || '', latency_ms: Date.now()-start, message: ''\n  }\n  try {\n    await fetch(BASE_URL + '/ingest', {\n      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },\n      body: JSON.stringify(payload)\n    })\n  } catch (e) {}\n}`
    );
  }, [snippets.hono]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {projectPanel.ui}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Stats</h2>
              {!selectedProject ? (
                <p className="text-sm text-slate-500">Pilih proyek untuk melihat statistik.</p>
              ) : loadingStats ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat statistik…
                </div>
              ) : stats ? (
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total" value={stats.total ?? 0} />
                  <StatCard label="24 Jam" value={stats.last_24h ?? 0} />
                  <StatCard label="Errors" value={stats.by_status?.["5xx"] ?? 0} />
                </div>
              ) : (
                <p className="text-sm text-slate-500">Tidak ada data statistik.</p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Integrations</h2>
              <div className="space-y-3">
                <CodeBlock title="Express.js" code={expressSnippet} language="js" />
                <CodeBlock title="Hono.js" code={honoSnippet} language="js" />
              </div>
            </section>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Logs</h2>
                <div className="flex items-center gap-2 text-slate-500">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs">Auto refresh 5s</span>
                </div>
              </div>
              <div className="mb-3">
                <Filters value={filter} onChange={setFilter} />
              </div>
              {selectedProject ? (
                <LogsTable projectId={selectedProject.id} query={filter} />
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  Pilih proyek terlebih dahulu untuk melihat log.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
