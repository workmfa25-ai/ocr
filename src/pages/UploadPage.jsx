import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavyBackground from "../components/NavyBackground";
import Logo from "../components/Logo";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) => file.type.includes("pdf") || file.type.includes("image")
    );
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(
        (file) => file.type.includes("pdf") || file.type.includes("image")
      );
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate("/results", { state: { files } });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <NavyBackground>
      <div className="min-h-screen flex flex-col p-2 sm:p-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pr-6 pl-6">
          <Logo type="wesee" size="large" />
          <h1 class="text-4xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Optical Character Recognition
          </h1>
          <Logo type="navy" size="large" />
        </div>

        {/* Main Card */}
        <div className="flex-1 flex flex-col items-center justify-start pt-16">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-600 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 md:p-10 flex flex-col">
            {/* Title */}
            <div className="text-center mb-2 sm:mb-5">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                Upload File
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-blue-100">
                Support for PDF documents and images
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-10 transition-all duration-300 ${
                dragActive
                  ? "border-blue-200 bg-blue-400/10"
                  : "border-blue-300 bg-white/10 hover:bg-white/20"
              } ${files.length > 0 ? "mb-3 sm:mb-5" : "mb-0"}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 text-white mx-auto mb-2 sm:mb-4" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2 sm:mb-4">
                  Drop files here or click to browse
                </h3>
                <p className="text-white/90 text-xs sm:text-sm md:text-base mb-2">
                  Supports PDF documents and images (PNG, JPG, JPEG)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/90 hover:bg-white text-blue-900 font-semibold py-2 px-5 sm:py-3 sm:px-8 md:py-4 md:px-10 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* File List + Process Button */}
            {files.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* File List */}
                <div className="bg-white/90 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-3 sm:mb-5 flex-1 flex flex-col min-h-0">
                  <div className="mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{`Selected Files (${files.length})`}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Ready for processing
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-md sm:rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="p-1 rounded-md bg-gray-50 flex-shrink-0">
                            {file.type.includes("pdf") ? (
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            ) : (
                              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                              {file.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Process Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 sm:py-3 sm:px-8 md:py-4 md:px-10 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200 ${
                      isProcessing
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-lg hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Start OCR Processing</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavyBackground>
  );
};

export default UploadPage;
