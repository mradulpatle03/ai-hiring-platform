import nodemailer from "nodemailer";
import ical from "ical-generator";
import { format } from "date-fns";

// Transporter
// For dev: uses Ethereal (fake SMTP, see emails at ethereal.email)
// For prod: swap with SendGrid / Gmail / SES creds from .env
// ─── Transporter ─────────────────────────────────────────────────────
let cachedTransporter = null;
let fromAddress = "noreply@hireai.com";

const createTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.NODE_ENV === "production") {
    fromAddress = process.env.SMTP_USER;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev — auto-create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    fromAddress = testAccount.user; // use actual Ethereal address as sender
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Ethereal test account:", testAccount.user);
  }

  return cachedTransporter;
};

// Generate .ics calendar attachment
const generateICS = ({
  title,
  description,
  startTime,
  endTime,
  organizer,
  attendees,
  meetLink,
}) => {
  const cal = ical({ name: "HireAI Interview" });

  cal.createEvent({
    start: startTime,
    end: endTime,
    summary: title,
    description: `${description}${meetLink ? `\n\nMeeting link: ${meetLink}` : ""}`,
    organizer: { name: organizer.name, email: organizer.email },
    attendees: attendees.map((a) => ({ name: a.name, email: a.email })),
    url: meetLink || undefined,
  });

  return cal.toString();
};

