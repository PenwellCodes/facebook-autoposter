import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCaptions } from "../services/geminiService.js";

export const createCaptions = asyncHandler(async (req, res) => {
  const {
    businessType,
    productDescription,
    tone,
    targetAudience,
    language
  } = req.body;

  if (!businessType || !productDescription) {
    res.status(400);
    throw new Error("businessType and productDescription are required");
  }

  const result = await generateCaptions({
    businessType,
    productDescription,
    tone,
    targetAudience,
    language
  });

  res.json(result);
});