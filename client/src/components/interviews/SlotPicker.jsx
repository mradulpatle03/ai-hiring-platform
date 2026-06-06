import { useState } from "react";
import {
  format,
  addDays,
  setHours,
  setMinutes,
  isBefore,
  startOfToday,
} from "date-fns";
import { Plus, Trash2, Calendar } from "lucide-react";

const s = {
  wrap: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  title: { fontSize: "15px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.25rem" },
  slotRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
  },
  del: {
    padding: "8px",
    border: "1px solid #fde0e0",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    color: "#e74c3c",
    display: "flex",
    alignItems: "center",
  },
  add: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    border: "1px dashed #ccc",
    borderRadius: "8px",
    background: "none",
    cursor: "pointer",
    fontSize: "13px",
    color: "#888",
    marginBottom: "1.25rem",
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "5px",
    display: "block",
  },
  group: { marginBottom: "1rem" },
  field: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  submit: {
    width: "100%",
    padding: "11px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "4px",
  },
  err: {
    background: "#fff0f0",
    color: "#c0392b",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
  },
};

// Generate quick slot options for today + next 7 days
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
  const updateSlot = (i, val) =>
    setSlots((p) => p.map((s, j) => (j === i ? val : s)));

  const addQuickSlot = (date) => {
    const iso = format(date, "yyyy-MM-dd'T'HH:mm");
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
      await proposeInterviewSlots({
        applicationId,
        slots: filled,
        meetLink,
        notes,
      });
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
      <div style={s.sub}>
        Propose up to 5 time slots — the candidate will pick one.
      </div>

      {error && <div style={s.err}>{error}</div>}

      {/* Manual slot inputs */}
      {slots.map((slot, i) => (
        <div key={i} style={s.slotRow}>
          <input
            style={s.input}
            type="datetime-local"
            value={slot}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => updateSlot(i, e.target.value)}
          />
          {slots.length > 1 && (
            <button style={s.del} onClick={() => removeSlot(i)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      {slots.length < 5 && (
        <button style={s.add} onClick={addSlot}>
          <Plus size={14} /> Add another slot
        </button>
      )}

      {/* Quick slot suggestions */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          style={{
            ...s.add,
            borderStyle: "solid",
            color: "#7F77DD",
            borderColor: "#c8c5f5",
          }}
          onClick={() => setShowQuick((p) => !p)}
        >
          <Calendar size={14} /> {showQuick ? "Hide" : "Show"} quick slots
        </button>
        {showQuick && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {quickSlots.slice(0, 16).map((d, i) => {
              const iso = format(d, "yyyy-MM-dd'T'HH:mm");
              const selected = slots.includes(iso);
              return (
                <button
                  key={i}
                  onClick={() => addQuickSlot(d)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    border: "1px solid",
                    cursor: "pointer",
                    background: selected ? "#7F77DD" : "#fff",
                    color: selected ? "#fff" : "#555",
                    borderColor: selected ? "#7F77DD" : "#ddd",
                  }}
                >
                  {format(d, "EEE MMM d, h:mm a")}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
          placeholder="e.g. This will be a 1-hour technical interview with 2 engineers..."
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{ ...s.submit, background: "#f5f5f5", color: "#555" }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button style={s.submit} onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending..." : "Send invitation →"}
        </button>
      </div>
    </div>
  );
}
