import { useState } from "react";
import { format, isPast } from "date-fns";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";

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
  slotBtn: (sel) => ({
    width: "100%",
    padding: "14px 16px",
    border: `1px solid ${sel ? "#0B0E14" : "rgba(11,14,20,0.12)"}`,
    borderRadius: "2px",
    background: sel ? "#0B0E14" : "#fff",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  }),
  slotDate: (sel) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    fontSize: "12px",
    letterSpacing: "0.04em",
    color: sel ? "#fff" : "#0B0E14",
  }),
  slotTime: (sel) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: sel ? "rgba(200,255,77,0.85)" : "#5C5F6B",
    marginTop: "3px",
  }),
  radio: (sel) => ({
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: `1.5px solid ${sel ? "#C8FF4D" : "rgba(11,14,20,0.25)"}`,
    background: sel ? "#C8FF4D" : "transparent",
    flexShrink: 0,
  }),
  notes: {
    background: "rgba(11,14,20,0.03)",
    borderLeft: "3px solid #0B0E14",
    padding: "10px 14px",
    borderRadius: "0 2px 2px 0",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    color: "#5C5F6B",
    marginBottom: "16px",
  },
  meet: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#4D7CFF",
    marginBottom: "16px",
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
  confirmed: {
    background: "#0B0E14",
    border: "1px solid rgba(11,14,20,0.10)",
    borderRadius: "4px",
    padding: "28px 22px",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
  },
  divider: {
    borderTop: "1px solid rgba(11,14,20,0.08)",
    margin: "16px 0",
  },
};

export default function SlotSelector({ interview, onConfirmed }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableSlots = interview.slots.filter(
    (s) => s.available && !isPast(new Date(s.dateTime)),
  );

  if (interview.status === "scheduled") {
    return (
      <div style={s.confirmed}>
        <CheckCircle
          size={28}
          color="#C8FF4D"
          style={{ marginBottom: "10px" }}
        />
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "700",
            fontSize: "16px",
            letterSpacing: "-0.02em",
            color: "#fff",
            marginBottom: "6px",
          }}
        >
          Interview confirmed
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.04em",
          }}
        >
          {format(new Date(interview.confirmedSlot), "EEE, MMM d yyyy")} ·{" "}
          {format(new Date(interview.confirmedSlot), "h:mm a")}
        </div>
        {interview.meetLink && (
          <a
            href={interview.meetLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#4D7CFF",
              textDecoration: "none",
            }}
          >
            <Video size={12} /> Join meeting →
          </a>
        )}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "rgba(255,255,255,0.25)",
            marginTop: "10px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Calendar invite sent to your email
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!selected) return setError("Please select a time slot");
    setError("");
    setLoading(true);
    try {
      const { confirmInterviewSlot } = await import("../../api/interviews");
      await confirmInterviewSlot(interview._id, selected);
      onConfirmed?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.title}>Choose your interview time</div>
      <div style={s.sub}>
        {interview.recruiter?.name} · pick the slot that works
      </div>

      {error && <div style={s.err}>{error}</div>}

      {interview.notes && (
        <div style={s.notes}>
          <strong style={{ color: "#0B0E14" }}>
            From {interview.recruiter?.name}:
          </strong>{" "}
          {interview.notes}
        </div>
      )}

      {interview.meetLink && (
        <div style={s.meet}>
          <Video size={12} />
          <span>Meeting link provided on confirmation</span>
        </div>
      )}

      {availableSlots.length === 0 ? (
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#8A8D98",
            letterSpacing: "0.04em",
          }}
        >
          All slots have passed — ask the recruiter to propose new times.
        </p>
      ) : (
        availableSlots.map((slot) => {
          const sel = selected === slot._id;
          return (
            <button
              key={slot._id}
              style={s.slotBtn(sel)}
              onClick={() => setSelected(slot._id)}
            >
              <div style={s.radio(sel)} />
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Calendar size={12} color={sel ? "#C8FF4D" : "#8A8D98"} />
                  <span style={s.slotDate(sel)}>
                    {format(new Date(slot.dateTime), "EEE, MMM d yyyy")}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "3px",
                  }}
                >
                  <Clock
                    size={12}
                    color={sel ? "rgba(200,255,77,0.6)" : "#8A8D98"}
                  />
                  <span style={s.slotTime(sel)}>
                    {format(new Date(slot.dateTime), "h:mm a")}
                  </span>
                </div>
              </div>
            </button>
          );
        })
      )}

      {availableSlots.length > 0 && (
        <>
          <div style={s.divider} />
          <button
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "2px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: selected ? "pointer" : "default",
              border: "none",
              background: selected ? "#FF4D2E" : "rgba(11,14,20,0.08)",
              color: selected ? "#fff" : "#8A8D98",
            }}
            onClick={handleConfirm}
            disabled={loading || !selected}
          >
            {loading ? "Confirming..." : "Confirm this time →"}
          </button>
        </>
      )}
    </div>
  );
}
