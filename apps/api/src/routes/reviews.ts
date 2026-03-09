import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { runCommitteeReview } from "../services/orchestrator.js";

export const reviewsRouter = new Hono();

// Active SSE connections per review
const sseConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export function broadcastToolCall(reviewId: string, event: object) {
  const controllers = sseConnections.get(reviewId);
  if (!controllers) return;
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const controller of controllers) {
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch {
      controllers.delete(controller);
    }
  }
}

reviewsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const protocol_name = body.protocolName || body.protocol_name;
  const notes = body.notes;
  const [review] = await db
    .insert(schema.reviews)
    .values({
      protocolName: protocol_name,
      notes,
      status: "pending",
      toolCalls: [],
    })
    .returning();

  // Start review in background
  runCommitteeReview(review.id, protocol_name, notes).catch(console.error);

  return c.json(review, 201);
});

reviewsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [row] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

reviewsRouter.get("/:id/stream", async (c) => {
  const id = c.req.param("id");

  const stream = new ReadableStream({
    start(controller) {
      if (!sseConnections.has(id)) {
        sseConnections.set(id, new Set());
      }
      sseConnections.get(id)!.add(controller);

      // Send initial state
      db.select()
        .from(schema.reviews)
        .where(eq(schema.reviews.id, id))
        .then(([review]) => {
          if (review) {
            const data = `data: ${JSON.stringify({ type: "init", review })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
        });
    },
    cancel(controller) {
      sseConnections.get(id)?.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
