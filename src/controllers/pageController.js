import User from "../models/User.js";
import Page from "../models/Page.js";
import { fetchManagedPages } from "../services/FacebookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPages = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const pages = await Page.find({ userId }).sort({ name: 1 });
  res.json(pages);
});

export const refreshPages = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const pages = await fetchManagedPages(user.accessToken);

  for (const page of pages) {
    await Page.findOneAndUpdate(
      {
        userId: user._id,
        pageId: page.id
      },
      {
        userId: user._id,
        pageId: page.id,
        name: page.name,
        category: page.category || "",
        accessToken: page.access_token
      },
      { new: true, upsert: true }
    );
  }

  const savedPages = await Page.find({ userId }).sort({ name: 1 });

  res.json({
    message: "Pages refreshed",
    pages: savedPages
  });
});