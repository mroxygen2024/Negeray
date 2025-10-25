
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./pages/Chat";
import Ingest from "./pages/Ingest";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-500 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">RAG System</h1>
          <nav className="space-x-4">
            <Link to="/chat" className="hover:underline">Chat</Link>
            <Link to="/ingest" className="hover:underline">Ingest</Link>
          </nav>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/chat" element={<Chat />} />
            <Route path="/ingest" element={<Ingest />} />
            <Route path="*" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
