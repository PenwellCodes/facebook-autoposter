import express from "express";
import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient
} from "../controllers/clientController.js";

const router = express.Router();

router.post("/", createClient);
router.get("/", getClients);
router.get("/:id", getClientById);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;