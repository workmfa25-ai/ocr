// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import NavyBackground from "../components/NavyBackground";
// import Navbar from "../components/Navbar";
// import {
//   FileText,
//   Copy,
//   CheckCircle,
//   Download,
//   BarChart2,
//   MessageCircle,
// } from "lucide-react";
// import { Document, Packer, Paragraph, TextRun } from "docx";
// import jsPDF from "jspdf";

// const OCRResultsPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [chatHistory, setChatHistory] = useState([]);
//   const [input, setInput] = useState("");
//   const [files, setFiles] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [ocrResults, setOcrResults] = useState({});
//   const [isProcessing, setIsProcessing] = useState(true);
//   const [copiedText, setCopiedText] = useState("");
//   const [fileUrl, setFileUrl] = useState(null);
//   const [activeTab, setActiveTab] = useState("results");
//   const [downloadOpen, setDownloadOpen] = useState(false);
//   const [pageConfidences, setPageConfidences] = useState([]);
//   const [overallConfidence, setOverallConfidence] = useState(null);
//   const [totalPages, setTotalPages] = useState(null);
//   const [loadingConfidences, setLoadingConfidences] = useState(true);
//   const [isEditing, setIsEditing] = useState(false); // New: edit mode

//   // Load files + OCR results from API
//   useEffect(() => {
//     if (location.state && location.state.apiResponse) {
//       const response = location.state.apiResponse;
//       const localFiles = location.state.localFiles || [];
//       const filesData = Array.isArray(response) ? response : [response];

//       setFiles(filesData);
//       setOcrResults(
//         filesData.reduce((acc, f, i) => {
//           acc[f.filename] = {
//             text: f.extracted_text || "⚠️ No text extracted",
//             confidence: f.confidence || 95,
//             pages: f.pages || 1,
//             page_confidences: f.page_confidences || [],
//             localFile: localFiles[i] || null,
//           };
//           return acc;
//         }, {})
//       );
//       setSelectedFile(filesData[0]);
//       setIsProcessing(false);
//     } else {
//       navigate("/upload");
//     }
//   }, [location.state, navigate]);

//   // File URL for preview (only local files)
// useEffect(() => {
//   if (selectedFile) {
//     const result = selectedFile.localFile || (ocrResults[selectedFile.filename] && ocrResults[selectedFile.filename].localFile);
//     if (!result) return;

//     const url = URL.createObjectURL(result);
//     setFileUrl(url);
//     return () => URL.revokeObjectURL(url);
//   }
// }, [selectedFile]); 

//   // Load confidence data from selectedFile
//   useEffect(() => {
//     if (activeTab === "confidence" && selectedFile) {
//       const result = ocrResults[selectedFile.filename];
//       if (result) {
//         setOverallConfidence(result.confidence);
//         setTotalPages(result.pages);
//         setPageConfidences(result.page_confidences || []);
//         setLoadingConfidences(false);
//       }
//     }
//   }, [activeTab, selectedFile, ocrResults]);

//   const copyToClipboard = async (text) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedText(text);
//       setTimeout(() => setCopiedText(""), 2000);
//     } catch (err) {
//       console.error("Failed to copy text: ", err);
//     }
//   };

//   const getCurrentText = () => {
//     if (!selectedFile || !ocrResults[selectedFile.filename]) return "";
//     return ocrResults[selectedFile.filename].text;
//   };

//   const downloadFile = async (format) => {
//     const text = getCurrentText(); // Use edited text
//     const baseName = selectedFile.filename.split(".")[0] + "_edited";

//     if (format === "txt") {
//       const blob = new Blob([text], { type: "text/plain" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${baseName}.txt`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } else if (format === "docx") {
//       const doc = new Document({
//         sections: [
//           {
//             properties: {},
//             children: text
//               .split("\n")
//               .map((line) => new Paragraph({ children: [new TextRun(line)] })),
//           },
//         ],
//       });
//       const blob = await Packer.toBlob(doc);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${baseName}.docx`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } else if (format === "pdf") {
//       const pdf = new jsPDF();
//       const lines = text.split("\n");
//       let y = 10;
//       lines.forEach((line) => {
//         pdf.text(line, 10, y);
//         y += 10;
//       });
//       pdf.save(`${baseName}.pdf`);
//     }
//   };

//   if (files.length === 0) {
//     return (
//       <NavyBackground>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center text-white">
//             <h2 className="text-2xl font-bold mb-4">No files found</h2>
//             <p className="mb-6">Please upload files first</p>
//             <button
//               onClick={() => navigate("/upload")}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
//             >
//               Go to Upload
//             </button>
//           </div>
//         </div>
//       </NavyBackground>
//     );
//   }

