import mongoose from "mongoose";

const brandProfileSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true
    },
    tone: {
      type: String,
      default: "professional"
    },
    targetAudience: {
      type: String,
      default: "general customers"
    },
    language: {
      type: String,
      default: "English"
    },
    ctaStyle: {
      type: String,
      default: "Contact us today"
    },
    contentThemes: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("BrandProfile", brandProfileSchema);