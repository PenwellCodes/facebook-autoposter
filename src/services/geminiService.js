import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateCaptions({
  businessType,
  productDescription,
  tone = "sales",
  targetAudience = "general customers",
  language = "English"
}) {
  const prompt = `
You are a social media copywriter for small businesses.

Generate content for a Facebook image post.

Business type: ${businessType}
Product or offer: ${productDescription}
Tone: ${tone}
Target audience: ${targetAudience}
Language: ${language}

Return valid JSON with this exact shape:
{
  "captions": [
    { "type": "short", "text": "..." },
    { "type": "sales", "text": "..." },
    { "type": "professional", "text": "..." }
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "cta": "short call to action",
  "bestPostingTime": "example: 18:00 local time",
  "contentAngle": "one short sentence"
}

Rules:
- Make captions practical for Facebook Pages
- Do not use markdown
- Keep each caption under 120 words
- Make the CTA concise
- Hashtags should be relevant and not spammy
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const text = response.text?.trim() || "";

  // basic cleanup if the model wraps JSON in fences
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  return JSON.parse(cleaned);
}