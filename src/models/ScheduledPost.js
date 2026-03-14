import mongoose from "mongoose";

const scheduledPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pageId: { type: String, required: true },
    pageAccessToken: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "posting", "posted", "failed"],
      default: "scheduled"
    },
    facebookPostId: { type: String, default: null },
    facebookPhotoId: { type: String, default: null },
    errorMessage: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledPost", scheduledPostSchema);