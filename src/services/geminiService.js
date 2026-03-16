import axios from "axios";
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
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("imageUrl must be a non-empty string");
  }
  if (!/^https?:\/\//i.test(imageUrl)) {
    throw new Error("imageUrl must be an http(s) URL accessible by the server");
  }

  // Gemini `fileData.fileUri` is for files uploaded to Google's file store, not arbitrary URLs.
  // For public URLs, download the bytes and send as inlineData.
  const imageResp = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 15000,
    maxContentLength: 15 * 1024 * 1024,
    maxBodyLength: 15 * 1024 * 1024,
    validateStatus: (s) => s >= 200 && s < 300
  });

  const mimeType =
    imageResp.headers?.["content-type"]?.split(";")?.[0]?.trim() ||
    "image/jpeg";
  const base64 = Buffer.from(imageResp.data).toString("base64");

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

  const callGemini = async () =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64
              }
            }
          ]
        }
      ]
    });

  // Light retry for transient backend errors (Gemini occasionally returns 500).
  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await callGemini();
      break;
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (attempt < 3 && (status === 500 || status === 503)) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        continue;
      }
      throw err;
    }
  }

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return extractJson(text);
}