import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    agencyOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    industry: {
      type: String,
      default: "",
      trim: true
    },
    contactName: {
      type: String,
      default: "",
      trim: true
    },
    email: {
      type: String,
      default: "",
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    pageId: {
      type: String,
      default: "",
      trim: true
    },
    pageName: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active"
    }
  },
  { timestamps: true }
);

clientSchema.index({ agencyOwnerId: 1, name: 1 });

export default mongoose.model("Client", clientSchema);