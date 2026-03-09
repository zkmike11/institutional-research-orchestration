import { Hono } from "hono";
import { eq, desc, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";

export const learningsRouter = new Hono();

learningsRouter.get("/", async (c) => {
  const rows = await db.select().from(schema.learnings).orderBy(desc(schema.learnings.createdAt));
  return c.json(rows);
});

learningsRouter.get("/search", async (c) => {
  const q = c.req.query("q") || "";
  const rows = await db
    .select()
    .from(schema.learnings)
    .where(or(ilike(schema.learnings.content, `%${q}%`), ilike(schema.learnings.category, `%${q}%`), ilike(schema.learnings.protocol, `%${q}%`)))
    .orderBy(desc(schema.learnings.createdAt))
    .limit(20);
  return c.json(rows);
});

learningsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(schema.learnings).values(body).returning();
  return c.json(row, 201);
});
