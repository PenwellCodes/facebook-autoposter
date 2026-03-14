import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function extractJson(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function generateImageCaptions({
  imageUrl,
  businessType = "",
  extraContext = "",
  tone = "sales",
  targetAudience = "general customers",
  language = "English"
}) {
  const prompt = `
Analyze the uploaded image for a Facebook business post.

Use these optional details:
Business type: ${businessType || "Not provided"}
Extra context: ${extraContext || "Not provided"}
Tone: ${tone}
Target audience: ${targetAudience}
Language: ${language}

Return valid JSON only in this exact shape:
{
  "imageSummary": "...",
  "contentType": "...",
  "captions": [
    { "type": "short", "text": "..." },
    { "type": "sales", "text": "..." },
    { "type": "professional", "text": "..." }
  ],
  "cta": "...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "bestPostingTime": "...",
  "contentAngle": "..."
}

Rules:
- Make captions suitable for Facebook Pages
- Keep captions practical and natural
- Keep each caption under 120 words
- Do not use markdown
- Output JSON only
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: imageUrl
            }
          }
        ]
      }
    ]
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return extractJson(text);
}