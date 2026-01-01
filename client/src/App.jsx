import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Lock,
  Upload,
  FileText,
  ShieldCheck,
  Terminal,
  Key,
  RefreshCw,
} from "lucide-react";
import CryptoJS from "crypto-js";
import axios from "axios"; // <--- NOW USING AXIOS

import Navbar from "./components/Navbar";
import FileItem from "./components/FileItem";

// Automatically picks the Render URL in production, or Localhost in dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [filesList, setFilesList] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [selectedFileSize, setSelectedFileSize] = useState(null);

  // --- 1. FETCH FILES FROM SERVER ON LOAD ---
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files`);
      setFilesList(res.data); // Update state with DB data
    } catch (err) {
      console.error("Server connection failed:", err);
      // Optional: setStatus("Server Offline");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      setSelectedFileSize(e.target.files[0].size);
    }
  };

  // --- 2. UPLOAD TO SERVER ---
  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    const password = passwordInputRef.current?.value;

    if (!file || !password) {
      alert("Please select a file and enter a password.");
      return;
    }

    setIsLoading(true);
    setStatus("Reading File...");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const rawData = reader.result;

        setStatus("Encrypting (Client-Side)...");
        // Artificial delay for visual effect
        await new Promise((r) => setTimeout(r, 500));

        // A. REAL ENCRYPTION
        const encrypted = CryptoJS.AES.encrypt(rawData, password).toString();

        setStatus("Uploading to Server...");

        // B. SEND TO BACKEND (The Server Logic)
        await axios.post(`${API_URL}/upload`, {
          fileName: file.name,
          encryptedData: encrypted,
        });

        setStatus("Secure Upload Complete!");

        // Refresh the list from the server
        fetchFiles();

        // Reset Form
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (passwordInputRef.current) passwordInputRef.current.value = "";
        setSelectedFileName(null);
        setSelectedFileSize(null);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload Failed! Is the server running?");
      } finally {
        setIsLoading(false);
        setTimeout(() => setStatus(""), 3000);
      }
    };
  };

  // --- 3. DECRYPT (Client Side Only) ---
  const handleDecrypt = useCallback((fileObj, userPass) => {
    if (!userPass) return;

    try {
      console.log("Attempting to decrypt...");

      const bytes = CryptoJS.AES.decrypt(fileObj.encryptedData, userPass);
      const originalData = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalData.startsWith("data:")) {
        throw new Error("Malformatted data");
      }

      // Download Logic
      const link = document.createElement("a");
      link.href = originalData;
      link.download = fileObj.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Success! File decrypted and downloaded.");
    } catch (err) {
      console.error(err);
      alert("DECRYPTION FAILED: Wrong password!");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Ambient Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar debugMode={debugMode} setDebugMode={setDebugMode} />

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LEFT COLUMN: UPLOAD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-3xl border border-gray-800/50 p-8 shadow-2xl shadow-black/50 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-pulse"></div>

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white relative z-10">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              Secure Upload
            </h2>

            {/* File Input */}
            <div className="mb-6 relative z-10">
              <label
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedFileName
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  {selectedFileName ? (
                    <>
                      <FileText className="w-7 h-7 text-emerald-400 mb-2" />
                      <p className="text-sm text-gray-200 font-semibold truncate max-w-[220px]">
                        {selectedFileName}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1 font-medium">
                        {(selectedFileSize / 1024).toFixed(1)} KB • Ready
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-300 font-medium">
                        Click to select file
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Password Input */}
            <div className="mb-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-emerald-500/50" />
                </div>
                <input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="Enter your secure passphrase"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={isLoading}
              className={`relative w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden group ${
                isLoading
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-900/30"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Encrypt & Upload
                </>
              )}
            </button>

            {status && (
              <div className="mt-5 p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-mono text-emerald-300">
                  {status}
                </span>
              </div>
            )}
          </div>

          {/* Architecture Note */}
          <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-blue-400 text-sm font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Zero-Knowledge Architecture
            </h4>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Files are encrypted <strong>in your browser</strong> using AES-256
              before transmission. The server stores encrypted data but has zero
              knowledge of your content.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: FILE LIST */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              Encrypted Vault
            </h2>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full">
              <span className="text-sm text-gray-400 font-semibold">
                {filesList.length} files
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900/30 to-gray-900/10">
                <Lock className="w-10 h-10 text-gray-600 mb-4" />
                <p className="text-gray-400 font-bold">Vault is empty</p>
                <p className="text-gray-600 text-sm">Is your server running?</p>
              </div>
            ) : (
              filesList
                .slice()
                .reverse()
                .map((f) => (
                  <FileItem
                    key={f.id}
                    file={f}
                    debugMode={debugMode}
                    onDecrypt={handleDecrypt}
                  />
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
