import express from "express";
import { createCaptions } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate-captions", createCaptions);

export default router;