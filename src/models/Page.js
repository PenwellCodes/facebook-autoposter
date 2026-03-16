import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    agencyOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },
    pageId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ""
    },
    accessToken: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

pageSchema.index({ agencyOwnerId: 1, pageId: 1 }, { unique: true });

export default mongoose.model("Page", pageSchema);