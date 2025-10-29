import { useState, useRef, useEffect } from "react";
import InfoToggle from "../components/InfoToggle.jsx";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_API_BASE;

export default function UserPage() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

 const handleSend = async () => {
  if (!query.trim()) return toast.error("Please enter your question!");

  const userQuestion = query.trim();

  // 1️⃣ Immediately show user's question in chat (no answer yet)
  setChatHistory((prev) => [...prev, { question: userQuestion, answer: null }]);

  // 2️⃣ Clear input field
  setQuery("");
  setLoading(true);

  try {
    // 3️⃣ Send to backend
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userQuestion }),
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    const answer = data.answer || "No answer found.";

    // 4️⃣ Update only the last message with the answer
    setChatHistory((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage.question === userQuestion) {
        lastMessage.answer = answer;
      }
      return updated;
    });
  } catch (err) {
    console.error("Error:", err);
    toast.error("Failed to get response. Try again!");
    // 5️⃣ Show error message in chat
    setChatHistory((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      lastMessage.answer = "❌ Failed to get response.";
      return updated;
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white relative">
      {/* Top Info Toggle */}
      <div className="absolute top-4 right-4">
        <InfoToggle />
      </div>

      {/* Title */}
      {chatHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-200 text-center">
            What can I help with?
          </h1>
        </div>
      )}

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28 flex flex-col items-center gap-4">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className="w-full max-w-2xl bg-[#1a1a1a] border border-gray-700 rounded-2xl p-5 shadow-lg"
            >
              <p className="text-gray-400 text-sm mb-1">You:</p>
              <p className="text-gray-200 font-medium mb-3">{item.question}</p>
              <p className="text-gray-400 text-sm mb-1">Answer:</p>
              <p className="text-gray-100 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {item.answer}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Input Section */}
      <div className="w-full max-w-2xl mx-auto fixed bottom-4 left-0 right-0 flex items-center gap-3 bg-[#1e1e1e] rounded-full px-4 py-3 shadow-lg border border-gray-700">
        <input
          type="text"
          placeholder="Ask anything"
          className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500 text-base md:text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-gray-200 text-black rounded-full p-2 hover:bg-white transition disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <p className="text-gray-400 animate-pulse text-center mt-2 mb-28">
          Thinking...
        </p>
      )}
    </div>
  );
}
