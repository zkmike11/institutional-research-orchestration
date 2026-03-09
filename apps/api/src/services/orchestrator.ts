import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { executeTool } from "./tool-executor.js";
import { broadcastToolCall } from "../routes/reviews.js";
import { COMMITTEE_SYSTEM_PROMPT } from "./system-prompt.js";
import { TOOL_SCHEMAS } from "./tool-schemas.js";

const anthropic = new Anthropic();

export async function runCommitteeReview(reviewId: string, protocolName: string, notes?: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const { runDemoReview } = await import("./demo-review.js");
    return runDemoReview(reviewId, protocolName, notes);
  }

  await db
    .update(schema.reviews)
    .set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(schema.reviews.id, reviewId));

  const toolCallLog: any[] = [];
  let totalToolCalls = 0;

  try {
    let messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `Run a full investment committee review on: ${protocolName}${notes ? `\n\nAdditional context: ${notes}` : ""}`,
      },
    ];

    // Agentic loop: keep calling until no more tool_use blocks
    while (true) {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 16000,
        system: COMMITTEE_SYSTEM_PROMPT,
        messages,
        tools: TOOL_SCHEMAS,
      });

      // Collect tool uses and text from this response
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ContentBlockParam & { type: "tool_use" } => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) {
        // No more tool calls — extract final memo text
        const textBlocks = response.content.filter((b) => b.type === "text");
        const finalText = textBlocks.map((b: any) => b.text).join("\n");

        // Parse and save the memo
        await saveMemo(reviewId, protocolName, finalText, totalToolCalls);
        break;
      }

      // Process each tool call
      const toolResults: Anthropic.MessageParam["content"] = [];

      for (const block of toolUseBlocks) {
        totalToolCalls++;
        const toolName = (block as any).name;
        const toolInput = (block as any).input || {};
        const toolId = (block as any).id;

        broadcastToolCall(reviewId, {
          type: "tool_call",
          index: totalToolCalls,
          name: toolName,
          args: summarizeArgs(toolInput),
          status: "running",
        });

        const start = Date.now();
        let result: any;
        let success = true;

        try {
          result = await executeTool(toolName, toolInput);
        } catch (error: any) {
          result = { error: error.message };
          success = false;
        }

        const latency = Date.now() - start;

        // Log to data source reliability
        const source = inferSource(toolName);
        db.insert(schema.toolCallLogs)
          .values({
            reviewId,
            source,
            toolName,
            success,
            latencyMs: latency,
            errorMessage: success ? null : result?.error,
          })
          .catch(console.error);

        const entry = {
          name: toolName,
          args: summarizeArgs(toolInput),
          status: success ? "complete" : "error",
          latency_ms: latency,
        };
        toolCallLog.push(entry);

        broadcastToolCall(reviewId, {
          type: "tool_complete",
          index: totalToolCalls,
          ...entry,
        });

        // Truncate large results to avoid blowing context
        const resultStr = JSON.stringify(result);
        const truncated = resultStr.length > 8000 ? resultStr.slice(0, 8000) + "...[truncated]" : resultStr;

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolId,
          content: truncated,
        } as any);
      }

      // Update review with tool call progress
      await db
        .update(schema.reviews)
        .set({ toolCalls: toolCallLog })
        .where(eq(schema.reviews.id, reviewId));

      // Add assistant message + tool results to conversation
      messages.push({ role: "assistant", content: response.content as any });
      messages.push({ role: "user", content: toolResults as any });
    }

    await db
      .update(schema.reviews)
      .set({ status: "complete", completedAt: new Date().toISOString(), toolCalls: toolCallLog })
      .where(eq(schema.reviews.id, reviewId));

    broadcastToolCall(reviewId, { type: "complete", tool_calls_count: totalToolCalls });
  } catch (error: any) {
    console.error("Review failed:", error);
    await db
      .update(schema.reviews)
      .set({ status: "failed", toolCalls: toolCallLog })
      .where(eq(schema.reviews.id, reviewId));

    broadcastToolCall(reviewId, { type: "error", message: error.message });
  }
}

async function saveMemo(reviewId: string, protocolName: string, memoText: string, toolCallsCount: number) {
  // Parse the memo text to extract structured data
  const recommendation = extractField(memoText, /\b(BUY|WATCH|HOLD|REDUCE|EXIT)\b/) || "WATCH";
  const conviction = extractField(memoText, /\b(LOW|MEDIUM|HIGH)\b\s*conviction/i) || "MEDIUM";
  const phase = extractField(memoText, /Phase\s*(\d)/i);
  const activismMatch = memoText.match(/Activism\s*Score[:\s]*(\d+)/i);

  const [report] = await db
    .insert(schema.reports)
    .values({
      protocolName,
      recommendation,
      conviction,
      maturationPhase: phase ? `Phase ${phase}` : null,
      activismScore: activismMatch ? parseInt(activismMatch[1]) : null,
      positionSize: extractField(memoText, /(\d+%?\s*NAV[^.]*)/i) || "",
      content: { raw: memoText },
      toolCallsCount,
    })
    .returning();

  await db
    .update(schema.reviews)
    .set({ reportId: report.id })
    .where(eq(schema.reviews.id, reviewId));

  return report;
}

function extractField(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1] || match[0] : null;
}

function summarizeArgs(args: Record<string, any>): string {
  const vals = Object.values(args).filter(Boolean);
  return vals.length > 0 ? vals.join(", ").slice(0, 60) : "";
}

function inferSource(toolName: string): string {
  if (["resolve_protocol", "protocol_snapshot", "revenue_data", "tvl_data", "fee_data", "compare_protocols", "dex_volume", "yield_data", "stablecoin_data", "chain_tvl", "protocol_list", "valuation_multiples"].includes(toolName)) return "defillama";
  if (["token_price", "token_info", "market_data", "token_unlocks"].includes(toolName)) return "coingecko";
  if (["search_spaces", "detect_governance", "snapshot_proposals", "snapshot_votes", "snapshot_voters", "governance_health", "voting_power", "delegate_info", "proposal_pipeline", "governance_score"].includes(toolName)) return "snapshot";
  if (["forum_posts", "forum_search"].includes(toolName)) return "discourse";
  if (["contract_info", "token_holders", "transaction_history", "contract_verified", "token_transfers", "gas_usage"].includes(toolName)) return "etherscan";
  return "internal";
}
