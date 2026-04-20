import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyConversations } from "../api/conversations";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const s = {
  wrap: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #eee",
    fontWeight: "600",
    fontSize: "14px",
  },
  list: { maxHeight: "520px", overflowY: "auto" },
  item: (active) => ({
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f5",
    background: active ? "#f7f6ff" : "transparent",
    transition: "background 0.1s",
  }),
  name: { fontWeight: "500", fontSize: "13px", marginBottom: "2px" },
  last: {
    fontSize: "12px",
    color: "#888",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    background: "#7F77DD",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "600",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  empty: {
    padding: "2rem 1rem",
    textAlign: "center",
    fontSize: "13px",
    color: "#bbb",
  },
  jobTag: { fontSize: "11px", color: "#aaa", marginTop: "2px" },
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

  // Real-time: update list when a new message arrives
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
      <div style={s.header}>Messages</div>
      <div style={s.list}>
        {isLoading ? (
          <div style={s.empty}>Loading...</div>
        ) : convs.length === 0 ? (
          <div style={s.empty}>No conversations yet</div>
        ) : (
          convs.map((c) => (
            <div
              key={c._id}
              style={s.item(c._id === selectedId)}
              onClick={() => onSelect(c)}
            >
              <div style={s.row}>
                <div style={s.name}>{other(c)?.name}</div>
                {c[unreadField] > 0 && (
                  <span style={s.badge}>{c[unreadField]}</span>
                )}
              </div>
              <div style={s.jobTag}>{c.job?.title}</div>
              {c.lastMessage && <div style={s.last}>{c.lastMessage}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}