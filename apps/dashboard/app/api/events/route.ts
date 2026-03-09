import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/cache";

const EVENTS_TTL = 3_600_000; // 1 hour

interface MacroEvent {
  date: string;
  type: "FOMC" | "CPI" | "PPI" | "NFP" | "GDP" | "EARNINGS" | "OTHER";
  description: string;
  impact: "high" | "medium" | "low";
}

// Hardcoded upcoming macro events (update periodically)
const MACRO_EVENTS: MacroEvent[] = [
  { date: "2026-03-12", type: "CPI", description: "CPI Report (February)", impact: "high" },
  { date: "2026-03-13", type: "PPI", description: "PPI Report (February)", impact: "medium" },
  { date: "2026-03-18", type: "FOMC", description: "FOMC Meeting Begins", impact: "high" },
  { date: "2026-03-19", type: "FOMC", description: "FOMC Rate Decision & Press Conference", impact: "high" },
  { date: "2026-04-02", type: "NFP", description: "Nonfarm Payrolls (March)", impact: "high" },
  { date: "2026-04-10", type: "CPI", description: "CPI Report (March)", impact: "high" },
  { date: "2026-04-11", type: "PPI", description: "PPI Report (March)", impact: "medium" },
  { date: "2026-04-30", type: "GDP", description: "GDP Advance Estimate (Q1)", impact: "high" },
  { date: "2026-05-06", type: "FOMC", description: "FOMC Meeting Begins", impact: "high" },
  { date: "2026-05-07", type: "FOMC", description: "FOMC Rate Decision & Press Conference", impact: "high" },
  { date: "2026-05-13", type: "CPI", description: "CPI Report (April)", impact: "high" },
  { date: "2026-06-02", type: "NFP", description: "Nonfarm Payrolls (May)", impact: "high" },
  { date: "2026-06-17", type: "FOMC", description: "FOMC Meeting Begins", impact: "high" },
  { date: "2026-06-18", type: "FOMC", description: "FOMC Rate Decision & SEP", impact: "high" },
];

export async function GET(_request: NextRequest) {
  try {
    const cacheKey = "events";
    const cached = cache.get<MacroEvent[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Filter to only return future events
    const today = new Date().toISOString().split("T")[0];
    const upcomingEvents = MACRO_EVENTS.filter((e) => e.date >= today);

    cache.set(cacheKey, upcomingEvents, EVENTS_TTL);
    return NextResponse.json(upcomingEvents);
  } catch (error) {
    console.error("[API] /events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
