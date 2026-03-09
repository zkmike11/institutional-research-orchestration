import { Hono } from "hono";
import { db, schema } from "../db/index.js";

export const portfolioRouter = new Hono();

portfolioRouter.get("/", async (c) => {
  const rows = await db.select().from(schema.portfolio);
  return c.json(rows);
});

portfolioRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(schema.portfolio).values(body).returning();
  return c.json(row, 201);
});
