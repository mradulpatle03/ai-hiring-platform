import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyConversations } from "../api/conversations";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const s = {
  wrap: {
    background: "#fff",
    borderRight: "1px solid rgba(11,14,20,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(11,14,20,0.08)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5C5F6B",
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(11,14,20,0.08) transparent",
  },
  item: (active) => ({
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(11,14,20,0.06)",
    background: active ? "#0B0E14" : "transparent",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  }),
  avatar: (active) => ({
    width: 32,
    height: 32,
    background: active ? "#1B202C" : "#F7F5EF",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    color: active ? "#C8FF4D" : "#5C5F6B",
  }),
  content: { flex: 1, minWidth: 0 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  },
  name: (active) => ({
    fontFamily: "'Inter', sans-serif",
    fontWeight: "600",
    fontSize: "13px",
    color: active ? "#fff" : "#0B0E14",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  badge: {
    background: "#FF4D2E",
    color: "#fff",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9px",
    fontWeight: "700",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "0 3px",
  },
  jobTag: (active) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    color: active ? "rgba(200,255,77,0.6)" : "#8A8D98",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
  }),
  last: (active) => ({
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: active ? "rgba(255,255,255,0.50)" : "#8A8D98",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px",
  }),
  empty: {
    padding: "2rem 1rem",
    textAlign: "center",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8A8D98",
  },
};

export default function ConversationList({ selectedId, onSelect }) {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchMyConversations,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handler = () => queryClient.invalidateQueries(["conversations"]);
    on("conversation_updated", handler);
    return () => off("conversation_updated", handler);
  }, [on, off, queryClient]);

  const convs = data?.conversations || [];
  const unreadField =
    user.role === "recruiter" ? "unreadRecruiter" : "unreadCandidate";
  const other = (c) => (user.role === "recruiter" ? c.candidate : c.recruiter);

  return (
    <div style={s.wrap}>
      <div style={s.header}>Conversations</div>
      <div style={s.list}>
        {isLoading ? (
          <div style={s.empty}>Loading…</div>
        ) : convs.length === 0 ? (
          <div style={s.empty}>No conversations yet</div>
        ) : (
          convs.map((c) => {
            const active = c._id === selectedId;
            const person = other(c);
            return (
              <div
                key={c._id}
                style={s.item(active)}
                onClick={() => onSelect(c)}
              >
                <div style={s.avatar(active)}>
                  {getInitials(person?.name)}
                </div>
                <div style={s.content}>
                  <div style={s.row}>
                    <div style={s.name(active)}>{person?.name}</div>
                    {c[unreadField] > 0 && (
                      <span style={s.badge}>{c[unreadField]}</span>
                    )}
                  </div>
                  <div style={s.jobTag(active)}>{c.job?.title}</div>
                  {c.lastMessage && (
                    <div style={s.last(active)}>{c.lastMessage}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}