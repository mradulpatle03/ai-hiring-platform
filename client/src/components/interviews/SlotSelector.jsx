import { useState } from "react";
import { format, isPast } from "date-fns";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";

const s = {
  wrap: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  title: { fontSize: "15px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.25rem" },
  slotBtn: (sel) => ({
    width: "100%",
    padding: "14px 16px",
    border: `2px solid ${sel ? "#7F77DD" : "#eee"}`,
    borderRadius: "10px",
    background: sel ? "#f7f6ff" : "#fff",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.15s",
  }),
  slotDate: { fontWeight: "600", fontSize: "14px", color: "#1a1a1a" },
  slotTime: { fontSize: "13px", color: "#888", marginTop: "2px" },
  radio: (sel) => ({
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: `2px solid ${sel ? "#7F77DD" : "#ddd"}`,
    background: sel ? "#7F77DD" : "#fff",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: "#fff" },
  notes: {
    background: "#f9f8ff",
    borderLeft: "3px solid #7F77DD",
    padding: "10px 14px",
    borderRadius: "0 8px 8px 0",
    fontSize: "13px",
    color: "#555",
    marginBottom: "1.25rem",
  },
  meet: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#7F77DD",
    marginBottom: "1.25rem",
  },
  confirm: {
    width: "100%",
    padding: "11px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  err: {
    background: "#fff0f0",
    color: "#c0392b",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
  },
  confirmed: {
    background: "#e8f8f0",
    border: "1px solid #a8dfc0",
    borderRadius: "12px",
    padding: "1.25rem",
    textAlign: "center",
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
          size={32}
          color="#1D9E75"
          style={{ marginBottom: "8px" }}
        />
        <div
          style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}
        >
          Interview confirmed!
        </div>
        <div style={{ fontSize: "14px", color: "#555" }}>
          {format(new Date(interview.confirmedSlot), "EEEE, MMMM d yyyy")} at{" "}
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
              marginTop: "12px",
              color: "#7F77DD",
              fontSize: "13px",
            }}
          >
            <Video size={14} /> Join meeting
          </a>
        )}
        <div style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>
          A calendar invite was sent to your email.
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
        {interview.recruiter?.name} has proposed the following slots. Pick the
        one that works best for you.
      </div>

      {error && <div style={s.err}>{error}</div>}

      {interview.notes && (
        <div style={s.notes}>
          <strong>From {interview.recruiter?.name}:</strong> {interview.notes}
        </div>
      )}

      {interview.meetLink && (
        <div style={s.meet}>
          <Video size={14} />
          <span>Meeting link will be provided upon confirmation</span>
        </div>
      )}

      {availableSlots.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "13px" }}>
          All slots have passed. Ask the recruiter to propose new times.
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
              <div style={s.radio(sel)}>{sel && <div style={s.dot} />}</div>
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Calendar size={13} color="#7F77DD" />
                  <span style={s.slotDate}>
                    {format(new Date(slot.dateTime), "EEEE, MMMM d yyyy")}
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
                  <Clock size={13} color="#aaa" />
                  <span style={s.slotTime}>
                    {format(new Date(slot.dateTime), "h:mm a")}
                  </span>
                </div>
              </div>
            </button>
          );
        })
      )}

      {availableSlots.length > 0 && (
        <button
          style={{
            ...s.confirm,
            marginTop: "8px",
            opacity: selected ? 1 : 0.6,
          }}
          onClick={handleConfirm}
          disabled={loading || !selected}
        >
          {loading ? "Confirming..." : "Confirm this time →"}
        </button>
      )}
    </div>
  );
}
