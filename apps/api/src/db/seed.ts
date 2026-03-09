import { db, schema } from "./index.js";
import { resolve } from "path";

// ── Fund config seed ─────────────────────────────────────────
await db.insert(schema.fundConfig).values([
  {
    key: "fund_thesis",
    value: {
      name: "Markets, Inc.",
      thesis: "The most undervalued assets in crypto are not the newest or the loudest — they are the protocols with strong economic engines trapped behind weak governance. We target Phase 2-3 protocols where governance activism can unlock trapped value through fee switches, buybacks, revenue alignment, and token economics restructuring.",
      focus: ["DeFi", "Governance Activism", "Value Investing"],
    },
  },
  {
    key: "mandate_constraints",
    value: {
      max_single_position: 0.15,
      max_sector_concentration: 0.40,
      min_position_count: 5,
      max_position_count: 20,
      max_valuation_multiple: 50,
      governance_risk_cap: "3% NAV for CRITICAL governance risk",
    },
  },
  {
    key: "aum",
    value: { amount: 20_000_000, currency: "USD" },
  },
  {
    key: "sector_limits",
    value: {
      Lending: 0.40,
      DEX: 0.40,
      Staking: 0.30,
      Stablecoins: 0.25,
      Other: 0.20,
    },
  },
]).onConflictDoNothing();

console.log("Fund config seeded.");

// ── Report seed (demo data) ─────────────────────────────────
const existingReports = await db.select().from(schema.reports).limit(1);

if (existingReports.length === 0) {
  const dataDir = resolve(import.meta.dir, "../../data");

  const seedMemos = [
    { file: "9d504308-memo.md", protocol: "Aave" },
    { file: "ff14b47b-727d-403e-92f2-35b241e20fa0-memo.md", protocol: "Morpho" },
  ];

  for (const memo of seedMemos) {
    const filePath = resolve(dataDir, memo.file);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      console.warn(`  Skipping ${memo.protocol}: ${memo.file} not found`);
      continue;
    }

    const text = await file.text();

    const recommendation = text.match(/Recommendation:\s*(BUY|WATCH|HOLD|REDUCE|EXIT)/i)?.[1]?.toUpperCase() || "WATCH";
    const conviction = text.match(/Conviction:\s*(LOW|MEDIUM|HIGH)/i)?.[1]?.toUpperCase() || "MEDIUM";
    const phaseMatch = text.match(/Phase\s*(\d)/i);
    const activismMatch = text.match(/Activism\s*[Ss]core[:\s]*(\d+)/i);
    const positionMatch = text.match(/Position\s*[Ss]ize[:\s]*([^\n]+)/i);

    const [report] = await db
      .insert(schema.reports)
      .values({
        protocolName: memo.protocol,
        recommendation,
        conviction,
        maturationPhase: phaseMatch ? `Phase ${phaseMatch[1]}` : null,
        activismScore: activismMatch ? parseInt(activismMatch[1]) : null,
        positionSize: positionMatch ? positionMatch[1].trim() : "",
        content: { raw: text },
        toolCallsCount: 30,
      })
      .returning();

    console.log(`  Seeded ${memo.protocol}: ${recommendation} (${report.id})`);
  }

  console.log("Reports seeded.");
} else {
  console.log("Reports already exist, skipping seed.");
}

console.log("Seed complete.");
process.exit(0);
