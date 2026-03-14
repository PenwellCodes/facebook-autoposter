import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    facebookUserId: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    accessToken: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);