import { useState } from "react";
import {
  format,
  addDays,
  setHours,
  setMinutes,
  isBefore,
} from "date-fns";
import { Plus, Trash2, Calendar } from "lucide-react";

const s = {
  wrap: {
    background: "#fff",
    border: "1px solid rgba(11,14,20,0.10)",
    borderRadius: "4px",
    padding: "22px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    fontSize: "18px",
    letterSpacing: "-0.02em",
    color: "#0B0E14",
    marginBottom: "4px",
  },
  sub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5C5F6B",
    marginBottom: "20px",
  },
  slotRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    border: "1px solid rgba(11,14,20,0.15)",
    borderRadius: "2px",
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    color: "#0B0E14",
    background: "#fff",
  },
  del: {
    padding: "8px 10px",
    border: "1px solid rgba(255,77,46,0.20)",
    borderRadius: "2px",
    background: "#fff",
    cursor: "pointer",
    color: "#FF4D2E",
    display: "flex",
    alignItems: "center",
  },
  add: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    border: "1px dashed rgba(11,14,20,0.20)",
    borderRadius: "2px",
    background: "none",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#5C5F6B",
    marginBottom: "14px",
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5C5F6B",
    marginBottom: "6px",
    display: "block",
  },
  group: { marginBottom: "14px" },
  field: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid rgba(11,14,20,0.15)",
    borderRadius: "2px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    color: "#0B0E14",
    background: "#fff",
  },
  err: {
    background: "rgba(255,77,46,0.08)",
    color: "#FF4D2E",
    border: "1px solid rgba(255,77,46,0.20)",
    borderRadius: "2px",
    padding: "10px 13px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    marginBottom: "14px",
  },
  divider: {
    borderTop: "1px solid rgba(11,14,20,0.08)",
    margin: "16px 0",
  },
};

const generateQuickSlots = () => {
  const slots = [];
  for (let d = 1; d <= 7; d++) {
    const day = addDays(new Date(), d);
    [9, 11, 14, 16].forEach((h) => {
      slots.push(setMinutes(setHours(day, h), 0));
    });
  }
  return slots;
};

export default function SlotPicker({ applicationId, onSuccess, onCancel }) {
  const [slots, setSlots] = useState([""]);
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);

  const quickSlots = generateQuickSlots();

  const addSlot = () => slots.length < 5 && setSlots((p) => [...p, ""]);
  const removeSlot = (i) => setSlots((p) => p.filter((_, j) => j !== i));
  const updateSlot = (i, val) => {
    const iso = val ? new Date(val).toISOString() : "";
    setSlots((p) => p.map((s, j) => (j === i ? iso : s)));
  };

  const addQuickSlot = (date) => {
    const iso = date.toISOString();
    if (slots.includes(iso)) return;
    if (slots.length >= 5) return;
    const empty = slots.findIndex((s) => !s);
    if (empty >= 0) updateSlot(empty, iso);
    else setSlots((p) => [...p, iso]);
  };

  const handleSubmit = async () => {
    setError("");
    const filled = slots.filter(Boolean);
    if (filled.length === 0) return setError("Add at least one time slot");

    const now = new Date();
    for (const s of filled) {
      if (isBefore(new Date(s), now))
        return setError("All slots must be in the future");
    }

    setLoading(true);
    try {
      const { proposeInterviewSlots } = await import("../../api/interviews");
      await proposeInterviewSlots({ applicationId, slots: filled, meetLink, notes });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to propose slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.title}>Schedule an interview</div>
      <div style={s.sub}>Propose up to 5 slots — candidate picks one</div>

      {error && <div style={s.err}>{error}</div>}

      {/* Manual slot inputs */}
      {slots.map((slot, i) => (
        <div key={i} style={s.slotRow}>
          <input
            style={s.input}
            type="datetime-local"
            value={slot ? format(new Date(slot), "yyyy-MM-dd'T'HH:mm") : ""}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => updateSlot(i, e.target.value)}
          />
          {slots.length > 1 && (
            <button style={s.del} onClick={() => removeSlot(i)}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}

      {slots.length < 5 && (
        <button style={s.add} onClick={addSlot}>
          <Plus size={12} /> Add slot
        </button>
      )}

      <div style={s.divider} />

      {/* Quick slot suggestions */}
      <div style={{ marginBottom: "16px" }}>
        <button
          style={{
            ...s.add,
            marginBottom: "0",
            borderStyle: "solid",
            color: "#4D7CFF",
            borderColor: "rgba(77,124,255,0.30)",
          }}
          onClick={() => setShowQuick((p) => !p)}
        >
          <Calendar size={12} /> {showQuick ? "Hide" : "Show"} quick slots
        </button>

        {showQuick && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              marginTop: "10px",
            }}
          >
            {quickSlots.slice(0, 16).map((d, i) => {
              const iso = d.toISOString();
              const selected = slots.includes(iso);
              return (
                <button
                  key={i}
                  onClick={() => addQuickSlot(d)}
                  style={{
                    padding: "5px 10px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    fontWeight: "600",
                    letterSpacing: "0.04em",
                    borderRadius: "2px",
                    border: "1px solid",
                    cursor: "pointer",
                    background: selected ? "#0B0E14" : "#fff",
                    color: selected ? "#C8FF4D" : "#5C5F6B",
                    borderColor: selected ? "#0B0E14" : "rgba(11,14,20,0.15)",
                  }}
                >
                  {format(d, "EEE MMM d, h:mm a")}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={s.divider} />

      <div style={s.group}>
        <label style={s.label}>Meeting link (optional)</label>
        <input
          style={s.field}
          value={meetLink}
          onChange={(e) => setMeetLink(e.target.value)}
          placeholder="https://meet.google.com/... or Zoom link"
        />
      </div>

      <div style={s.group}>
        <label style={s.label}>Notes to candidate (optional)</label>
        <textarea
          style={{ ...s.field, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. 1-hour technical round with 2 engineers..."
        />
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "2px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            border: "1px solid rgba(11,14,20,0.15)",
            background: "#fff",
            color: "#5C5F6B",
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          style={{
            flex: 2,
            padding: "10px",
            borderRadius: "2px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            border: "none",
            background: loading ? "#8A8D98" : "#0B0E14",
            color: "#fff",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send invitation →"}
        </button>
      </div>
    </div>
  );
}