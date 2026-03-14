import User from "../models/User.js";
import Page from "../models/Page.js";
import {
  exchangeCodeForAccessToken,
  fetchManagedPages,
  getCurrentUserProfile,
  getFacebookLoginUrl
} from "../services/FacebookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const redirectToFacebook = asyncHandler(async (req, res) => {
  const url = getFacebookLoginUrl();
  res.redirect(url);
});

export const facebookCallback = asyncHandler(async (req, res) => {
  const { code, error, error_message } = req.query;

  if (error) {
    return res.status(400).json({
      message: error_message || "Facebook authorization failed"
    });
  }

  if (!code) {
    return res.status(400).json({ message: "Missing authorization code" });
  }

  const userAccessToken = await exchangeCodeForAccessToken(code);
  const profile = await getCurrentUserProfile(userAccessToken);

  let user = await User.findOne({ facebookUserId: profile.id });

  if (!user) {
    user = await User.create({
      facebookUserId: profile.id,
      name: profile.name,
      accessToken: userAccessToken
    });
  } else {
    user.name = profile.name;
    user.accessToken = userAccessToken;
    await user.save();
  }

  const pages = await fetchManagedPages(userAccessToken);

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
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  }

  res.json({
    message: "Facebook connected successfully",
    user: {
      id: user._id,
      facebookUserId: user.facebookUserId,
      name: user.name
    },
    pagesCount: pages.length
  });
});