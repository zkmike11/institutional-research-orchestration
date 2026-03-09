import { api } from "@/lib/api";
import type { Report, Consensus, DataSourceStat } from "@/lib/api";
import { DecisionConsensus } from "@/components/library/DecisionConsensus";
import { MemoList } from "@/components/library/MemoList";
import { DataSourceReliability } from "@/components/library/DataSourceReliability";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let reports: Report[] = [];
  let consensus: Consensus | null = null;
  let dataSources: DataSourceStat[] = [];
  let error = false;

  try {
    // Fetch reports and consensus first (critical), data sources separately (non-critical)
    [reports, consensus] = await Promise.all([
      api.getReports(),
      api.getConsensus(),
    ]);
    dataSources = await api.getDataSources().catch(() => []);
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>Unable to connect to the API.</p>
        <p className="error-hint">
          Make sure the backend server is running on port 3001.
        </p>
      </div>
    );
  }

  return (
    <>
      {consensus && (
        <section className="dashboard-section">
          <DecisionConsensus consensus={consensus} />
        </section>
      )}

      <section className="dashboard-section">
        <MemoList reports={reports} />
      </section>

      <section className="dashboard-section">
        <DataSourceReliability initialDataSources={dataSources} />
      </section>
    </>
  );
}
