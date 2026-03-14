import { asyncHandler } from "../utils/asyncHandler.js";
import { generateImageCaptions } from "../services/geminiService.js";

export const createCaptions = asyncHandler(async (req, res) => {
  const {
    imageUrl,
    businessType,
    extraContext,
    tone,
    targetAudience,
    language
  } = req.body;

  if (!imageUrl) {
    res.status(400);
    throw new Error("imageUrl is required");
  }

  const result = await generateImageCaptions({
    imageUrl,
    businessType,
    extraContext,
    tone,
    targetAudience,
    language
  });

  res.json(result);
});