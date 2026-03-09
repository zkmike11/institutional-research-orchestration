import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";

export const reportsRouter = new Hono();

reportsRouter.get("/", async (c) => {
  const rows = await db.select().from(schema.reports).orderBy(desc(schema.reports.createdAt));
  return c.json(rows);
});

reportsRouter.get("/consensus", async (c) => {
  const rows = await db.select().from(schema.reports);
  const total = rows.length;
  const buyCount = rows.filter((r) => r.recommendation === "BUY").length;
  const watchCount = rows.filter((r) => r.recommendation === "WATCH").length;
  const holdCount = rows.filter((r) => r.recommendation === "HOLD").length;
  const avgActivism = total > 0 ? rows.reduce((sum, r) => sum + (r.activismScore || 0), 0) / total : 0;

  const breakdown: Record<string, number> = {};
  for (const r of rows) {
    breakdown[r.recommendation] = (breakdown[r.recommendation] || 0) + 1;
  }

  return c.json({
    total: total,
    breakdown,
    vetoRate: 0,
    avgActivism: Math.round(avgActivism * 10) / 10,
  });
});

reportsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [row] = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

reportsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(schema.reports).values(body).returning();
  return c.json(row, 201);
});

reportsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(schema.reports).where(eq(schema.reports.id, id));
  return c.json({ deleted: true });
});
