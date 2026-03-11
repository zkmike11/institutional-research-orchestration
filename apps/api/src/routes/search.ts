import { Hono } from "hono";
import { ilike, or, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";

export const searchRouter = new Hono();

searchRouter.get("/", async (c) => {
  const q = c.req.query("q") || "";
  const type = c.req.query("type"); // "reports" | "learnings" | "all"
  const limit = parseInt(c.req.query("limit") || "20");

  if (!q.trim()) {
    return c.json({ reports: [], learnings: [] });
  }

  const pattern = `%${q}%`;
  const results: { reports: any[]; learnings: any[] } = {
    reports: [],
    learnings: [],
  };

  if (!type || type === "all" || type === "reports") {
    results.reports = await db
      .select({
        id: schema.reports.id,
        protocolName: schema.reports.protocolName,
        recommendation: schema.reports.recommendation,
        conviction: schema.reports.conviction,
        maturationPhase: schema.reports.maturationPhase,
        createdAt: schema.reports.createdAt,
      })
      .from(schema.reports)
      .where(
        or(
          ilike(schema.reports.protocolName, pattern),
          ilike(schema.reports.recommendation, pattern),
        )
      )
      .orderBy(desc(schema.reports.createdAt))
      .limit(limit);
  }

  if (!type || type === "all" || type === "learnings") {
    results.learnings = await db
      .select()
      .from(schema.learnings)
      .where(
        or(
          ilike(schema.learnings.content, pattern),
          ilike(schema.learnings.category, pattern),
          ilike(schema.learnings.protocol, pattern),
        )
      )
      .orderBy(desc(schema.learnings.createdAt))
      .limit(limit);
  }

  return c.json(results);
});
