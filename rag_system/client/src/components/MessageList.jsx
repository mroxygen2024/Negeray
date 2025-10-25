// import React from 'react';
export default function MessageList({ messages }) {
  return (
    <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
      {messages.map((msg, i) => (
        <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
          <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {msg.text}
          </div>
          {msg.role === 'assistant' && msg.sources && (
            <div className="mt-1 text-sm text-gray-500">
              <strong>Sources:</strong>
              <ul className="list-disc pl-5">
                {msg.sources.map((s, j) => <li key={j}>{s.text}</li>)}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
