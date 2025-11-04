import { Rocket, Activity, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/60 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center">
            <Rocket size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">ZLog</h1>
            <p className="text-xs text-slate-500 -mt-0.5">Monitor your API activity in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Activity size={18} />
          <Settings size={18} />
        </div>
      </div>
    </header>
  )
}
