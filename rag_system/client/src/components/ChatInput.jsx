import React, { useState } from 'react';

export default function ChatInput({ onSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-300">
      <input
        type="text"
        className="grow border rounded-l-lg p-2 focus:outline-none"
        placeholder="Ask a question..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="bg-green-500 text-white px-4 rounded-r-lg">
        Send
      </button>
    </form>
  );
}
