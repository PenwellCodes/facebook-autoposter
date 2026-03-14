import cloudinary from "../config/cloudinary.js";
import MediaAsset from "../models/MediaAsset.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImage = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No image file uploaded");
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "facebook-autoposter"
  });

  const asset = await MediaAsset.create({
    userId,
    fileName: req.file.originalname,
    imageUrl: result.secure_url,
    mimeType: req.file.mimetype,
    size: req.file.size,
    cloudinaryPublicId: result.public_id
  });

  res.status(201).json(asset);
});