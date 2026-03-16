import express from "express";
import {
  getPages,
  refreshPages,
  assignPageToClient,
  unassignPageFromClient
} from "../controllers/pageController.js";

const router = express.Router();

router.get("/", getPages);
router.post("/refresh", refreshPages);
router.patch("/assign-client", assignPageToClient);
router.patch("/unassign-client", unassignPageFromClient);

export default router;