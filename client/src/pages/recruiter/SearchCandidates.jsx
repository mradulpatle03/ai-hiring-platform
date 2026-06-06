import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  searchApplicants,
  updateAppStatus,
  fetchOrCreateConversation,
} from "../../api/applications";
import { useFilters } from '../../hooks/useFilters';
import Layout from "../../components/Layout";
import FilterSidebar from "../../components/search/FilterSidebar";
import SearchBar from "../../components/search/SearchBar";
import SortControls from "../../components/search/SortControls";
import ActiveFilters from "../../components/search/ActiveFilters";
import CandidateCard from "../../components/search/CandidateCard";
import Pagination from "../../components/search/Pagination";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import SlotPicker from "../../components/interviews/SlotPicker";
import toast from "react-hot-toast";
import { useState } from "react";
import { Github } from "lucide-react";

const s = {
  page: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "1.5rem",
    alignItems: "start",
  },
  main: {},
  toolbar: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
  },
  th: {
    padding: "11px 14px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "13px 14px",
    fontSize: "13px",
    borderBottom: "1px solid #f8f8f8",
    verticalAlign: "middle",
  },
  name: { fontWeight: "500", marginBottom: "2px" },
  email: { fontSize: "11px", color: "#aaa" },
  btnSm: (v) => ({
    padding: "4px 10px",
    borderRadius: "5px",
    fontSize: "11px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    marginRight: "4px",
    background:
      v === "shortlist" ? "#e8f8f0" : v === "reject" ? "#fdf0f0" : "#f0effc",
    color:
      v === "shortlist" ? "#1a7a4a" : v === "reject" ? "#c0392b" : "#5a52c0",
  }),
  empty: {
    padding: "3rem",
    textAlign: "center",
    color: "#aaa",
    fontSize: "14px",
  },
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.25rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
    gap: "1rem",
  },
};

export default function SearchCandidates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { get, set, reset, toObject } = useFilters({
    sortBy: "score",
    sortOrder: "desc",
    view: "list",
  });
  const [scheduling, setScheduling] = useState(null);

  const filters = toObject();

  // Build query params for API
  const queryParams = {
    search: filters.search || undefined,
    minScore: filters.minScore || undefined,
    maxScore: filters.maxScore || undefined,
    skills: filters.skills || undefined,
    status: filters.status || undefined,
    hasGitHub: filters.hasGitHub || undefined,
    sortBy: filters.sortBy || "score",
    sortOrder: filters.sortOrder || "desc",
    page: filters.page || 1,
    limit: 20,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search-candidates", queryParams],
    queryFn: () => searchApplicants(queryParams),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAppStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["search-candidates"]);
      toast.success("Status updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const openChat = async (appId) => {
    try {
      await fetchOrCreateConversation(appId);
      navigate("/recruiter/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot open chat");
    }
  };

  const apps = data?.applications || [];
  const pagination = data?.pagination || {};
  const facets = data?.facets || {};
  const isListView = (filters.view || "list") === "list";

  return (
    <Layout>
      <div style={s.h1}>Search candidates</div>
      <div style={s.sub}>
        Filter, sort and search across all your applicants
      </div>

      <div style={s.page}>
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          facets={facets}
          onChange={set}
          onClear={reset}
        />

        {/* Main content */}
        <div style={s.main}>
          {/* Toolbar */}
          <div style={s.toolbar}>
            <SearchBar
              value={filters.search || ""}
              onChange={(val) => set({ search: val })}
            />
            <SortControls
              total={pagination.total || 0}
              sortBy={filters.sortBy || "score"}
              sortOrder={filters.sortOrder || "desc"}
              view={filters.view || "list"}
              onSort={(val) => set({ sortBy: val })}
              onOrder={(val) => set({ sortOrder: val })}
              onView={(val) => set({ view: val })}
            />
          </div>

          {/* Active filter chips */}
          <ActiveFilters filters={filters} onRemove={set} />

          {/* Results */}
          {isLoading ? (
            <div
              style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}
            >
              Loading...
            </div>
          ) : apps.length === 0 ? (
            <div style={s.empty}>
              No candidates match your filters.
              <button
                onClick={reset}
                style={{
                  display: "block",
                  margin: "10px auto 0",
                  color: "#7F77DD",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : isListView ? (
            // ── List / table view ─────────────────────────────────
            <table style={{ ...s.table, opacity: isFetching ? 0.6 : 1 }}>
              <thead>
                <tr>
                  <th style={s.th}>Candidate</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Score</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>GitHub</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id}>
                    <td style={s.td}>
                      <div style={s.name}>{app.candidate?.name}</div>
                      <div style={s.email}>{app.candidate?.email}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: "13px" }}>{app.job?.title}</div>
                    </td>
                    <td style={s.td}>
                      <ScoreBadge score={app.aiScore} />
                    </td>
                    <td style={s.td}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={s.td}>
                      {app.candidate?.github?.connected ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: "#555",
                          }}
                        >
                          <Github size={12} /> @{app.candidate.github.username}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#ddd" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btnSm("shortlist")}
                        onClick={() =>
                          statusMutation.mutate({
                            id: app._id,
                            status: "shortlisted",
                          })
                        }
                      >
                        Shortlist
                      </button>
                      <button
                        style={s.btnSm("reject")}
                        onClick={() =>
                          statusMutation.mutate({
                            id: app._id,
                            status: "rejected",
                          })
                        }
                      >
                        Reject
                      </button>
                      {app.status === "shortlisted" && (
                        <>
                          <button
                            style={s.btnSm("chat")}
                            onClick={() => openChat(app._id)}
                          >
                            💬
                          </button>
                          <button
                            style={s.btnSm("schedule")}
                            onClick={() => setScheduling(app._id)}
                          >
                            📅
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // ── Grid / card view ──────────────────────────────────
            <div style={{ ...s.grid, opacity: isFetching ? 0.6 : 1 }}>
              {apps.map((app) => (
                <CandidateCard
                  key={app._id}
                  app={app}
                  onShortlist={() =>
                    statusMutation.mutate({
                      id: app._id,
                      status: "shortlisted",
                    })
                  }
                  onReject={() =>
                    statusMutation.mutate({ id: app._id, status: "rejected" })
                  }
                  onOpenChat={() => openChat(app._id)}
                  onSchedule={() => setScheduling(app._id)}
                />
              ))}
            </div>
          )}

          <Pagination
            page={Number(filters.page) || 1}
            totalPages={pagination.totalPages || 1}
            onChange={(p) => set({ page: p })}
          />
        </div>
      </div>

      {/* Schedule modal */}
      {scheduling && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "560px" }}>
            <SlotPicker
              applicationId={scheduling}
              onSuccess={() => {
                setScheduling(null);
                toast.success("Interview invitation sent!");
              }}
              onCancel={() => setScheduling(null)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
