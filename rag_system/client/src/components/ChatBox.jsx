import React, { useState } from "react";

export default function ChatBox({ onSend, children }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSend(query);
    setQuery("");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#111] text-white">
      {children}
      <h1 className="text-2xl mb-6">What can I help with?</h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xl bg-[#1e1e1e] rounded-full p-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything"
          className="flex-1 bg-transparent text-gray-300 px-4 outline-none"
        />
        <button
          type="submit"
          className="bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600"
        >
          ⬆️
        </button>
      </form>
    </div>
  );
}
