import OpenAI from "openai"; // ✅ Correct OpenAI import

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { reviews } = req.body;

  if (!reviews || reviews.length === 0) {
    return res.status(400).json({ error: "No reviews provided" });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ New OpenAI API call

    const reviewText = reviews.map((r) => `- ${r.comment} (Rating: ${r.rating}/5)`).join("\n");

    const prompt = `Analyze the following manager reviews and provide a one-line summary indicating whether they are mostly positive or mostly negative:\n\n${reviewText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50, 
    });

    const summary = response.choices[0]?.message?.content || "No summary available.";

    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({ error: "Error generating summary" });
  }
}
