import { Hono } from "hono";
import { executeTool } from "../services/tool-executor.js";

export const toolsRouter = new Hono();

toolsRouter.post("/:name", async (c) => {
  const name = c.req.param("name");
  const args = await c.req.json();

  try {
    const result = await executeTool(name, args);
    return c.json({ result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
