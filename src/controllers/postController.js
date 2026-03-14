import Page from "../models/Page.js";
import ScheduledPost from "../models/ScheduledPost.js";
import { publishPhotoToPage } from "../services/FacebookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPost = asyncHandler(async (req, res) => {
  const { userId, pageId, imageUrl, caption, scheduledFor } = req.body;

  if (!userId || !pageId || !imageUrl || !scheduledFor) {
    res.status(400);
    throw new Error("userId, pageId, imageUrl, and scheduledFor are required");
  }

  const page = await Page.findOne({ userId, pageId });
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }

  const post = await ScheduledPost.create({
    userId,
    pageId,
    pageAccessToken: page.accessToken,
    imageUrl,
    caption: caption || "",
    scheduledFor: new Date(scheduledFor),
    status: "scheduled"
  });

  res.status(201).json(post);
});

export const getPosts = asyncHandler(async (req, res) => {
  const { userId, status } = req.query;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const filter = { userId };
  if (status) filter.status = status;

  const posts = await ScheduledPost.find(filter).sort({ scheduledFor: 1 });
  res.json(posts);
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await ScheduledPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await ScheduledPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.status === "posted") {
    res.status(400);
    throw new Error("Posted items cannot be edited");
  }

  const { caption, scheduledFor, imageUrl } = req.body;

  if (typeof caption === "string") post.caption = caption;
  if (scheduledFor) post.scheduledFor = new Date(scheduledFor);
  if (imageUrl) post.imageUrl = imageUrl;

  post.status = "scheduled";
  post.errorMessage = null;

  await post.save();

  res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await ScheduledPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.status === "posted") {
    res.status(400);
    throw new Error("Posted items cannot be deleted from local DB through this route");
  }

  await post.deleteOne();

  res.json({ message: "Post deleted" });
});

export const publishNow = asyncHandler(async (req, res) => {
  const post = await ScheduledPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.status === "posted") {
    res.status(400);
    throw new Error("Post already published");
  }

  post.status = "posting";
  post.attempts += 1;
  await post.save();

  try {
    const result = await publishPhotoToPage({
      pageId: post.pageId,
      pageAccessToken: post.pageAccessToken,
      imageUrl: post.imageUrl,
      caption: post.caption
    });

    post.status = "posted";
    post.facebookPostId = result.post_id || null;
    post.facebookPhotoId = result.id || null;
    post.publishedAt = new Date();
    post.errorMessage = null;
    await post.save();

    res.json({
      message: "Post published",
      post
    });
  } catch (error) {
    post.status = "failed";
    post.errorMessage =
      error?.response?.data?.error?.message || error.message;
    await post.save();

    res.status(500).json({
      message: "Failed to publish post",
      error: post.errorMessage
    });
  }
});