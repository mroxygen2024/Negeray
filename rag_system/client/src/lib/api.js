export const API_BASE = import.meta.env.VITE_API_BASE;


export const chat = async (question) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat request failed: ${errorText}`);
  }

  const data = await response.json();
  return data;
}



export const ingestDocument = async (text) => {
  const res = await fetch(`${API_BASE}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
};