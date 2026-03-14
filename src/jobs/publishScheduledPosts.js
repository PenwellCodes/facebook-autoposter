import cron from "node-cron";
import ScheduledPost from "../models/ScheduledPost.js";
import { publishPhotoToPage } from "../services/facebookService.js";

export function startPostPublisher() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const duePosts = await ScheduledPost.find({
      status: { $in: ["scheduled", "failed"] },
      scheduledFor: { $lte: now },
      attempts: { $lt: 3 }
    }).limit(20);

    for (const post of duePosts) {
      try {
        post.status = "posting";
        post.attempts += 1;
        await post.save();

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
      } catch (error) {
        post.status = "failed";
        post.errorMessage =
          error?.response?.data?.error?.message || error.message;
        await post.save();
      }
    }
  });

  console.log("Scheduled post publisher started");
}