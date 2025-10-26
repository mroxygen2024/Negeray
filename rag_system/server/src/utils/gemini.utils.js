import dotenv from 'dotenv';
dotenv.config();

export const generateAnswer = async (context, question) => {
  try {
    const prompt = `
You are an assistant. Use the context below to answer accurately.
Context:
${context}
Question: ${question}
Answer:
`;

    const response = await fetch(`${process.env.GEMINI_API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (err) {
    console.error('Gemini API error:', err);
    throw new Error('Failed to fetch Gemini response');
  }
};
