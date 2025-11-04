import { Rocket, Settings, Github } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">ZLog</p>
            <h1 className="-mt-0.5 text-lg font-semibold leading-tight text-slate-900">
              Web API Logger Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            onClick={() => alert("Settings coming soon")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
