"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

type Variant = "reserve" | "contact";

const fieldBase =
  "w-full rounded-sm border border-cream-dim bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted transition-colors focus:border-red focus:outline-none";

/**
 * This used to wait 500ms and say "Thanks, we got it" without sending anything
 * anywhere. On a live site that is worse than having no form: the customer is
 * told an floor manager will call them back, and the enquiry does not exist.
 *
 * Now it posts to /api/inquiry. If the inbox is not configured yet the route
 * says so, and the form falls back to opening a prefilled email to the club.
 * The success panel is only ever shown when something actually left the page.
 */

const FIELD_LABELS: Record<string, string> = {
  first: "First name",
  last: "Last name",
  email: "Email",
  phone: "Phone",
  eventType: "Type of event",
  date: "Event date",
  start: "Start time",
  end: "End time",
  guests: "Guests",
  subject: "Subject",
  message: "Message",
};

export default function InquiryForm({ variant }: { variant: Variant }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function composeEmail(data: Record<string, string>) {
    const subject =
      variant === "reserve"
        ? `Private event enquiry: ${data.eventType || "private event"}${data.date ? ` on ${data.date}` : ""}`
        : `Website enquiry: ${data.subject || "general"}`;
    const body = Object.entries(FIELD_LABELS)
      .filter(([k]) => data[k])
      .map(([k, label]) => `${label}: ${data[k]}`)
      .join("\n");
    return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v).trim()])
    ) as Record<string, string>;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variant, ...data }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setSent(true);
        return;
      }
      // Not wired up, or the mail provider failed. Hand off to the mail client
      // rather than pretending the message went through.
      window.location.href = composeEmail(data);
      setError(
        "We could not send that from the page, so your email app should be opening with the details filled in. If it did not, call us and we will take it down over the phone."
      );
    } catch {
      window.location.href = composeEmail(data);
      setError(
        "That did not send from the page. Your email app should be opening with the details filled in."
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-sm border border-red/40 bg-ink p-10 text-center"
      >
        <p className="display text-2xl uppercase tracking-wide text-red">
          Thanks, we got it
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {variant === "reserve"
            ? "Our floor manager will get back to you within one business day. If your date is close, call us and we will sort it out right now."
            : "We will get back to you within one business day. For anything time-sensitive, give us a call."}
        </p>
        <a
          href={SITE.phoneHref}
          className="display mt-7 inline-block rounded-sm border border-red px-6 py-3 text-sm uppercase tracking-widest text-red transition-colors hover:bg-red-light hover:text-cream-light"
        >
          Call {SITE.phone}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="first" required />
        <Field label="Last name" name="last" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" required />
      </div>

      {variant === "reserve" ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type of event" name="eventType" placeholder="Birthday, fantasy draft, business meeting" />
            <Field label="Event date" name="date" type="date" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Start time" name="start" type="time" />
            <Field label="End time" name="end" type="time" />
            <Field label="Guests" name="guests" type="number" placeholder="Up to 72" />
          </div>
        </>
      ) : (
        <Field label="Subject" name="subject" required />
      )}

      <div>
        <label htmlFor="message" className="display block text-xs uppercase tracking-[0.2em] text-muted">
          {variant === "reserve" ? "Tell us about your event" : "Message"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${fieldBase} mt-2 resize-y`}
          placeholder={
            variant === "reserve"
              ? "Food options you are interested in, decorations, anything we should know."
              : "How can we help?"
          }
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="display w-full rounded-sm bg-red px-7 py-4 text-sm uppercase tracking-widest text-cream-light transition-colors hover:bg-red-light disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : variant === "reserve" ? "Request the Space" : "Send Message"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-red/50 bg-cream p-4 text-sm leading-relaxed text-muted"
        >
          {error}
        </p>
      )}

      <p className="text-xs text-muted">
        We reply within one business day. Prefer to talk it through?{" "}
        <a href={SITE.phoneHref} className="text-red underline underline-offset-4">
          {SITE.phone}
        </a>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="display block text-xs uppercase tracking-[0.2em] text-muted">
        {label}
        {required && (
          <span className="ml-1 text-red" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`${fieldBase} mt-2`}
      />
    </div>
  );
}
