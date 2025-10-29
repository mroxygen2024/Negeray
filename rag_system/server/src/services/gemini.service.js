import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends a prompt to the Gemini model and returns its text response.
 * @param {string} prompt - The formatted prompt to send.
 * @returns {Promise<string>} - The generated answer.
 */
export const generateAnswer = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // low for factual accuracy
            maxOutputTokens: 512, // prevent overly long responses
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const data = await response.json();

    // Optional: log raw output for debugging
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    // Safely extract text output
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      "No response generated.";

    return text.trim();
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return "Error: Unable to generate answer from Gemini.";
  }
};
