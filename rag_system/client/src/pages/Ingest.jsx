import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { API_BASE } from '../lib/api.js';

// --- Zod schema for validation ---
const ingestSchema = z.object({
  text: z.string().min(1, { message: 'Text cannot be empty' })
});

export default function Ingest() {
  const [status, setStatus] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ingestSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.text })
      });
      const result = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Document ingested successfully!' });
        reset();
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to ingest document' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Server error. Please try again.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Ingest Document</h2>

      {status && (
        <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <textarea
          {...register('text')}
          placeholder="Enter your document or text chunk..."
          className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-40"
        />
        {errors.text && <span className="text-red-600">{errors.text.message}</span>}

        <button
          type="submit"
          className="bg-green-500 text-white p-3 rounded hover:bg-green-600 transition"
        >
          Ingest
        </button>
      </form>
    </div>
  );
}
