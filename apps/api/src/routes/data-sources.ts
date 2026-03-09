import { Hono } from "hono";
import { sql, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";

export const dataSourcesRouter = new Hono();

dataSourcesRouter.get("/", async (c) => {
  try {
    const period = c.req.query("period") || "30";
    const days = parseInt(period);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await db.execute(sql`
      SELECT
        source,
        tool_name as tool,
        ROUND(AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100)::int as success_rate,
        ROUND(AVG(latency_ms))::int as avg_latency_ms,
        COUNT(*)::int as calls,
        MAX(CASE WHEN NOT success THEN created_at END) as last_failure
      FROM tool_call_logs
      WHERE created_at >= ${since}
      GROUP BY source, tool_name
      ORDER BY source, tool_name
    `);

    return c.json(rows);
  } catch {
    return c.json([]);
  }
});

dataSourcesRouter.post("/log", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(schema.toolCallLogs).values(body).returning();
  return c.json(row, 201);
});