//   return (
//     <NavyBackground>
//       <Navbar />
//       <div className="flex w-full h-[calc(100vh-120px)]">
//         {/* Left: File Preview */}
//         <div className="w-1/2 h-full bg-gray-50 flex items-center justify-center">
//           {isProcessing ? (
//             <div className="flex flex-col items-center justify-center h-full">
//               <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
//               <p className="text-gray-700">Processing file...</p>
//             </div>
//           ) : selectedFile ? (
//             selectedFile.filename.endsWith(".pdf") ? (
//               <iframe
//                 src={fileUrl}
//                 className="w-full h-full border-0"
//                 title={selectedFile.filename}
//               />
//             ) : (
//               <img
//                 src={fileUrl}
//                 alt={selectedFile.filename}
//                 className="w-full h-full object-contain"
//               />
//             )
//           ) : (
//             <div className="text-gray-500">Select a file</div>
//           )}
//         </div>

//         {/* Right: Tabbed Content */}
//         <div className="w-1/2 h-full flex flex-col bg-white">
//           {/* Tabs */}
//           <div className="flex border-b">
//             <button
//               onClick={() => setActiveTab("results")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "results"
//                   ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               <FileText className="inline-block w-4 h-4 mr-1" /> OCR Results
//             </button>
//             <button
//               onClick={() => setActiveTab("chatbot")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "chatbot"
//                   ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               <MessageCircle className="inline-block w-4 h-4 mr-1" /> Chatbot
//             </button>
//             <button
//               onClick={() => setActiveTab("confidence")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "confidence"
//                   ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               <BarChart2 className="inline-block w-4 h-4 mr-1" /> Confidence
//             </button>
//           </div>

//           {/* Tab Content */}
//           <div className="flex-1 overflow-y-auto p-4">
//             {activeTab === "results" && (
//               <>
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     Extracted Text
//                   </h3>
//                   <div className="flex space-x-2">
//                     {!isEditing ? (
//                       <button
//                         onClick={() => setIsEditing(true)}
//                         className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
//                       >
//                         Edit
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => setIsEditing(false)}
//                         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                       >
//                         Save
//                       </button>
//                     )}

//                     <div className="relative">
//                       <button
//                         onClick={() => setDownloadOpen(!downloadOpen)}
//                         className="flex items-center text-gray-600 hover:text-gray-800"
//                       >
//                         <Download className="w-4 h-4 mr-1" /> Download
//                       </button>
//                       {downloadOpen && (
//                         <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg border">
//                           <button
//                             onClick={() => downloadFile("txt")}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             TXT
//                           </button>
//                           <button
//                             onClick={() => downloadFile("docx")}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             DOCX
//                           </button>
//                           <button
//                             onClick={() => downloadFile("pdf")}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             PDF
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <textarea
//                   className={`w-full h-96 p-4 bg-gray-100 rounded-lg text-sm resize-none ${
//                     !isEditing ? "cursor-not-allowed" : ""
//                   }`}
//                   value={getCurrentText()}
//                   readOnly={!isEditing}
//                   onChange={(e) => {
//                     const updatedText = e.target.value;
//                     setOcrResults((prev) => ({
//                       ...prev,
//                       [selectedFile.filename]: {
//                         ...prev[selectedFile.filename],
//                         text: updatedText,
//                       },
//                     }));
//                   }}
//                 />

//                 <button
//                   onClick={() => copyToClipboard(getCurrentText())}
//                   className="mt-3 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {copiedText === getCurrentText() ? (
//                     <CheckCircle className="w-4 h-4 mr-2" />
//                   ) : (
//                     <Copy className="w-4 h-4 mr-2" />
//                   )}
//                   {copiedText === getCurrentText() ? "Copied!" : "Copy to Clipboard"}
//                 </button>
//               </>
//             )}

//             {activeTab === "chatbot" && (
//               <div className="flex flex-col h-full">
//                 <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded">
//                   {chatHistory.map((msg, i) => (
//                     <div
//                       key={i}
//                       className={msg.role === "user" ? "text-right" : "text-left"}
//                     >
//                       <span
//                         className={`inline-block px-3 py-2 rounded-lg ${
//                           msg.role === "user"
//                             ? "bg-blue-600 text-white"
//                             : "bg-gray-200 text-gray-800"
//                         }`}
//                       >
//                         {msg.content}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//                 <form
//                   onSubmit={async (e) => {
//                     e.preventDefault();
//                     if (!input.trim()) return;
//                     const userMsg = { role: "user", content: input };
//                     setChatHistory([...chatHistory, userMsg]);
//                     setInput("");

//                     const res = await fetch("http://127.0.0.1:8000/ask/", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify({ question: input }),
//                     });
//                     const data = await res.json();
//                     setChatHistory((prev) => [
//                       ...prev,
//                       { role: "assistant", content: data.answer },
//                     ]);
//                   }}
//                   className="mt-2 flex"
//                 >
//                   <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Ask a question about the document..."
//                     className="flex-1 border rounded-l-lg px-3 py-2"
//                   />
//                   <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">
//                     Send
//                   </button>
//                 </form>
//               </div>
//             )}

