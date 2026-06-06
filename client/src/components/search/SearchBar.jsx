import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const s = {
  wrap: { position: "relative", flex: 1 },
  input: {
    width: "100%",
    padding: "10px 36px 10px 38px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
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
    color: "#aaa",
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

  useEffect(() => setLocal(value || ""), [value]);

  // Debounce — wait 400ms after typing before firing onChange
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 400);
    return () => clearTimeout(t);
  }, [local]);

  return (
    <div style={s.wrap}>
      <Search size={15} color="#aaa" style={s.icon} />
      <input
        style={s.input}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
      />
      {local && (
        <button
          style={s.clear}
          onClick={() => {
            setLocal("");
            onChange("");
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
