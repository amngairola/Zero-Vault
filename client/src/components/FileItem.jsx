import React, { useState, memo } from "react";
import {
  Unlock,
  FileText,
  AlertTriangle,
  ArrowRight,
  X,
  Key,
} from "lucide-react";

const FileItem = memo(({ file, debugMode, onDecrypt }) => {
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!password) return;
    onDecrypt(file, password); // Send file AND password to App.jsx
    setPassword("");
    setShowInput(false); // Reset UI
  };

  return (
    <div className="group bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-emerald-900/20 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        {/* FILE INFO */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-4 bg-gray-800/50 rounded-xl group-hover:bg-emerald-500/10 transition-all duration-300 border border-gray-700 group-hover:border-emerald-500/30 shrink-0">
            <FileText className="w-7 h-7 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors text-base truncate">
              {file.fileName}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1.5 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-800 rounded">
                ID: {file.id}
              </span>
              <span>•</span>
              <span>
                {new Date(file.uploadDate || Date.now()).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* ACTION AREA (Swaps between Button and Input) */}
        <div className="shrink-0">
          {!showInput ? (
            // STATE 1: DECRYPT BUTTON
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 border border-gray-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 group/btn"
            >
              <Unlock className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              Decrypt
            </button>
          ) : (
            // STATE 2: INLINE PASSWORD INPUT
            <div className="flex items-center gap-2 animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Key..."
                  className="w-40 py-2.5 pl-9 pr-3 bg-black/50 border border-emerald-500/50 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowInput(false);
                  setPassword("");
                }}
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DEBUG MODE PANEL */}
      {debugMode && (
        <div className="mt-5 pt-5 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-amber-500/20 rounded">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Server-Side View (Encrypted Payload)
            </span>
          </div>
          <div className="bg-black/80 rounded-xl p-4 border border-gray-800 font-mono text-[10px] text-gray-500 break-all leading-relaxed relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none"></div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 rounded text-[9px] text-red-400 font-bold border border-red-500/30">
              UNREADABLE
            </div>
            <span className="text-emerald-500/40 selection:bg-emerald-500 selection:text-black relative z-10">
              {file.encryptedData.substring(0, 350)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default FileItem;
