import { useState } from "react";
import toast from "react-hot-toast";
import InfoToggle from "../components/InfoToggle.jsx";

const BASE = import.meta.env.VITE_API_BASE;

export default function AdminPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!text.trim()) return toast.error("Please enter some text!");

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      toast.success(data.message || "Uploaded successfully!");
      setText("");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to upload data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-white px-4 py-6">
      {/* Top Info Toggle */}
      <div className="absolute top-4 right-4">
        <InfoToggle />
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-center text-gray-200">
        Upload CSEC-ASTU Knowledge
      </h1>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full max-w-2xl h-64 p-4 bg-[#1e1e1e]  text-gray-200 placeholder-gray-500 shadow-inner border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
        placeholder="Paste CSEC-ASTU info here..."
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`mt-4 w-full max-w-2xl py-3 rounded-full font-semibold text-black shadow-lg transition-colors duration-200 ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gray-200 hover:bg-white"
        }`}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
