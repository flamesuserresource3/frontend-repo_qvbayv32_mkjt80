import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, KeyRound } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function ProjectPanel({ onSelect }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (e) {
      setError("Gagal memuat proyek. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Project ${new Date().toLocaleString()}` }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchProjects();
    } catch (e) {
      setError("Gagal membuat proyek. Periksa backend.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const sorted = useMemo(
    () => [...projects].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [projects]
  );

  return {
    projects: sorted,
    loading,
    error,
    ui: (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Projects</h2>
          <button
            onClick={createProject}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">Memuat…</div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name || p.id}</p>
                  <p className="text-xs text-slate-500">{p.created_at ? new Date(p.created_at).toLocaleString() : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.api_key && (
                    <button
                      onClick={() => handleCopy(p.api_key)}
                      title="Copy API Key"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Copy Key
                    </button>
                  )}
                  <button
                    onClick={() => onSelect?.(p)}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Pilih
                  </button>
                </div>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-500">Belum ada proyek. Buat satu untuk memulai.</li>
            )}
          </ul>
        )}
      </section>
    ),
  };
}
