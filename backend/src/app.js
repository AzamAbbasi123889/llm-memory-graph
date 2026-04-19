import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NeuroGraph API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/graph", graphRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

