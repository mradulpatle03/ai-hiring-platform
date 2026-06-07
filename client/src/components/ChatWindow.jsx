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
        borderRadius: "50%",
        background: "#f0effc",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 600,
        color: "#7F77DD",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 3,
        alignItems: "center",
        padding: "2px 0",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#bbb",
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
      {/* Avatar spacer for alignment */}
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
          gap: 2,
          maxWidth: "70%",
        }}
      >
        <div
          style={{
            padding: "9px 13px",
            borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: mine ? "#7F77DD" : "#f4f4f5",
            color: mine ? "#fff" : "#1a1a1a",
            fontSize: 13,
            lineHeight: 1.55,
            wordBreak: "break-word",
            transition: "background 0.15s",
          }}
        >
          {msg.text}
        </div>
        <span style={{ fontSize: 10, color: "#c0c0c0", padding: "0 2px" }}>
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "6px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
      <span
        style={{
          fontSize: 10,
          color: "#ccc",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
    </div>
  );
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== lastDate) {
      groups.push({
        type: "divider",
        date: msg.createdAt,
        id: `div-${msg.createdAt}`,
      });
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

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, typingUser]);
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingUser]);

  // Auto-resize textarea
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

  // For showing avatars only on last message in a run
  const getShowAvatar = (idx) => {
    const item = grouped[idx];
    if (item.type !== "message") return false;
    const next = grouped[idx + 1];
    if (!next || next.type === "divider") return true;
    const mine =
      String(item.msg.sender?._id || item.msg.sender) === String(user._id);
    const nextMine =
      String(next.msg.sender?._id || next.msg.sender) === String(user._id);
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
        border: "1px solid #e8e8e8",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          background: "#fafafa",
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar name={other?.name} size={36} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#27ae60",
              border: "2px solid #fafafa",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            {other?.name}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
            {conversation.job?.title}
            {conversation.job?.company && (
              <>
                {" "}
                ·{" "}
                <span style={{ color: "#bbb" }}>
                  {conversation.job.company}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          scrollbarWidth: "thin",
          scrollbarColor: "#eee transparent",
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
              color: "#ccc",
            }}
          >
            <Loader
              size={18}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: 12 }}>Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Avatar name={other?.name} size={48} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#888" }}>
                Start a conversation with {other?.name?.split(" ")[0]}
              </div>
              <div style={{ fontSize: 12, color: "#ccc", marginTop: 3 }}>
                Messages are end-to-end private
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

        {/* Typing indicator */}
        {typingUser && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
            <div style={{ width: 28, flexShrink: 0 }}>
              <Avatar name={other?.name} size={28} />
            </div>
            <div
              style={{
                padding: "9px 14px",
                background: "#f4f4f5",
                borderRadius: "16px 16px 16px 4px",
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
          padding: "10px 14px 30px",
          borderTop: "1px solid #f0f0f0",
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
            border: `1.5px solid ${inputFocused ? "#7F77DD" : "#928989"}`,
            borderRadius: 12,
            display: "flex",
            alignItems: "flex-end",
            transition: "border-color 0.2s",
            background: "#fafafa",
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
              fontFamily: "inherit",
              color: "#1a1a1a",
              maxHeight: 100,
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: text.trim() ? "#7F77DD" : "#f0f0f0",
            color: text.trim() ? "#fff" : "#ccc",
            cursor: text.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s, color 0.2s, transform 0.1s",
            alignSelf: "flex-end",
            marginBottom: 0,
          }}
          onMouseDown={(e) => {
            if (text.trim()) e.currentTarget.style.transform = "scale(0.92)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {sending ? (
            <Loader
              size={15}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>
    </div>
  );
}
