import mongoose from "mongoose";

const mediaAssetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    cloudinaryPublicId: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("MediaAsset", mediaAssetSchema);