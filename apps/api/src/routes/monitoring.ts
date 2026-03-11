import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";

export const monitoringRouter = new Hono();

// Get signposts for a report
monitoringRouter.get("/signposts/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const rows = await db
    .select()
    .from(schema.signposts)
    .where(eq(schema.signposts.reportId, reportId))
    .orderBy(desc(schema.signposts.createdAt));
  return c.json(rows);
});

// Get kill criteria for a report
monitoringRouter.get("/kill-criteria/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const rows = await db
    .select()
    .from(schema.killCriteria)
    .where(eq(schema.killCriteria.reportId, reportId))
    .orderBy(desc(schema.killCriteria.createdAt));
  return c.json(rows);
});

// Get conviction timeline for a report
monitoringRouter.get("/conviction/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const rows = await db
    .select()
    .from(schema.convictionTimeline)
    .where(eq(schema.convictionTimeline.reportId, reportId))
    .orderBy(desc(schema.convictionTimeline.createdAt));
  return c.json(rows);
});

// Get predictions for a report
monitoringRouter.get("/predictions/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const rows = await db
    .select()
    .from(schema.predictions)
    .where(eq(schema.predictions.reportId, reportId))
    .orderBy(desc(schema.predictions.createdAt));
  return c.json(rows);
});
