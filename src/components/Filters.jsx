import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function Filters({ value, onChange, delay = 500 }) {
  const [text, setText] = useState(value || "");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange?.(text), delay);
    return () => clearTimeout(t);
  }, [text, delay, onChange]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Filter logs (status, path, method, message)"
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
