import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pageId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    accessToken: { type: String, required: true }
  },
  { timestamps: true }
);

pageSchema.index({ userId: 1, pageId: 1 }, { unique: true });

export default mongoose.model("Page", pageSchema);