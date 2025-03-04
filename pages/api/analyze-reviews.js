import { OpenAI } from "openai"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reviews } = req.body;

  if (!reviews || reviews.length === 0) {
    console.log("⚠️ No reviews provided.");
    return res.status(400).json({ error: 'No reviews provided' });
  }

  try {
    const formattedReviews = reviews.map((r, i) => `- ${r.comment} (Rating: ${r.rating}/5)`).join("\n");

    const prompt = `
      Analyze the following manager reviews and provide key insights. Offer recommendations based on feedback and areas needing improvement:

      Reviews:
      ${formattedReviews}

      Provide a structured summary with key observations and suggestions for improvement. Remove all the headings, only write it in a single paragraph manner. 
    `;

    console.log("🚀 Sending Prompt to OpenAI:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200, // Ensure response fits within limits
    });

    console.log("✅ OpenAI API Response:", response);

    const summaryText = response.choices?.[0]?.message?.content?.trim() || "No summary available.";
    console.log("✅ Extracted Summary:", summaryText);

    res.status(200).json({ summary: summaryText });

  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    res.status(500).json({ error: 'Failed to generate review summary' });
  }
}
