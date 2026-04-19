import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BrainCircuit,
  DatabaseZap,
  MessageSquareMore
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import StatsCard from "../components/dashboard/StatsCard";
import CacheDonut from "../components/dashboard/CacheDonut";
import GrowthLineChart from "../components/dashboard/GrowthLineChart";
import Skeleton from "../components/ui/Skeleton";
import useHistory from "../hooks/useHistory";
import { getStats } from "../api/graphApi";
import { groupHistoryIntoSessions } from "../utils/sessionData";
import { formatDate } from "../utils/formatDate";

export default function DashboardPage() {
  const navigate = useNavigate();
  const historyQuery = useHistory();
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: getStats
  });

  const sessions = groupHistoryIntoSessions(historyQuery.data || []);
  const stats = statsQuery.data;

  return (
    <Layout
      title="Intelligence Overview"
      subtitle="Operational visibility across memory reuse, freshness, and usage."
      sessions={sessions}
      onSelectSession={(sessionId) => navigate("/", { state: { sessionId } })}
      onNewSession={() => navigate("/")}
    >
      {statsQuery.isLoading ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[148px] rounded-[24px]" />
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-[340px] rounded-[24px]" />
            <Skeleton className="h-[340px] rounded-[24px]" />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Questions"
              value={stats?.overview?.totalQuestions || 0}
              icon={MessageSquareMore}
              trend={stats?.overview?.questionTrend}
              delay={0}
            />
            <StatsCard
              title="Cache Hit Rate"
              value={stats?.overview?.cacheHitRate || 0}
              icon={DatabaseZap}
              trend={stats?.overview?.cacheTrend}
              suffix="%"
              delay={100}
            />
            <StatsCard
              title="LLM Calls"
              value={stats?.overview?.llmCalls || 0}
              icon={Activity}
              trend={stats?.overview?.llmTrend}
              delay={200}
            />
            <StatsCard
              title="Tokens Saved"
              value={stats?.overview?.tokensSaved || 0}
              icon={BrainCircuit}
              trend={stats?.overview?.tokensTrend}
              delay={300}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <CacheDonut data={stats?.cacheBreakdown || []} />
            <GrowthLineChart data={stats?.dailyQuestions || []} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel rounded-[24px] p-5">
              <h3 className="text-lg font-semibold text-text-primary">Most Asked Questions</h3>
              <p className="mt-1 text-sm text-text-muted">Top repeated prompts across saved memory</p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-bg-elevated/80 text-left text-text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Question</th>
                      <th className="px-4 py-3 font-medium">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(stats?.mostAskedQuestions || []).map((item) => (
                      <tr key={item.question} className="hover:bg-bg-elevated/40">
                        <td className="px-4 py-3 text-text-primary">{item.question}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                            {item.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel rounded-[24px] p-5">
              <h3 className="text-lg font-semibold text-text-primary">Recent Sessions</h3>
              <p className="mt-1 text-sm text-text-muted">Newest activity entering the graph</p>

              <div className="mt-5 space-y-3">
                {(stats?.recentSessions || []).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-border bg-bg-elevated/60 p-4"
                  >
                    <p className="text-sm font-medium text-text-primary">{session.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                      <span>{session.questionCount} questions</span>
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
