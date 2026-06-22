import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const s = {
  wrap: { position: "relative", flex: 1 },
  input: {
    width: "100%",
    padding: "10px 36px 10px 38px",
    border: "1px solid rgba(11,14,20,0.20)",
    borderRadius: "2px",
    fontSize: "13px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    color: "#0B0E14",
    transition: "border-color 0.15s",
  },
  icon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  clear: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#8A8D98",
    display: "flex",
    alignItems: "center",
    padding: "2px",
  },
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name or email...",
}) {
  const [local, setLocal] = useState(value || "");

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  useEffect(() => {
    if (local === (value || "")) return;
    const t = setTimeout(() => onChange(local), 500);
    return () => clearTimeout(t);
  }, [local]);

  return (
    <div style={s.wrap}>
      <Search size={14} color="#8A8D98" style={s.icon} />
      <input
        style={s.input}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        onFocus={(e) => (e.target.style.borderColor = "#0B0E14")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(11,14,20,0.20)")}
      />
      {local && (
        <button
          style={s.clear}
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4D2E")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8D98")}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}