//             {activeTab === "confidence" && selectedFile && (
//               <div className="text-gray-600">
//                 <h3 className="text-lg font-semibold mb-2">OCR Confidence Score</h3>

//                 {loadingConfidences ? (
//                   <p>Loading confidence data...</p>
//                 ) : overallConfidence === null ? (
//                   <p>Confidence data not available.</p>
//                 ) : (
//                   <>
//                     <p className="mb-2">Overall Confidence: {overallConfidence.toFixed(2)}%</p>
//                     <p className="mb-4">Total Pages: {totalPages}</p>

//                     {pageConfidences.length > 0 && (
//                       <table className="w-full border border-gray-300 text-sm">
//                         <thead className="bg-gray-100">
//                           <tr>
//                             <th className="border px-2 py-1 text-left">Page</th>
//                             <th className="border px-2 py-1 text-left">Confidence (%)</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {pageConfidences.map((page) => (
//                             <tr key={page.page} className="hover:bg-gray-50">
//                               <td className="border px-2 py-1">{page.page}</td>
//                               <td className="border px-2 py-1">{page.confidence.toFixed(2)}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </NavyBackground>
//   );
// };

// export default OCRResultsPage;


import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavyBackground from "../components/NavyBackground";
import Navbar from "../components/Navbar";
import {
  FileText,
  Copy,
  CheckCircle,
  Download,
  BarChart2,
  MessageCircle,
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";

const keyOf = (f) => f?.filename || f?.file_name || f?.name || ""; // robust key
const baseNameOf = (f) => (keyOf(f).includes(".") ? keyOf(f).split(".").slice(0, -1).join(".") : keyOf(f));

const OCRResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResults, setOcrResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [copiedText, setCopiedText] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [pageConfidences, setPageConfidences] = useState([]);
  const [overallConfidence, setOverallConfidence] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [loadingConfidences, setLoadingConfidences] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 🔄 NEW: loader state for LLM reply
  const [isLLMLoading, setIsLLMLoading] = useState(false);

  // Load files + OCR results from API
  useEffect(() => {
    if (location.state && location.state.apiResponse) {
      const response = location.state.apiResponse;
      const localFiles = location.state.localFiles || [];
      const filesData = Array.isArray(response) ? response : [response];

      // Build ocrResults map robustly
      const mapped = filesData.reduce((acc, f, i) => {
        const k = keyOf(f) || `file_${i + 1}`;
        acc[k] = {
          text: f.extracted_text ?? f.text ?? "⚠️ No text extracted",
          confidence: typeof f.confidence === "number" ? f.confidence : 95,
          pages: typeof f.pages === "number" ? f.pages : (Array.isArray(f.page_confidences) ? f.page_confidences.length : 1),
          page_confidences: Array.isArray(f.page_confidences) ? f.page_confidences : [],
          localFile: localFiles[i] || null,
        };
        return acc;
      }, {});

      setFiles(filesData);
      setOcrResults(mapped);
      setSelectedFile(filesData[0] || null);
      setIsProcessing(false);
    } else {
      navigate("/upload");
    }
  }, [location.state, navigate]);

  // File URL for preview (only local files/images/pdfs)
  useEffect(() => {
    if (!selectedFile) {
      setFileUrl(null);
      return;
    }
    const k = keyOf(selectedFile);
    const result = ocrResults[k]?.localFile || selectedFile.localFile;
    if (!result) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(result);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Load confidence data when tab opens
  useEffect(() => {
    if (activeTab === "confidence" && selectedFile) {
      const k = keyOf(selectedFile);
      const result = ocrResults[k];
      if (result) {
        setOverallConfidence(result.confidence ?? null);
        setTotalPages(result.pages ?? null);
        setPageConfidences(result.page_confidences || []);
        setLoadingConfidences(false);
      }
    }
  }, [activeTab, selectedFile, ocrResults]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getCurrentText = () => {
    if (!selectedFile) return "";
    const k = keyOf(selectedFile);
    return ocrResults[k]?.text ?? "";
  };

  const setCurrentText = (updatedText) => {
    if (!selectedFile) return;
    const k = keyOf(selectedFile);
    setOcrResults((prev) => ({
      ...prev,
      [k]: { ...(prev[k] || {}), text: updatedText },
    }));
  };

  const downloadFile = async (format) => {
    if (!selectedFile) return;
    const text = getCurrentText();
    const baseName = `${baseNameOf(selectedFile) || "document"}_edited`;

    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "docx") {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: text.split("\n").map((line) => new Paragraph({ children: [new TextRun(line)] })),
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const pdf = new jsPDF();
      const lines = text.split("\n");
      let y = 10;
      lines.forEach((line) => {
        pdf.text(line, 10, y);
        y += 10;
      });
      pdf.save(`${baseName}.pdf`);
    }
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

  const selectedKey = selectedFile ? keyOf(selectedFile) : "";
  const isPDF = selectedKey.toLowerCase().endsWith(".pdf");

  return (
    <NavyBackground>
      <Navbar />
      <div className="flex w-full h-[calc(100vh-120px)]">
        {/* Left: File Preview */}
        <div className="w-1/2 h-full bg-gray-50 flex items-center justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-700">Processing file...</p>
            </div>
          ) : selectedFile ? (
            isPDF ? (
              fileUrl ? (
                <iframe src={fileUrl} className="w-full h-full border-0" title={selectedKey} />
              ) : (
                <div className="text-gray-500 p-4 text-center">
                  PDF preview unavailable. (No local file URL)
                </div>
              )
            ) : fileUrl ? (
              <img src={fileUrl} alt={selectedKey} className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-500 p-4 text-center">
                Preview unavailable. (No local file URL)
              </div>
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
                  <h3 className="text-lg font-semibold text-gray-800">Extracted Text</h3>
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setDownloadOpen((v) => !v)}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                      >
                        <Download className="w-4 h-4 mr-1" /> Download
                      </button>
                      {downloadOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg border z-10">
                          <button
                            onClick={() => downloadFile("txt")}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            TXT
                          </button>
                          <button
                            onClick={() => downloadFile("docx")}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            DOCX
                          </button>
                          <button
                            onClick={() => downloadFile("pdf")}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            PDF
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <textarea
                  className={`w-full h-96 p-4 bg-gray-100 rounded-lg text-sm resize-none ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                  value={getCurrentText()}
                  readOnly={!isEditing}
                  onChange={(e) => setCurrentText(e.target.value)}
                />

                <button
                  onClick={() => copyToClipboard(getCurrentText())}
                  className="mt-3 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {copiedText === getCurrentText() ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedText === getCurrentText() ? "Copied!" : "Copy to Clipboard"}
                </button>
              </>
            )}

            {activeTab === "chatbot" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                      <span
                        className={`inline-block px-3 py-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </span>
                    </div>
                  ))}

                  {/* 🔄 LLM typing loader bubble */}
                  {isLLMLoading && (
                    <div className="text-left" aria-live="polite">
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        
                      </span>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!input.trim() || isLLMLoading) return;

                    // Add user bubble immediately
                    const userText = input;
                    const userMsg = { role: "user", content: userText };
                    setChatHistory((prev) => [...prev, userMsg]);
                    setInput("");
                    setIsLLMLoading(true);

                    try {
                      const res = await fetch("http://127.0.0.1:8000/ask/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ question: userText }),
                      });

                      if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                      }

                      const data = await res.json();
                      const answer = data?.answer ?? (typeof data === "string" ? data : JSON.stringify(data));

                      setChatHistory((prev) => [
                        ...prev,
                        { role: "assistant", content: answer || "No answer returned." },
                      ]);
                    } catch (err) {
                      console.error("Error fetching answer:", err);
                      setChatHistory((prev) => [
                        ...prev,
                        { role: "assistant", content: "⚠️ Error getting response from server." },
                      ]);
                    } finally {
                      setIsLLMLoading(false);
                    }
                  }}
                  className="mt-2 flex"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the document..."
                    className="flex-1 border rounded-l-lg px-3 py-2"
                    disabled={isLLMLoading}
                  />
                  <button
                    className={`px-4 py-2 rounded-r-lg text-white ${
                      isLLMLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={isLLMLoading}
                  >
                    {isLLMLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending
                      </span>
                    ) : (
                      "Send"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "confidence" && selectedFile && (
              <div className="text-gray-600">
                <h3 className="text-lg font-semibold mb-2">OCR Confidence Score</h3>

                {loadingConfidences ? (
                  <p>Loading confidence data...</p>
                ) : overallConfidence === null ? (
                  <p>Confidence data not available.</p>
                ) : (
                  <>
                    <p className="mb-2">
                      Overall Confidence: {Number(overallConfidence).toFixed(2)}%
                    </p>
                    <p className="mb-4">Total Pages: {totalPages}</p>

                    {Array.isArray(pageConfidences) && pageConfidences.length > 0 && (
                      <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-2 py-1 text-left">Page</th>
                            <th className="border px-2 py-1 text-left">Confidence (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageConfidences.map((page, idx) => (
                            <tr key={page.page ?? idx} className="hover:bg-gray-50">
                              <td className="border px-2 py-1">{page.page ?? idx + 1}</td>
                              <td className="border px-2 py-1">
                                {Number(page.confidence).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </NavyBackground>
  );
};

export default OCRResultsPage;
