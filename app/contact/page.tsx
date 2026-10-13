"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, Shield } from "lucide-react";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("feedback");

  const contactEmail = "support@pdfkit.local";

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(`[PDFKit - ${topic.toUpperCase()}] ${subject || "User Inquiry"}`);
    const mailtoBody = encodeURIComponent(
      `Topic: ${topic}\n\nMessage:\n${body}\n\n---\nSent from PDFKit Web Interface`
    );
    window.location.href = `mailto:${contactEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Direct Communication</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Contact & Support
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Have questions about client-side PDF processing, want to report an issue, or suggest a new tool? We are here to help.
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto space-y-8">
          {/* Privacy Note */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Privacy Note on Document Support:</span>{" "}
              Never attach confidential, medical, or legally privileged PDF files to support emails. Because PDFKit runs locally on your machine, we do not have server access to view your documents.
            </div>
          </div>

          {/* Contact Card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Compose Inquiry
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                This form prepares a direct message addressed to our team mailbox:{" "}
                <strong className="text-foreground">{contactEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Inquiry Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="feedback">General Feedback & Suggestions</option>
                  <option value="bug">Bug Report / Processing Error</option>
                  <option value="privacy">Privacy & Security Question</option>
                  <option value="feature">New Tool Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Message Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe your question, browser version, or issue..."
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Open in Email Client ({contactEmail})</span>
                </button>
              </div>
            </form>

            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Or email us directly at:{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
