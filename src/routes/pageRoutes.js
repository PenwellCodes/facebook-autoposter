import express from "express";
import { getPages, refreshPages } from "../controllers/pageController.js";

const router = express.Router();

router.get("/", getPages);
router.post("/refresh", refreshPages);

export default router;