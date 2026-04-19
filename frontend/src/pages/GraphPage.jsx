import { useRef, useState } from "react";
import { Network, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import KnowledgeGraph from "../components/graph/KnowledgeGraph";
import GraphControls from "../components/graph/GraphControls";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import SourceBadge from "../components/query/SourceBadge";
import useGraphData from "../hooks/useGraphData";
import useHistory from "../hooks/useHistory";
import { groupHistoryIntoSessions } from "../utils/sessionData";
import { formatDateTime } from "../utils/formatDate";

const legend = [
  { label: "Questions", color: "#7C3AED" },
  { label: "Answers", color: "#3B82F6" },
  { label: "Topics", color: "#10B981" },
  { label: "Sessions", color: "#F59E0B" }
];

export default function GraphPage() {
  const navigate = useNavigate();
  const graphRef = useRef(null);
  const historyQuery = useHistory();
  const graphQuery = useGraphData();
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [showAnswers, setShowAnswers] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  const sessions = groupHistoryIntoSessions(historyQuery.data || []);
  const baseNodes = graphQuery.data?.nodes || [];
  const visibleNodes = baseNodes.filter((node) => {
    const topicMatches = selectedTopic === "all" || node.topics?.includes(selectedTopic) || node.label === selectedTopic;
    const typeMatches = showAnswers || node.type !== "answer";
    return topicMatches && typeMatches;
  });
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleLinks = (graphQuery.data?.links || []).filter(
    (link) => visibleNodeIds.has(link.source.id || link.source) && visibleNodeIds.has(link.target.id || link.target)
  );

  return (
    <Layout
      title="Knowledge Graph"
      subtitle="Explore how sessions, questions, answers, and topics connect."
      sessions={sessions}
      onSelectSession={(sessionId) => navigate("/", { state: { sessionId } })}
      onNewSession={() => navigate("/")}
    >
      {graphQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[640px] rounded-[32px]" />
          <Skeleton className="h-[640px] rounded-[32px]" />
        </div>
      ) : (
        <div className="relative">
          <KnowledgeGraph
            graphRef={graphRef}
            graphData={{ nodes: visibleNodes, links: visibleLinks }}
            onNodeSelect={setSelectedNode}
          />

          <GraphControls
            selectedTopic={selectedTopic}
            topics={graphQuery.data?.topics || []}
            onTopicChange={setSelectedTopic}
            showAnswers={showAnswers}
            onToggleAnswers={setShowAnswers}
            onZoomIn={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
            onZoomOut={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
            onFit={() => graphRef.current?.zoomToFit(400, 80)}
          />

          <div className="glass-panel absolute bottom-4 left-4 z-20 rounded-[24px] px-4 py-3">
            <div className="flex flex-wrap gap-4">
              {legend.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <aside
            className={[
              "glass-panel absolute right-4 top-28 z-20 w-full max-w-[320px] rounded-[28px] p-5 transition-all duration-200",
              selectedNode ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
            ].join(" ")}
          >
            {selectedNode ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {selectedNode.type === "topic" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Network className="h-5 w-5" />
                    )}
                  </div>
                  {selectedNode.source ? <SourceBadge source={selectedNode.source} /> : null}
                </div>

                <h2 className="mt-4 text-lg font-semibold text-text-primary">{selectedNode.label}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">
                  {selectedNode.content || selectedNode.preview || "No detail available for this node yet."}
                </p>

                <div className="mt-5 rounded-2xl bg-bg-elevated/80 p-4 text-sm text-text-muted">
                  <p>Created {formatDateTime(selectedNode.createdAt || new Date().toISOString())}</p>
                  <p className="mt-2 capitalize">Node type: {selectedNode.type}</p>
                </div>

                {(selectedNode.askText || selectedNode.content || selectedNode.label) ? (
                  <Button
                    className="mt-5 w-full"
                    onClick={() =>
                      navigate("/", {
                        state: {
                          question: selectedNode.askText || selectedNode.content || selectedNode.label
                        }
                      })
                    }
                  >
                    Ask again
                  </Button>
                ) : null}
              </>
            ) : null}
          </aside>
        </div>
      )}
    </Layout>
  );
}

