import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMessages } from "../api/conversations";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { Send, Loader } from "lucide-react";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Avatar({ name, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0B0E14",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.33,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "-0.01em",
        color: "#C8FF4D",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#8A8D98",
            animation: "bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ msg, mine, showAvatar, otherName }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: mine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 7,
      }}
    >
      {!mine && (
        <div style={{ width: 28, flexShrink: 0 }}>
          {showAvatar && <Avatar name={otherName} size={28} />}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mine ? "flex-end" : "flex-start",
          gap: 3,
          maxWidth: "70%",
        }}
      >
        <div
          style={{
            padding: "9px 13px",
            borderRadius: mine ? "4px 4px 2px 4px" : "4px 4px 4px 2px",
            background: mine ? "#0B0E14" : "#F7F5EF",
            color: mine ? "#fff" : "#0B0E14",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.55,
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#8A8D98",
            padding: "0 2px",
          }}
        >
          {formatTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

function DateDivider({ date }) {
  const label = (() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  })();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(11,14,20,0.08)" }} />
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A8D98",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(11,14,20,0.08)" }} />
    </div>
  );
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== lastDate) {
      groups.push({ type: "divider", date: msg.createdAt, id: `div-${msg.createdAt}` });
      lastDate = d;
    }
    groups.push({ type: "message", msg });
  });
  return groups;
}

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);
  const typingTimer = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesContainerRef = useRef(null);

  const convId = conversation._id;
  const other =
    user.role === "recruiter" ? conversation.candidate : conversation.recruiter;

  const { data, isLoading } = useQuery({
    queryKey: ["messages", convId],
    queryFn: () => fetchMessages(convId),
    onSuccess: (d) => setMessages(d.messages || []),
  });

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    emit("join_conversation", convId);
    return () => emit("leave_conversation", convId);
  }, [convId, emit]);

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

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingUser]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [text]);

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

  const grouped = groupByDate(messages);

  const getShowAvatar = (idx) => {
    const item = grouped[idx];
    if (item.type !== "message") return false;
    const next = grouped[idx + 1];
    if (!next || next.type === "divider") return true;
    const mine = String(item.msg.sender?._id || item.msg.sender) === String(user._id);
    const nextMine = String(next.msg.sender?._id || next.msg.sender) === String(user._id);
    return !mine && mine !== nextMine;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(11,14,20,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          background: "#fff",
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar name={other?.name} size={34} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#1D8A4E",
              border: "2px solid #fff",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "-0.01em",
              color: "#0B0E14",
            }}
          >
            {other?.name}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#8A8D98",
              marginTop: 2,
            }}
          >
            {conversation.job?.title}
            {conversation.job?.company && (
              <> · {conversation.job.company}</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          background: "#FAFAF8",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(11,14,20,0.10) transparent",
        }}
      >
        {isLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#8A8D98",
            }}
          >
            <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Loading…
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Avatar name={other?.name} size={44} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                  color: "#0B0E14",
                  marginBottom: 4,
                }}
              >
                Start a conversation with {other?.name?.split(" ")[0]}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#8A8D98",
                }}
              >
                Messages are private
              </div>
            </div>
          </div>
        ) : (
          grouped.map((item, idx) =>
            item.type === "divider" ? (
              <DateDivider key={item.id} date={item.date} />
            ) : (
              <MessageBubble
                key={item.msg._id}
                msg={item.msg}
                mine={
                  String(item.msg.sender?._id || item.msg.sender) ===
                  String(user._id)
                }
                showAvatar={getShowAvatar(idx)}
                otherName={other?.name}
              />
            ),
          )
        )}

        {typingUser && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
            <div style={{ width: 28, flexShrink: 0 }}>
              <Avatar name={other?.name} size={28} />
            </div>
            <div
              style={{
                padding: "9px 14px",
                background: "#F7F5EF",
                borderRadius: "4px 4px 4px 2px",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(11,14,20,0.08)",
          display: "flex",
          gap: 8,
          flexShrink: 0,
          alignItems: "flex-end",
          background: "#fff",
        }}
      >
        <div
          style={{
            flex: 1,
            border: `1px solid ${inputFocused ? "#0B0E14" : "rgba(11,14,20,0.18)"}`,
            borderRadius: 2,
            display: "flex",
            alignItems: "flex-end",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Message…"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "9px 12px",
              fontSize: 13,
              lineHeight: 1.55,
              fontFamily: "'Inter', sans-serif",
              color: "#0B0E14",
              maxHeight: 100,
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 36,
            height: 36,
            borderRadius: 2,
            border: "none",
            background: text.trim() ? "#FF4D2E" : "rgba(11,14,20,0.06)",
            color: text.trim() ? "#fff" : "#8A8D98",
            cursor: text.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: "flex-end",
          }}
          onMouseDown={(e) => {
            if (text.trim()) e.currentTarget.style.background = "#E0431F";
          }}
          onMouseUp={(e) => {
            if (text.trim()) e.currentTarget.style.background = "#FF4D2E";
          }}
        >
          {sending ? (
            <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}