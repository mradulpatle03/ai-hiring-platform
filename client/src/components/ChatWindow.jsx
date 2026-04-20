import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMessages } from "../api/conversations";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";

const s = {
  shell: {
    display: "flex",
    flexDirection: "column",
    height: "520px",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#f0effc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    color: "#7F77DD",
    flexShrink: 0,
  },
  hInfo: { flex: 1 },
  hName: { fontWeight: "600", fontSize: "14px" },
  hSub: { fontSize: "12px", color: "#888" },
  online: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#27ae60",
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  typing: {
    padding: "0 16px 8px",
    fontSize: "12px",
    color: "#aaa",
    fontStyle: "italic",
    flexShrink: 0,
    minHeight: "20px",
  },
  inputRow: {
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "10px",
    flexShrink: 0,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    lineHeight: 1.5,
    maxHeight: "100px",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "10px 18px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    flexShrink: 0,
    alignSelf: "flex-end",
  },
  bubble: (mine) => ({
    maxWidth: "72%",
    padding: "9px 13px",
    borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: mine ? "#7F77DD" : "#f4f4f5",
    color: mine ? "#fff" : "#1a1a1a",
    fontSize: "13px",
    lineHeight: 1.5,
    alignSelf: mine ? "flex-end" : "flex-start",
    wordBreak: "break-word",
  }),
  msgWrap: (mine) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: mine ? "flex-end" : "flex-start",
    gap: "2px",
  }),
  time: { fontSize: "10px", color: "#bbb", marginTop: "1px" },
  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bbb",
    fontSize: "13px",
  },
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [sending, setSending] = useState(false);

  const convId = conversation._id;
  const other =
    user.role === "recruiter" ? conversation.candidate : conversation.recruiter;

  // Load message history
  const { data, isLoading } = useQuery({
    queryKey: ["messages", convId],
    queryFn: () => fetchMessages(convId),
    onSuccess: (d) => setMessages(d.messages || []),
  });

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  // Join/leave socket room
  useEffect(() => {
    emit("join_conversation", convId);
    return () => emit("leave_conversation", convId);
  }, [convId, emit]);

  // Listen for new messages
  useEffect(() => {
    const handleNew = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      queryClient.invalidateQueries(["conversations"]);
    };
    on("new_message", handleNew);
    return () => off("new_message", handleNew);
  }, [on, off, queryClient]);

  // Typing indicator listeners
  useEffect(() => {
    const handleTyping = ({ name }) => setTypingUser(name);
    const handleStopTyping = () => setTypingUser(null);
    on("typing", handleTyping);
    on("stopped_typing", handleStopTyping);
    return () => {
      off("typing", handleTyping);
      off("stopped_typing", handleStopTyping);
    };
  }, [on, off]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emit("typing_start", { conversationId: convId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emit("typing_stop", { conversationId: convId });
    }, 1500);
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || sending) return;
    setSending(true);
    emit("send_message", { conversationId: convId, text: text.trim() });
    setText("");
    emit("typing_stop", { conversationId: convId });
    setTimeout(() => setSending(false), 300);
  }, [text, sending, emit, convId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={s.shell}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.avatar}>{getInitials(other?.name)}</div>
        <div style={s.hInfo}>
          <div style={s.hName}>{other?.name}</div>
          <div style={s.hSub}>
            {conversation.job?.title} · {conversation.job?.company}
          </div>
        </div>
        <div style={s.online} title="Online" />
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {isLoading ? (
          <div style={s.empty}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={s.empty}>No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => {
            const mine =
              String(msg.sender?._id || msg.sender) === String(user._id);
            return (
              <div key={msg._id} style={s.msgWrap(mine)}>
                <div style={s.bubble(mine)}>{msg.text}</div>
                <span style={s.time}>{formatTime(msg.createdAt)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div style={s.typing}>{typingUser && `${typingUser} is typing...`}</div>

      {/* Input */}
      <div style={s.inputRow}>
        <textarea
          style={s.textarea}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          rows={1}
        />
        <button
          style={s.sendBtn}
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          Send
        </button>
      </div>
    </div>
  );
}