// Email: slot proposal to candidate
export const sendSlotProposalEmail = async ({
  candidate,
  recruiter,
  job,
  slots,
  meetLink,
  notes,
  interviewId,
}) => {
  const transporter = await createTransporter();

  const slotList = slots
    .map((s, i) => {
      // Handle both raw ISO string and object with dateTime property
      const rawDate = s?.dateTime || s;
      const date = new Date(rawDate);

      // Safety check — skip invalid dates
      if (isNaN(date.getTime())) {
        console.error("Invalid slot date:", s);
        return "";
      }

      return `<li style="margin-bottom:8px;">
    <strong>Option ${i + 1}:</strong>
    ${format(date, "EEEE, MMMM d yyyy")} at
    ${format(date, "h:mm a")}
  </li>`;
    })
    .filter(Boolean)
    .join("");

  const selectUrl = `${process.env.CLIENT_URL}/candidate/interviews/${interviewId}`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
      <div style="background: #7F77DD; border-radius: 12px 12px 0 0; padding: 1.5rem; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Interview Invitation</h1>
        <p style="color: #e8e6ff; margin: 6px 0 0; font-size: 14px;">${job.title} at ${job.company}</p>
      </div>
      <div style="background: #fff; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; padding: 1.5rem;">
        <p style="color: #444; font-size: 15px;">Hi <strong>${candidate.name}</strong>,</p>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          <strong>${recruiter.name}</strong> from <strong>${job.company}</strong> would like to schedule an interview with you for the <strong>${job.title}</strong> role.
        </p>
        <p style="color: #444; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Please choose a time that works for you:</p>
        <ul style="color: #444; font-size: 14px; line-height: 2; padding-left: 1rem;">
          ${slotList}
        </ul>
        ${
          notes
            ? `<div style="background: #f9f8ff; border-left: 3px solid #7F77DD; padding: 10px 14px; border-radius: 0 8px 8px 0; margin: 1rem 0;">
          <p style="margin: 0; font-size: 13px; color: #555;"><strong>Note from recruiter:</strong> ${notes}</p>
        </div>`
            : ""
        }
        ${meetLink ? `<p style="font-size: 13px; color: #666;">Meeting link: <a href="${meetLink}" style="color: #7F77DD;">${meetLink}</a></p>` : ""}
        <div style="text-align: center; margin: 1.5rem 0;">
          <a href="${selectUrl}" style="background: #7F77DD; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Select your preferred slot →
          </a>
        </div>
        <p style="color: #aaa; font-size: 12px; text-align: center;">This invitation was sent via HireAI</p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"HireAI" <${fromAddress}>`, // ← use fromAddress
    to: candidate.email,
    subject: `Interview invitation: ${job.title} at ${job.company}`,
    html,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
};

// Email: confirmation + .ics to both parties
export const sendConfirmationEmails = async ({
  candidate,
  recruiter,
  job,
  confirmedSlot,
  meetLink,
  interviewId,
}) => {
  const transporter = await createTransporter();

  const startTime = new Date(confirmedSlot);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

  const icsContent = generateICS({
    title: `Interview: ${job.title} at ${job.company}`,
    description: `Interview for ${job.title} position`,
    startTime,
    endTime,
    organizer: { name: recruiter.name, email: recruiter.email },
    attendees: [
      { name: recruiter.name, email: recruiter.email },
      { name: candidate.name, email: candidate.email },
    ],
    meetLink,
  });

  const icsAttachment = {
    filename: "interview.ics",
    content: icsContent,
    contentType: "text/calendar",
  };

  const dateStr = format(startTime, "EEEE, MMMM d yyyy");
  const timeStr = format(startTime, "h:mm a");

  const makeHtml = (recipientName, otherName, isRecruiter) => `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
      <div style="background: #1D9E75; border-radius: 12px 12px 0 0; padding: 1.5rem; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Interview Confirmed!</h1>
        <p style="color: #c8f5e8; margin: 6px 0 0; font-size: 14px;">${job.title} at ${job.company}</p>
      </div>
      <div style="background: #fff; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; padding: 1.5rem;">
        <p style="color: #444; font-size: 15px;">Hi <strong>${recipientName}</strong>,</p>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Your interview with <strong>${otherName}</strong> has been confirmed.
        </p>
        <div style="background: #f9f8ff; border-radius: 10px; padding: 1.25rem; margin: 1rem 0;">
          <table style="width: 100%; font-size: 14px; color: #444;">
            <tr><td style="color: #888; padding: 4px 0;">Role</td><td><strong>${job.title}</strong></td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Date</td><td><strong>${dateStr}</strong></td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Time</td><td><strong>${timeStr}</strong></td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Duration</td><td>1 hour</td></tr>
            ${meetLink ? `<tr><td style="color: #888; padding: 4px 0;">Link</td><td><a href="${meetLink}" style="color: #7F77DD;">${meetLink}</a></td></tr>` : ""}
          </table>
        </div>
        <p style="color: #666; font-size: 13px;">A calendar invite (.ics) is attached — open it to add to your calendar.</p>
        <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 1.5rem;">Sent via HireAI</p>
      </div>
    </div>
  `;

  // Send to candidate
  await transporter.sendMail({
    from: `"HireAI" <${fromAddress}>`,
    to: candidate.email,
    subject: `Interview confirmed: ${job.title} at ${job.company} — ${dateStr}`,
    html: makeHtml(candidate.name, recruiter.name, false),
    attachments: [icsAttachment],
  });

  // Send to recruiter
  const recruiterInfo = await transporter.sendMail({
    from: `"HireAI" <${fromAddress}>`,
    to: recruiter.email,
    subject: `Interview confirmed: ${candidate.name} — ${dateStr}`,
    html: makeHtml(recruiter.name, candidate.name, true),
    attachments: [icsAttachment],
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Confirmation preview:",
      nodemailer.getTestMessageUrl(recruiterInfo),
    );
  }
};

// Email: cancellation notice
export const sendCancellationEmail = async ({
  candidate,
  recruiter,
  job,
  cancelledBy,
}) => {
  const transporter = await createTransporter();

  const html = (recipientName) => `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
      <div style="background: #E24B4A; border-radius: 12px 12px 0 0; padding: 1.5rem; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">Interview Cancelled</h1>
      </div>
      <div style="background: #fff; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; padding: 1.5rem;">
        <p style="color: #444; font-size: 14px;">Hi ${recipientName},</p>
        <p style="color: #444; font-size: 14px;">The interview for <strong>${job.title}</strong> has been cancelled by ${cancelledBy}.</p>
        <p style="color: #888; font-size: 13px;">Please reach out if you'd like to reschedule.</p>
      </div>
    </div>
  `;

  await Promise.all([
    transporter.sendMail({
      from: `"HireAI" <${fromAddress}>`,
      to: candidate.email,
      subject: `Interview cancelled: ${job.title}`,
      html: html(candidate.name),
    }),
    transporter.sendMail({
      from: `"HireAI" <${fromAddress}>`,
      to: recruiter.email,
      subject: `Interview cancelled: ${job.title} — ${candidate.name}`,
      html: html(recruiter.name),
    }),
  ]);
};
