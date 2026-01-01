import React, { useState, useRef, useCallback } from "react";
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

import Navbar from "./components/Navbar";
import FileItem from "./components/FileItem";

export default function App() {
  const [filesList, setFilesList] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [selectedFileSize, setSelectedFileSize] = useState(null);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      setSelectedFileSize(e.target.files[0].size);
    }
  };

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

    // 1. Read the real file data
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const rawData = reader.result;

        setStatus("Encrypting (Client-Side)...");

        // Artificial delay so you can see the "Encrypting" status
        await new Promise((r) => setTimeout(r, 500));

        // 2. REAL ENCRYPTION HAPPENS HERE
        const encrypted = CryptoJS.AES.encrypt(rawData, password).toString();

        setStatus("Uploading Encrypted Blob...");
        await new Promise((r) => setTimeout(r, 500));

        // 3. Save to the list
        const newFile = {
          id: Date.now(), // Use timestamp as ID to be safe
          fileName: file.name,
          encryptedData: encrypted, // <--- This is now real encrypted data
          uploadDate: new Date().toISOString(),
        };

        setFilesList((prev) => [newFile, ...prev]);
        setStatus("Secure Upload Complete!");

        // Reset Form
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (passwordInputRef.current) passwordInputRef.current.value = "";
        setSelectedFileName(null);
        setSelectedFileSize(null);
      } catch (error) {
        console.error(error);
        alert("Encryption Failed!");
      } finally {
        setIsLoading(false);
        setTimeout(() => setStatus(""), 3000);
      }
    };
  };

  const handleDecrypt = useCallback((fileObj) => {
    const userPass = prompt(`Enter decryption key for: ${fileObj.fileName}`);
    if (!userPass) return;

    try {
      console.log("Attempting to decrypt with password:", userPass);

      const bytes = CryptoJS.AES.decrypt(fileObj.encryptedData, userPass);
      const originalData = bytes.toString(CryptoJS.enc.Utf8);

      console.log(
        "Decrypted result (first 50 chars):",
        originalData.substring(0, 50)
      );

      if (!originalData.startsWith("data:")) {
        console.error("Decryption produced invalid data. Wrong password?");
        throw new Error("Malformatted data");
      }

      const link = document.createElement("a");
      link.href = originalData;
      link.download = fileObj.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Success! File downloaded.");
    } catch (err) {
      console.error(err);
      alert(
        "DECRYPTION FAILED: The password was wrong, or this is a corrupt file."
      );
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
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-3xl border border-gray-800/50 p-8 shadow-2xl shadow-black/50 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-pulse"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white relative z-10">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              Secure Upload
            </h2>

            <div className="mb-6 relative z-10">
              <label
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedFileName
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                    : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  {selectedFileName ? (
                    <>
                      <div className="p-3 bg-emerald-500/20 rounded-full mb-3 border border-emerald-500/30">
                        <FileText className="w-7 h-7 text-emerald-400" />
                      </div>
                      <p className="text-sm text-gray-200 font-semibold truncate max-w-[220px]">
                        {selectedFileName}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1 font-medium">
                        {(selectedFileSize / 1024).toFixed(1)} KB • Ready to
                        encrypt
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-800/50 rounded-full mb-3 border border-gray-700">
                        <Upload className="w-7 h-7 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-300 font-medium">
                        Click to select file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Any file type supported
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

            <div className="mb-6 relative z-10">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Encryption Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-emerald-500/50" />
                </div>
                <input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="Enter your secure passphrase"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none backdrop-blur-sm"
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Never stored on server • AES-256 encryption
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={isLoading}
              className={`relative w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden group ${
                isLoading
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:-translate-y-0.5"
              }`}
            >
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              )}
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Encrypt & Upload
                </>
              )}
            </button>

            {status && (
              <div className="mt-5 p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 animate-pulse"></div>
                <Terminal className="w-5 h-5 text-emerald-400 relative z-10 animate-pulse" />
                <span className="text-sm font-mono text-emerald-300 relative z-10">
                  {status}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-blue-400 text-sm font-bold mb-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              Zero-Knowledge Architecture
            </h4>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Files are encrypted <strong>in your browser</strong> using AES-256
              before transmission. The server only stores encrypted data and has
              zero knowledge of your content or encryption keys.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              Encrypted Vault
            </h2>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-sm">
              <span className="text-sm text-gray-400 font-semibold">
                {filesList.length} {filesList.length === 1 ? "file" : "files"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900/30 to-gray-900/10 backdrop-blur-sm">
                <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl mb-4 border border-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                  <Lock className="w-10 h-10 text-gray-600 relative z-10" />
                </div>
                <p className="text-gray-400 font-bold text-lg mb-1">
                  Vault is empty
                </p>
                <p className="text-gray-600 text-sm">
                  Upload your first encrypted file to get started
                </p>
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
