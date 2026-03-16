import Page from "../models/Page.js";
import ScheduledPost from "../models/ScheduledPost.js";
import { publishPhotoToPage } from "../services/facebookService.js";

export async function createPost(req, res) {
  try {
    const {
      agencyOwnerId,
      clientId = null,
      pageId,
      imageUrl,
      caption,
      scheduledFor
    } = req.body;

    if (!agencyOwnerId || !pageId || !imageUrl || !scheduledFor) {
      return res.status(400).json({
        message: "agencyOwnerId, pageId, imageUrl, and scheduledFor are required"
      });
    }

    const page = await Page.findOne({ agencyOwnerId, pageId });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const post = await ScheduledPost.create({
      agencyOwnerId,
      clientId,
      pageId,
      pageAccessToken: page.accessToken,
      imageUrl,
      caption: caption || "",
      scheduledFor: new Date(scheduledFor),
      status: "scheduled"
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPosts(req, res) {
  try {
    const { agencyOwnerId, clientId, status } = req.query;

    if (!agencyOwnerId) {
      return res.status(400).json({ message: "agencyOwnerId is required" });
    }

    const filter = { agencyOwnerId };

    if (clientId) {
      filter.clientId = clientId;
    }

    if (status) {
      filter.status = status;
    }

    const posts = await ScheduledPost.find(filter).sort({ scheduledFor: 1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPostById(req, res) {
  try {
    const post = await ScheduledPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updatePost(req, res) {
  try {
    const post = await ScheduledPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "posted") {
      return res.status(400).json({ message: "Posted items cannot be edited" });
    }

    const { caption, scheduledFor, imageUrl } = req.body;

    if (typeof caption === "string") post.caption = caption;
    if (scheduledFor) post.scheduledFor = new Date(scheduledFor);
    if (imageUrl) post.imageUrl = imageUrl;

    post.status = "scheduled";
    post.errorMessage = null;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await ScheduledPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "posted") {
      return res.status(400).json({
        message: "Posted items cannot be deleted from local DB through this route"
      });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function publishNow(req, res) {
  try {
    const post = await ScheduledPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "posted") {
      return res.status(400).json({ message: "Post already published" });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}