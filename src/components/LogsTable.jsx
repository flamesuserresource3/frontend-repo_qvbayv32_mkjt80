import { useEffect, useMemo, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function LogsTable({ projectId, query, refreshMs = 5000 }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (projectId) params.set("project_id", projectId);
      if (query) params.set("q", query);
      params.set("limit", "200");
      const res = await fetch(`${BACKEND_URL}/api/logs?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : data.logs || []);
    } catch (e) {
      setError("Gagal memuat log. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(load, refreshMs);
    return () => timer.current && clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, query, refreshMs]);

  const columns = useMemo(
    () => ["time", "status", "method", "path", "ip", "latency_ms", "message"],
    []
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {c.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id || `${r.time}-${r.path}-${r.method}`} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-700">{r.time ? new Date(r.time).toLocaleString() : ""}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs font-medium">
                  <span
                    className={
                      "inline-flex rounded px-2 py-0.5 " +
                      (r.status >= 500
                        ? "bg-red-100 text-red-700"
                        : r.status >= 400
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700")
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs font-mono text-slate-700">{r.method}</td>
                <td className="max-w-[28rem] truncate px-3 py-2 text-sm text-slate-900" title={r.path}>
                  {r.path}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">{r.ip || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">{r.latency_ms ?? "-"}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.message || ""}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-slate-500">
                  Tidak ada data untuk ditampilkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && (
        <div className="border-t border-slate-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
