import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavyBackground from "../components/NavyBackground";
import Navbar from "../components/Navbar";
import {
  FileText,
  Eye,
  Copy,
  CheckCircle,
  Download,
  BarChart2,
  MessageCircle,
} from "lucide-react";

const OCRResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResults, setOcrResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [copiedText, setCopiedText] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("results"); // results | chatbot | confidence
  const [downloadOpen, setDownloadOpen] = useState(false);

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

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [selectedFile]);

  const processFiles = async (uploadedFiles) => {
    setIsProcessing(true);
    const results = {};

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      await new Promise((resolve) => setTimeout(resolve, 1000));

      results[file.name] = {
        text: generateMockOCRText(file),
        confidence: Math.floor(Math.random() * 20) + 80, // random 80–100
      };
    }

    setOcrResults(results);
    setIsProcessing(false);
    if (uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  const generateMockOCRText = (file) => {
    return `This is the OCR result for file: ${file.name}\n\nSample recognized text goes here...`;
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

  const downloadFile = (filename, text, format) => {
    let blob;
    if (format === "txt") {
      blob = new Blob([text], { type: "text/plain" });
    } else if (format === "docx") {
      blob = new Blob([text], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    } else if (format === "pdf") {
      blob = new Blob([text], { type: "application/pdf" });
    }

    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `${filename.replace(/\.[^/.]+$/, "")}_ocr.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCurrentText = () => {
    if (!selectedFile || !ocrResults[selectedFile.name]) return "";
    return ocrResults[selectedFile.name].text;
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

      <div className="flex w-full h-[calc(100vh-120px)]">
        {/* Left: File Preview */}
        <div className="w-1/2 h-full bg-gray-50 flex items-center justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700">Processing file...</p>
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
            <div className="text-gray-500">Select a file</div>
          )}
        </div>

        {/* Right: Tabbed Content */}
        <div className="w-1/2 h-full flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("results")}
              className={`flex-1 py-3 text-center ${
                activeTab === "results"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText className="inline-block w-4 h-4 mr-1" /> OCR Results
            </button>
            <button
              onClick={() => setActiveTab("chatbot")}
              className={`flex-1 py-3 text-center ${
                activeTab === "chatbot"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <MessageCircle className="inline-block w-4 h-4 mr-1" /> Chatbot
            </button>
            <button
              onClick={() => setActiveTab("confidence")}
              className={`flex-1 py-3 text-center ${
                activeTab === "confidence"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <BarChart2 className="inline-block w-4 h-4 mr-1" /> Confidence
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "results" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Extracted Text
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => setDownloadOpen(!downloadOpen)}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                    {downloadOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg border">
                        <button
                          onClick={() =>
                            downloadFile(selectedFile.name, getCurrentText(), "txt")
                          }
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          TXT
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(selectedFile.name, getCurrentText(), "docx")
                          }
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          DOCX
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(selectedFile.name, getCurrentText(), "pdf")
                          }
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-3 rounded-lg border">
                  {getCurrentText()}
                </pre>
                <button
                  onClick={() => copyToClipboard(getCurrentText())}
                  className="mt-3 flex items-center text-blue-600 hover:text-blue-700"
                >
                  {copiedText === getCurrentText() ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copiedText === getCurrentText()
                    ? "Copied!"
                    : "Copy to Clipboard"}
                </button>
              </>
            )}

            {activeTab === "chatbot" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                  <p className="text-gray-600">💬 Chatbot coming soon...</p>
                </div>
                <div className="flex mt-2">
                  <input
                    type="text"
                    placeholder="Ask something..."
                    className="flex-1 border rounded-l-lg px-3 py-2 text-sm"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg">
                    Send
                  </button>
                </div>
              </div>
            )}

            {activeTab === "confidence" && selectedFile && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Confidence Level</h3>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-green-500 h-6 rounded-full text-xs flex items-center justify-center text-white"
                    style={{
                      width: `${ocrResults[selectedFile.name].confidence}%`,
                    }}
                  >
                    {ocrResults[selectedFile.name].confidence}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavyBackground>
  );
};

export default OCRResultsPage;
