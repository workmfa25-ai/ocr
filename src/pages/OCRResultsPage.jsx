import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavyBackground from "../components/NavyBackground";
import Navbar from "../components/Navbar";
import {
  FileText,
  Image,
  Download,
  Eye,
  Copy,
  CheckCircle,
} from "lucide-react";

const OCRResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResults, setOcrResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [copiedText, setCopiedText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fileUrl, setFileUrl] = useState(null);

  // Load files
  useEffect(() => {
    if (location.state && location.state.files) {
      setFiles(location.state.files);
      processFiles(location.state.files);
    } else {
      navigate("/upload");
    }
  }, [location.state, navigate]);

  // File URL for viewer
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setCurrentPage(1);

      const result = ocrResults[selectedFile.name];
      if (result) {
        setTotalPages(result.pageCount);
      }

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [selectedFile, ocrResults]);

  const processFiles = async (uploadedFiles) => {
    setIsProcessing(true);
    const results = {};

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pageCount = file.type.includes("pdf")
        ? Math.floor(Math.random() * 10) + 1
        : 1;
      results[file.name] = {
        text: generateMockOCRText(file),
        confidence: Math.floor(Math.random() * 20) + 80,
        pageCount: pageCount,
        processingTime: Math.floor(Math.random() * 3000) + 1000,
        pageTexts: generatePageTexts(pageCount),
      };
    }

    setOcrResults(results);
    setIsProcessing(false);
    if (uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  const generatePageTexts = (pageCount) => {
    const pageTexts = {};
    for (let i = 1; i <= pageCount; i++) {
      pageTexts[i] = generateMockOCRText(null, i);
    }
    return pageTexts;
  };

  const generateMockOCRText = (file, pageNumber = 1) => {
    const sampleTexts = [
      `Page ${pageNumber}: This is a sample OCR output with high accuracy.`,
      `Page ${pageNumber}: Invoice #INV-2024-001\nDate: March 15, 2024\nBill To: John Doe\n123 Main Street`,
      `Page ${pageNumber}: Meeting Notes\n- Discussed project timeline\n- Reviewed budget requirements`,
      `Page ${pageNumber}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      `Page ${pageNumber}: Product Catalog\nItem 1: Widget A - $29.99\nItem 2: Widget B - $39.99`,
    ];
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadText = (filename, text) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.replace(/\.[^/.]+$/, "")}_ocr.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCurrentPageText = () => {
    if (!selectedFile || !ocrResults[selectedFile.name]) return "";
    const result = ocrResults[selectedFile.name];
    return result.pageTexts?.[currentPage] || result.text;
  };

  if (files.length === 0) {
    return (
      <NavyBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No files found</h2>
            <p className="mb-6">Please upload files first</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Go to Upload
            </button>
          </div>
        </div>
      </NavyBackground>
    );
  }

  return (
    <NavyBackground>
      <Navbar />

      {/* Main Content Split 50/50 */}
      <div className="flex w-full h-[calc(100vh-120px)]">
        {/* Left: PDF/Image Viewer */}
        <div className="w-1/2 h-full">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full bg-white">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Processing Files
              </h3>
              <p className="text-gray-600">
                Please wait while we extract text from your files...
              </p>
            </div>
          ) : selectedFile ? (
            selectedFile.type.includes("pdf") ? (
              <iframe
                src={`${fileUrl}#navpanes=0&toolbar=0&scrollbar=0`}
                className="w-full h-full border-0"
                title={selectedFile.name}
              />
            ) : (
              <img
                src={fileUrl}
                alt={selectedFile.name}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white text-gray-500">
              <Eye className="w-16 h-16 mb-4 text-gray-300" />
              <p>Select a file to view</p>
            </div>
          )}
        </div>

        {/* Right: OCR Text Results */}
        <div className="w-1/2 h-full flex flex-col bg-white">
          {!isProcessing && selectedFile && ocrResults[selectedFile.name] ? (
            <>
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  OCR Results
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(getCurrentPageText())}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Copy Page Text"
                  >
                    {copiedText === getCurrentPageText() ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      downloadText(selectedFile.name, getCurrentPageText())
                    }
                    className="text-gray-600 hover:text-gray-700 transition-colors"
                    title="Download Page Text"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {getCurrentPageText()}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-sm">OCR results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </NavyBackground>
  );
};

export default OCRResultsPage;
