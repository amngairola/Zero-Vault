import React, { memo } from "react";
import { ShieldCheck, Terminal } from "lucide-react";

const Navbar = memo(({ debugMode, setDebugMode }) => (
  <nav className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl sticky top-0 z-10 shadow-lg shadow-black/20">
    <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-2.5 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-sm"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Zero<span className="text-emerald-400">Vault</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-wide">
            CLIENT-SIDE ENCRYPTION
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-gray-700/50 backdrop-blur-sm">
        <Terminal className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
          Debug
        </span>
        <button
          onClick={() => setDebugMode((prev) => !prev)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none shadow-inner ${
            debugMode ? "bg-emerald-500 shadow-emerald-500/50" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg transition-transform ${
              debugMode ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  </nav>
));

export default Navbar;
