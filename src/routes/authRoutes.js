import express from "express";
import {
  facebookCallback,
  redirectToFacebook
} from "../controllers/authController.js";

const router = express.Router();

router.get("/facebook", redirectToFacebook);
router.get("/facebook/callback", facebookCallback);

export default router;