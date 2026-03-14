import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startPostPublisher } from "./jobs/publishScheduledPosts.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  startPostPublisher();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});