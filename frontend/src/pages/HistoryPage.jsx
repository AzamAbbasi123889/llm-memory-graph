import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, ChevronDown, ChevronUp, Download, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import SourceBadge from "../components/query/SourceBadge";
import useHistory from "../hooks/useHistory";
import { deleteQuestion } from "../api/queryApi";
import exportPdf from "../utils/exportPdf";
import { formatDateTime } from "../utils/formatDate";
import { groupHistoryIntoSessions } from "../utils/sessionData";

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const historyQuery = useHistory();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  const sessions = groupHistoryIntoSessions(historyQuery.data || []);
  const filteredHistory = (historyQuery.data || []).filter((item) => {
    const value = search.toLowerCase();
    return (
      item.question.toLowerCase().includes(value) ||
      item.answer.toLowerCase().includes(value)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  return (
    <Layout
      title="Question History"
      subtitle="Everything NeuroGraph has already learned for you."
      sessions={sessions}
      onSelectSession={(sessionId) => navigate("/", { state: { sessionId } })}
      onNewSession={() => navigate("/")}
      actions={
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => exportPdf(filteredHistory)}
          disabled={!filteredHistory.length}
        >
          Export PDF
        </Button>
      }
    >
      <div className="space-y-6">
        <Input
          id="history-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search questions and answers"
          icon={Search}
        />

        {historyQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-panel rounded-[24px] p-5">
                <Skeleton className="h-5 w-2/3 rounded-full" />
                <Skeleton className="mt-4 h-4 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-panel flex min-h-[320px] flex-col items-center justify-center rounded-[28px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-text-primary">Nothing here yet. Start asking!</h2>
            <p className="mt-2 max-w-md text-sm text-text-muted">
              Your saved question history will appear here after the first few answers.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedItems.map((item) => {
                const isExpanded = Boolean(expanded[item.id]);
                return (
                  <article key={item.id} className="glass-panel rounded-[24px] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <SourceBadge source={item.source} />
                          <span className="text-xs text-text-muted">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <h2 className="mt-3 text-lg font-semibold text-text-primary">
                          {item.question}
                        </h2>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">
                          {isExpanded ? item.answer : `${item.answer.slice(0, 180)}${item.answer.length > 180 ? "..." : ""}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setExpanded((current) => ({
                              ...current,
                              [item.id]: !current[item.id]
                            }))
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Expand
                            </>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setPendingDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this memory?"
        description="This removes the saved question and answer from your history and graph."
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">{pendingDelete?.question}</p>
      </Modal>
    </Layout>
  );
}
