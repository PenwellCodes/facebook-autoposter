import express from "express";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  publishNow,
  updatePost
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/publish-now", publishNow);

export default router;