#!/usr/bin/env bun
/**
 * Save a completed memo to the database.
 *
 * Usage: bun run apps/api/src/cli/save-memo.ts <review_id> <memo_file_path>
 *
 * The memo file should be a markdown file with the full 18-section memo.
 * Metadata (recommendation, conviction, etc.) is parsed from the content.
 */

import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";

const reviewId = process.argv[2];
const memoPath = process.argv[3];

if (!reviewId || !memoPath) {
  console.error("Usage: bun run apps/api/src/cli/save-memo.ts <review_id> <memo_file_path>");
  process.exit(1);
}

const memoText = await Bun.file(memoPath).text();

// Get the review to find protocol name and tool call count
const [review] = await db
  .select()
  .from(schema.reviews)
  .where(eq(schema.reviews.id, reviewId));

if (!review) {
  console.error(`Review not found: ${reviewId}`);
  process.exit(1);
}

// Parse metadata from memo text
function extractField(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1] || match[0] : null;
}

const recommendation = extractField(memoText, /Recommendation:\s*(BUY|WATCH|HOLD|REDUCE|EXIT)/i) || "WATCH";
const conviction = extractField(memoText, /Conviction:\s*(LOW|MEDIUM|HIGH)/i) || "MEDIUM";
const phase = extractField(memoText, /Phase\s*(\d)/i);
const activismMatch = memoText.match(/Activism\s*Score[:\s]*(\d+)/i);
const positionSize = extractField(memoText, /Position\s*Size[:\s]*([^\n]+)/i) || "";

const toolCallCount = (review.toolCalls as any[])?.length || 0;

const [report] = await db
  .insert(schema.reports)
  .values({
    protocolName: review.protocolName,
    recommendation: recommendation.toUpperCase(),
    conviction: conviction.toUpperCase(),
    maturationPhase: phase ? `Phase ${phase}` : null,
    activismScore: activismMatch ? parseInt(activismMatch[1]) : null,
    positionSize: positionSize.trim(),
    content: { raw: memoText },
    toolCallsCount: toolCallCount,
  })
  .returning();

await db
  .update(schema.reviews)
  .set({
    status: "complete",
    reportId: report.id,
    completedAt: new Date().toISOString() as any,
  })
  .where(eq(schema.reviews.id, reviewId));

console.log(`Memo saved.`);
console.log(`  Report ID: ${report.id}`);
console.log(`  Protocol: ${review.protocolName}`);
console.log(`  Recommendation: ${recommendation}`);
console.log(`  Conviction: ${conviction}`);
console.log(`  Phase: ${phase ? `Phase ${phase}` : "N/A"}`);
console.log(`  View at: http://localhost:3000/reports/${report.id}`);

process.exit(0);
