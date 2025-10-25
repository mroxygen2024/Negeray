import React, { useState } from 'react';
import ChatInput from '../components/ChatInput';
import MessageList from '../components/MessageList';
import { chat } from '../lib/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);

  const handleSend = async (query) => {
    const userMessage = { role: 'user', text: query };
    setMessages([...messages, userMessage]);

    try {
      const res = await chat(query);
      const assistantMessage = { role: 'assistant', text: res.answer, sources: res.sources };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
    } catch (err) {
      console.error('Chat request failed:', err);
      const errorMsg = { role: 'assistant', text: `Failed to get response${err?.message ? `: ${err.message}` : ''}` };
      setMessages((prev) => [...prev, userMessage, errorMsg]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-screen">
      <MessageList messages={messages} />
      <ChatInput onSubmit={handleSend} />
    </div>
  );
}
