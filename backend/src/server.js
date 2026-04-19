import app from "./app.js";
import env from "./config/env.js";
import { bootstrapDatabase, closeDriver, verifyConnectivity } from "./config/neo4j.js";

async function startServer() {
  try {
    await verifyConnectivity();
    await bootstrapDatabase();

    app.listen(env.port, () => {
      // UX NOTE: The backend verifies Neo4j before listening so the frontend never boots into a half-ready API.
      console.log(`NeuroGraph API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start NeuroGraph API:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await closeDriver();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDriver();
  process.exit(0);
});

startServer();
