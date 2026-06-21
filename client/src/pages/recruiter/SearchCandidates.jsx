import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { searchApplicants, updateAppStatus } from "../../api/applications";
import { fetchOrCreateConversation } from "../../api/conversations";
import { useFilters } from "../../hooks/useFilters";
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
import { GitFork as Github } from "lucide-react";
import { color, font } from "../../styles/theme";

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
      <div style={s.eyebrow}>// candidate search</div>
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
            <div style={s.loadingState}>Loading…</div>
          ) : apps.length === 0 ? (
            <div style={s.empty}>
              No candidates match your filters.
              <button style={s.clearBtn} onClick={reset}>
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
                  <tr key={app._id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.name}>{app.candidate?.name}</div>
                      <div style={s.email}>{app.candidate?.email}</div>
                    </td>
                    <td style={s.td}>
                      <span style={s.roleText}>{app.job?.title}</span>
                    </td>
                    <td style={s.td}>
                      <ScoreBadge score={app.aiScore} />
                    </td>
                    <td style={s.td}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={s.td}>
                      {app.candidate?.github?.connected ? (
                        <span style={s.ghCell}>
                          <Github size={12} /> @{app.candidate.github.username}
                        </span>
                      ) : (
                        <span style={s.ghDash}>—</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btnShortlist}
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
                        style={s.btnReject}
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
                            style={s.btnIcon}
                            onClick={() => openChat(app._id)}
                          >
                            💬
                          </button>
                          <button
                            style={s.btnIcon}
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
        <div style={s.modalOverlay}>
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

const s = {
  eyebrow: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: color.signal,
    marginBottom: "6px",
  },
  h1: {
    fontFamily: font.display,
    fontSize: "23px",
    fontWeight: 700,
    marginBottom: "4px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontFamily: font.mono,
    fontSize: "12px",
    color: color.graphiteDim,
    marginBottom: "1.5rem",
  },
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
    border: `1px solid ${color.lineLight}`,
  },
  th: {
    padding: "11px 14px",
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    color: color.graphite,
    textAlign: "left",
    borderBottom: `1px solid ${color.lineLight}`,
    background: color.paper2,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: {},
  td: {
    padding: "13px 14px",
    fontSize: "13px",
    borderBottom: `1px solid ${color.lineLight}`,
    verticalAlign: "middle",
  },
  name: { fontWeight: "600", marginBottom: "2px" },
  email: { fontSize: "11px", color: color.graphiteDim },
  roleText: { fontSize: "13px" },
  ghCell: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: color.ink,
  },
  ghDash: { fontSize: "12px", color: color.paper3 },

  btnShortlist: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "5px 10px",
    border: "none",
    cursor: "pointer",
    marginRight: "4px",
    background: "rgba(29,138,78,0.10)",
    color: "#1D8A4E",
  },
  btnReject: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "5px 10px",
    border: "none",
    cursor: "pointer",
    marginRight: "4px",
    background: "rgba(255,77,46,0.08)",
    color: color.signal,
  },
  btnIcon: {
    padding: "5px 8px",
    borderRadius: "0",
    fontSize: "12px",
    fontWeight: "500",
    border: `1px solid ${color.lineLightStrong}`,
    cursor: "pointer",
    marginRight: "4px",
    background: "#fff",
  },

  empty: {
    padding: "3rem",
    textAlign: "center",
    color: color.graphiteDim,
    fontSize: "14px",
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
  },
  clearBtn: {
    display: "block",
    margin: "10px auto 0",
    color: color.signal,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  loadingState: {
    padding: "3rem",
    textAlign: "center",
    color: color.graphiteDim,
    fontFamily: font.mono,
    fontSize: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
    gap: "1rem",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(11,14,20,0.6)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
};
