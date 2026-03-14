import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import aiRoutes from "./routes/aiRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Facebook autoposter API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;