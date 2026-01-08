import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/analyze-transformer", async (req, res) => {
  try {
    const data = req.body;

    const prompt = `
You are a senior transformer design engineer.

Return ONLY valid JSON in this format:
{
  "suggestions": [
    {
      "label": "Suggestion title",
      "field": "inputFieldName",
      "current": number,
      "suggested": number
    }
  ]
}

Rules:
- field must match frontend input names
- suggested must be numeric
- No explanations outside JSON

Design Data:
${JSON.stringify(data, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    const raw = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch {
      res.json({ suggestions: [] });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ suggestions: [] });3000
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI Backend running on port ${PORT}`);
});