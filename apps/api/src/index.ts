import { Hono } from "hono";
import { cors } from "hono/cors";
import { reportsRouter } from "./routes/reports.js";
import { reviewsRouter } from "./routes/reviews.js";
import { learningsRouter } from "./routes/learnings.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { dataSourcesRouter } from "./routes/data-sources.js";
import { toolsRouter } from "./routes/tools.js";

const app = new Hono().basePath("/api");

app.use("*", cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));

app.route("/reports", reportsRouter);
app.route("/reviews", reviewsRouter);
app.route("/learnings", learningsRouter);
app.route("/portfolio", portfolioRouter);
app.route("/data-sources", dataSourcesRouter);
app.route("/tools", toolsRouter);

app.get("/health", (c) => c.json({ status: "ok" }));

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("⚠ ANTHROPIC_API_KEY not set. Web UI reviews will fail. Use the CLI pipeline instead.");
}

export default {
  port: parseInt(process.env.PORT || "3001"),
  fetch: app.fetch,
};
