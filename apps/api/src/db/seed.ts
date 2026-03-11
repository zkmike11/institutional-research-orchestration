import { db, schema } from "./index.js";
import { resolve } from "path";

// ── Fund config seed ─────────────────────────────────────────
await db.insert(schema.fundConfig).values([
  {
    key: "fund_thesis",
    value: {
      name: "Institutional Research Committee",
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
      min_annual_revenue: 1_000_000,
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
      Derivatives: 0.30,
      Other: 0.20,
    },
  },
]).onConflictDoNothing();

console.log("Fund config seeded.");

// ── Sectors seed ─────────────────────────────────────────────
await db.insert(schema.sectors).values([
  { name: "Lending", maxAllocation: 0.40, currentExposure: 0, protocolCount: 0 },
  { name: "DEX", maxAllocation: 0.40, currentExposure: 0, protocolCount: 0 },
  { name: "Liquid Staking", maxAllocation: 0.30, currentExposure: 0, protocolCount: 0 },
  { name: "Stablecoins", maxAllocation: 0.25, currentExposure: 0, protocolCount: 0 },
  { name: "Derivatives", maxAllocation: 0.30, currentExposure: 0, protocolCount: 0 },
  { name: "Infrastructure", maxAllocation: 0.25, currentExposure: 0, protocolCount: 0 },
]).onConflictDoNothing();

console.log("Sectors seeded.");

// ── Mental models seed ───────────────────────────────────────
const modelsPath = resolve(import.meta.dir, "../../data/mental-models.json");
const modelsFile = Bun.file(modelsPath);
if (await modelsFile.exists()) {
  const models = await modelsFile.json();
  const existingModels = await db.select().from(schema.mentalModels).limit(1);
  if (existingModels.length === 0) {
    await db.insert(schema.mentalModels).values(models);
    console.log(`Mental models seeded: ${models.length} models.`);
  } else {
    console.log("Mental models already exist, skipping.");
  }
}

// ── Report seed (demo data) ─────────────────────────────────
const existingReports = await db.select().from(schema.reports).limit(1);

const seededReportIds: string[] = [];

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
        toolCallsCount: 65,
      })
      .returning();

    seededReportIds.push(report.id);
    console.log(`  Seeded ${memo.protocol}: ${recommendation} (${report.id})`);
  }

  console.log("Reports seeded.");
} else {
  console.log("Reports already exist, skipping seed.");
  // Collect existing IDs for monitoring seed
  const existing = await db.select({ id: schema.reports.id }).from(schema.reports).limit(5);
  seededReportIds.push(...existing.map((r) => r.id));
}

// ── Monitoring data seed (signposts, kill criteria, conviction) ──
if (seededReportIds.length > 0) {
  const existingSignposts = await db.select().from(schema.signposts).limit(1);
  if (existingSignposts.length === 0) {
    const reportId = seededReportIds[0];

    // Seed signposts
    await db.insert(schema.signposts).values([
      {
        reportId,
        description: "TVL stays above $1B for 90 consecutive days",
        status: "intact",
        convictionImpact: 1,
      },
      {
        reportId,
        description: "Fee switch governance proposal reaches quorum",
        status: "intact",
        convictionImpact: 2,
      },
      {
        reportId,
        description: "Token emissions rate decreases by 50%+ as scheduled",
        status: "intact",
        convictionImpact: 1,
      },
      {
        reportId,
        description: "Competitor captures >30% market share in lending",
        status: "intact",
        convictionImpact: -2,
      },
    ]);

    // Seed kill criteria
    await db.insert(schema.killCriteria).values([
      {
        reportId,
        criteria: "Smart contract exploit resulting in >$50M loss",
        status: "active",
        monitoringSource: "on-chain monitoring",
        checkFrequency: "daily",
        triggerThreshold: "$50M TVL loss in single event",
      },
      {
        reportId,
        criteria: "SEC enforcement action directly targeting the protocol",
        status: "active",
        monitoringSource: "regulatory feeds",
        checkFrequency: "daily",
        triggerThreshold: "Wells notice or formal complaint",
      },
      {
        reportId,
        criteria: "Core team departure (>50% of founding team leaves)",
        status: "active",
        monitoringSource: "social monitoring",
        checkFrequency: "weekly",
        triggerThreshold: "3+ core contributors leave within 30 days",
      },
    ]);

    // Seed conviction timeline
    await db.insert(schema.convictionTimeline).values([
      {
        reportId,
        conviction: "MEDIUM",
        probThesis: 0.55,
        reason: "Initial committee review — strong fundamentals but governance concentration risk noted",
        source: "re-review",
      },
      {
        reportId,
        conviction: "HIGH",
        probThesis: 0.72,
        reason: "Fee switch proposal passed governance vote with 89% approval — significant catalyst",
        source: "signpost",
      },
    ]);

    // Seed predictions
    await db.insert(schema.predictions).values([
      {
        reportId,
        claim: "Protocol will activate fee switch within 6 months",
        probability: 0.65,
        resolutionCriteria: "On-chain fee distribution to token holders begins",
      },
      {
        reportId,
        claim: "TVL will exceed $2B within 12 months",
        probability: 0.45,
        resolutionCriteria: "DefiLlama TVL reading consistently above $2B for 7+ days",
      },
    ]);

    console.log("Monitoring data seeded for first report.");
  } else {
    console.log("Monitoring data already exists, skipping.");
  }
}

console.log("Seed complete.");
process.exit(0);
