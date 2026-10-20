"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download, FileText, Upload, ArrowUp, ArrowDown, AlertTriangle, Eye, Pencil, Shield,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { htmlToPdf } from "@/lib/pdf/html-to-pdf";
import { downloadBytes } from "@/lib/files/download";

type Experience = { title: string; company: string; start: string; end: string; bullets: string[] };
type Education = { degree: string; school: string; year: string };
type Project = { name: string; desc: string; tech: string };

type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string;
};

const DEFAULT_DATA: ResumeData = {
  name: "Alex Morgan",
  title: "Software Engineer",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 010-2030",
  location: "San Francisco, CA",
  links: "github.com/alexmorgan · linkedin.com/in/alexmorgan",
  summary:
    "Software engineer with 6 years building web platforms. Led migration of a monolith to services, cutting p99 latency 62%. Comfortable across the stack; care about measurable outcomes and clean interfaces.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Northwind Systems",
      start: "2021",
      end: "Present",
      bullets: [
        "Led migration of the billing monolith to 12 services; p99 checkout latency 840ms → 310ms.",
        "Mentored 4 engineers; introduced RFC process adopted across 3 teams.",
        "Cut CI time from 22m to 7m by parallelising test shards.",
      ],
    },
    {
      title: "Software Engineer",
      company: "Acme Corp",
      start: "2018",
      end: "2021",
      bullets: [
        "Built the self-serve onboarding flow; activation +18%.",
        "Owned the payments integration (Stripe) for 40k monthly transactions.",
      ],
    },
  ],
  education: [
    { degree: "B.Sc. Computer Science", school: "State University", year: "2018" },
  ],
  projects: [
    { name: "fastdiff", desc: "Open-source line diff library, 1.2k GitHub stars.", tech: "TypeScript" },
  ],
  skills: "TypeScript, React, Node.js, Go, PostgreSQL, Redis, AWS, Docker, Kubernetes",
};

const TEMPLATES = ["Classic", "Modern", "Sidebar", "Academic CV"] as const;
type Template = (typeof TEMPLATES)[number];

const STORAGE_KEY = "latex-resume-data";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resumeHtml(data: ResumeData, template: Template, order: string[] = ["summary","experience","education","projects","skills"]): string {
  const contact = [data.email, data.phone, data.location, data.links].filter(Boolean).join(" · ");
  const expHtml = data.experience
    .map(
      (e) => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:8px;">
          <strong>${esc(e.title)}</strong><span>${esc(e.start)} – ${esc(e.end)}</span>
        </div>
        <div style="font-style:italic;color:#555;">${esc(e.company)}</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${e.bullets.filter(Boolean).map((b) => `<li style="margin:2px 0;">${esc(b)}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");
  const eduHtml = data.education
    .map(
      (e) => `<div style="margin-bottom:6px;"><strong>${esc(e.degree)}</strong> — ${esc(e.school)} <span style="color:#555;">(${esc(e.year)})</span></div>`
    )
    .join("");
  const projHtml = data.projects
    .map(
      (p) => `<div style="margin-bottom:6px;"><strong>${esc(p.name)}</strong> <span style="color:#555;">${esc(p.tech)}</span><div>${esc(p.desc)}</div></div>`
    )
    .join("");

  const sidebar = template === "Sidebar";
  const accent = template === "Modern" ? "#2563eb" : "#111";

  if (sidebar) {
    return `
      <div style="display:flex;font-family:Helvetica,Arial,sans-serif;font-size:10.5pt;color:#222;line-height:1.4;">
        <div style="width:32%;background:#f3f4f6;padding:16px;box-sizing:border-box;">
          <h1 style="margin:0 0 4px;font-size:16pt;color:${accent};">${esc(data.name)}</h1>
          <div style="font-size:10pt;color:#555;margin-bottom:10px;">${esc(data.title)}</div>
          <div style="font-size:9pt;margin-bottom:10px;">${esc(contact).replace(/ · /g, "<br/>")}</div>
          <h3 style="font-size:11pt;margin:10px 0 4px;color:${accent};">Skills</h3>
          <div style="font-size:9pt;">${esc(data.skills)}</div>
        </div>
        <div style="width:68%;padding:16px;box-sizing:border-box;">
          ${order.map((s) => {
            if (s === "summary") return `<h3 style="font-size:11pt;margin:0 0 4px;color:${accent};border-bottom:1px solid #ddd;padding-bottom:2px;">Summary</h3><p style="margin:0 0 10px;">${esc(data.summary)}</p>`;
            if (s === "experience") return `<h3 style="font-size:11pt;margin:0 0 4px;color:${accent};border-bottom:1px solid #ddd;padding-bottom:2px;">Experience</h3>${expHtml}`;
            if (s === "education") return `<h3 style="font-size:11pt;margin:0 0 4px;color:${accent};border-bottom:1px solid #ddd;padding-bottom:2px;">Education</h3>${eduHtml}`;
            if (s === "projects") return `<h3 style="font-size:11pt;margin:0 0 4px;color:${accent};border-bottom:1px solid #ddd;padding-bottom:2px;">Projects</h3>${projHtml}`;
            if (s === "skills") return "";
            return "";
          }).join("")}
        </div>
      </div>`;
  }

  const section = (label: string, body: string) =>
    body.trim()
      ? `<div style="margin-top:10px;"><h2 style="font-size:12pt;color:${accent};border-bottom:1px solid #ddd;padding-bottom:2px;margin:0 0 4px;">${label}</h2>${body}</div>`
      : "";

  return `
    <div style="font-family:${template === "Academic CV" ? "Times New Roman,serif" : "Helvetica,Arial,sans-serif"};font-size:${template === "Academic CV" ? "11pt" : "10.5pt"};color:#222;line-height:1.4;max-width:100%;">
      <div style="text-align:${template === "Classic" ? "center" : "left"};margin-bottom:8px;">
        <h1 style="margin:0;font-size:${template === "Academic CV" ? "18pt" : "16pt"};color:${accent};">${esc(data.name)}</h1>
        <div style="font-size:11pt;color:#555;">${esc(data.title)}</div>
        <div style="font-size:9pt;color:#555;margin-top:2px;">${esc(contact)}</div>
      </div>
      ${order.map((s) => {
        if (s === "summary") return section("Summary", `<p style="margin:0;">${esc(data.summary)}</p>`);
        if (s === "experience") return section("Experience", expHtml);
        if (s === "education") return section("Education", eduHtml);
        if (s === "projects") return section("Projects", projHtml);
        if (s === "skills") return section("Skills", `<div>${esc(data.skills)}</div>`);
        return "";
      }).join("")}
    </div>`;
}

function warningsFor(data: ResumeData, template: Template): string[] {
  const w: string[] = [];
  for (const e of data.experience) {
    if (!e.start || !e.end) w.push(`Missing dates in experience: ${e.title || "untitled role"}.`);
  }
  for (const e of data.education) {
    if (!e.year) w.push(`Missing year in education: ${e.degree || "untitled"}.`);
  }
  const bullets = data.experience.flatMap((e) => e.bullets).filter(Boolean);
  const withNum = bullets.filter((b) => /\d/.test(b)).length;
  if (bullets.length > 0 && withNum / bullets.length < 0.5) {
    w.push(`Only ${withNum} of ${bullets.length} bullets contain a number. Add metrics.`);
  }
  if (template === "Sidebar") {
    w.push("Sidebar (two-column) layouts can interleave when parsed by ATS.");
  }
  const text = JSON.stringify(data);
  if (text.length > 4000) {
    w.push("Resume may exceed one page; trim for roles under ~10 years.");
  }
  return w;
}

function toTex(data: ResumeData, template: Template): string {
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(" $\\cdot$ ");
  const exp = data.experience
    .map(
      (e) =>
        `\\experience{${texEsc(e.title)}}{${texEsc(e.company)}}{${texEsc(e.start)} -- ${texEsc(e.end)}}{\n${e.bullets
          .filter(Boolean)
          .map((b) => `  \\item ${texEsc(b)}`)
          .join("\n")}\n}`
    )
    .join("\n\n");
  const edu = data.education
    .map((e) => `\\education{${texEsc(e.degree)}}{${texEsc(e.school)}}{${texEsc(e.year)}}`)
    .join("\n");
  const proj = data.projects
    .map((p) => `\\project{${texEsc(p.name)}}{${texEsc(p.tech)}}{${texEsc(p.desc)}}`)
    .join("\n");
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\newcommand{\\experience}[4]{\\textbf{#1} \\hfill #3\\\\\\textit{#2}\\begin{itemize}[noitemsep,topsep=2pt]\\item #4\\end{itemize}}
\\newcommand{\\education}[3]{\\textbf{#1} --- #2 \\hfill #3\\\\}
\\newcommand{\\project}[3]{\\textbf{#1} \\textit{#2}\\\\#3\\\\}
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{${texEsc(data.name)}}}\\\\
${texEsc(data.title)}\\\\
${texEsc(contact)}\\\\
${texEsc(data.links)}
\\end{center}
\\section*{Summary}
${texEsc(data.summary)}
\\section*{Experience}
${exp}
\\section*{Education}
${edu}
\\section*{Projects}
${proj}
\\section*{Skills}
${texEsc(data.skills)}
\\end{document}
`;
}

function texEsc(s: string) {
  return s.replace(/\\/g, "\\textbackslash{}").replace(/[&%$#_{}]/g, (m) => "\\" + m);
}

function parseTex(text: string): ResumeData | null {
  const get = (re: RegExp) => {
    const m = text.match(re);
    return m ? m[1] : "";
  };
  const name = get(/\\textbf\{([^}]*)\}/) || get(/\\name\{([^}]*)\}/);
  // fallback: try \LARGE block
  const data: ResumeData = { ...DEFAULT_DATA };
  if (name) data.name = name;
  const titleMatch = text.match(/\\LARGE[^]*?\\\\\s*\n\s*([^\n\\]+)/);
  if (titleMatch) data.title = titleMatch[1].trim();
  const summaryMatch = text.match(/\\section\*\{Summary\}\s*\n([\s\S]*?)(?=\\section\*)/);
  if (summaryMatch) data.summary = summaryMatch[1].trim();
  const skillsMatch = text.match(/\\section\*\{Skills\}\s*\n([\s\S]*?)(?=\\end\{document\})/);
  if (skillsMatch) data.skills = skillsMatch[1].trim();
  return data;
}

export default function LatexResumePage() {
  const [data, setData] = useState<ResumeData>(DEFAULT_DATA);
  const [template, setTemplate] = useState<Template>("Classic");
  const [sectionOrder, setSectionOrder] = useState<string[]>(["summary", "experience", "education", "projects", "skills"]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) setData(parsed.data);
        if (parsed && parsed.template) setTemplate(parsed.template);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, template }));
    } catch {}
  }, [data, template, loaded]);

  const w = warningsFor(data, template);

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sectionOrder];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setSectionOrder(next);
  };

  const updateExp = (i: number, patch: Partial<Experience>) => {
    setData((d) => {
      const e = [...d.experience];
      e[i] = { ...e[i], ...patch };
      return { ...d, experience: e };
    });
  };

  const updateEdu = (i: number, patch: Partial<Education>) => {
    setData((d) => {
      const e = [...d.education];
      e[i] = { ...e[i], ...patch };
      return { ...d, education: e };
    });
  };

  const updateProj = (i: number, patch: Partial<Project>) => {
    setData((d) => {
      const p = [...d.projects];
      p[i] = { ...p[i], ...patch };
      return { ...d, projects: p };
    });
  };

  const handleExportPdf = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const html = resumeHtml(data, template, sectionOrder);
      const bytes = await htmlToPdf(html, { pageSize: "a4" });
      downloadBytes(bytes, "resume.pdf", "application/pdf");
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportTex = () => {
    const tex = toTex(data, template);
    const blob = new Blob([tex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.tex";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTex = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseTex(text);
      if (parsed) setData(parsed);
    };
    reader.readAsText(file);
  };

  const previewHtml = resumeHtml(data, template, sectionOrder);

  return (
    <ToolPageLayout toolId="latex-resume" toolName="LaTeX Resume" description="Build an ATS-friendly resume with four typeset templates. Export PDF or .tex.">
      <div className="space-y-4">
        {/* Mobile view toggle */}
        <div className="flex gap-2 sm:hidden">
          <button onClick={() => setView("edit")} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold border ${view === "edit" ? "bg-action-primary text-action-primary-text border-action-primary" : "border-border"}`}>Edit</button>
          <button onClick={() => setView("preview")} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold border ${view === "preview" ? "bg-action-primary text-action-primary-text border-action-primary" : "border-border"}`}>Preview</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className={`space-y-4 ${view === "preview" ? "hidden sm:block" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold">Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} className="rounded-lg border border-border bg-surface-base px-2 py-1 text-xs">
                {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={handleExportPdf} disabled={isProcessing} className="ml-auto rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90 disabled:opacity-50">
                {isProcessing ? "Exporting…" : "Download PDF"}
              </button>
              <button onClick={handleExportTex} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-subtle">Export .tex</button>
              <label className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-subtle cursor-pointer">
                <Upload className="inline h-3 w-3 mr-1" /> Import .tex
                <input type="file" accept=".tex" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportTex(f); e.target.value = ""; }} />
              </label>
            </div>

            {w.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                {w.map((x, i) => <div key={i} className="flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{x}</div>)}
              </div>
            )}

            {/* Personal */}
            <section className="rounded-xl border border-border p-4 space-y-2">
              <h3 className="text-sm font-semibold">Personal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Phone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Location" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} />
                <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Links" value={data.links} onChange={(e) => setData({ ...data, links: e.target.value })} />
              </div>
              <textarea className="w-full rounded border border-border px-2 py-1 text-xs" rows={3} placeholder="Summary" value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} />
            </section>

            {/* Experience */}
            <section className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Experience</h3>
                <button onClick={() => setData({ ...data, experience: [...data.experience, { title: "", company: "", start: "", end: "", bullets: [""] }] })} className="text-xs text-accent hover:underline">+ Add</button>
              </div>
              {data.experience.map((e, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Title" value={e.title} onChange={(ev) => updateExp(i, { title: ev.target.value })} />
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Company" value={e.company} onChange={(ev) => updateExp(i, { company: ev.target.value })} />
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Start" value={e.start} onChange={(ev) => updateExp(i, { start: ev.target.value })} />
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="End" value={e.end} onChange={(ev) => updateExp(i, { end: ev.target.value })} />
                  </div>
                  <textarea className="w-full rounded border border-border px-2 py-1 text-xs" rows={3} placeholder="Bullets (one per line)" value={e.bullets.join("\n")} onChange={(ev) => updateExp(i, { bullets: ev.target.value.split("\n") })} />
                  <button onClick={() => setData({ ...data, experience: data.experience.filter((_, idx) => idx !== i) })} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ))}
            </section>

            {/* Education */}
            <section className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Education</h3>
                <button onClick={() => setData({ ...data, education: [...data.education, { degree: "", school: "", year: "" }] })} className="text-xs text-accent hover:underline">+ Add</button>
              </div>
              {data.education.map((e, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Degree" value={e.degree} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} />
                  <input className="rounded border border-border px-2 py-1 text-xs" placeholder="School" value={e.school} onChange={(ev) => updateEdu(i, { school: ev.target.value })} />
                  <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Year" value={e.year} onChange={(ev) => updateEdu(i, { year: ev.target.value })} />
                </div>
              ))}
            </section>

            {/* Projects */}
            <section className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Projects</h3>
                <button onClick={() => setData({ ...data, projects: [...data.projects, { name: "", desc: "", tech: "" }] })} className="text-xs text-accent hover:underline">+ Add</button>
              </div>
              {data.projects.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Name" value={p.name} onChange={(ev) => updateProj(i, { name: ev.target.value })} />
                    <input className="rounded border border-border px-2 py-1 text-xs" placeholder="Tech" value={p.tech} onChange={(ev) => updateProj(i, { tech: ev.target.value })} />
                  </div>
                  <textarea className="w-full rounded border border-border px-2 py-1 text-xs" rows={2} placeholder="Description" value={p.desc} onChange={(ev) => updateProj(i, { desc: ev.target.value })} />
                </div>
              ))}
            </section>

            {/* Skills */}
            <section className="rounded-xl border border-border p-4 space-y-2">
              <h3 className="text-sm font-semibold">Skills</h3>
              <textarea className="w-full rounded border border-border px-2 py-1 text-xs" rows={2} placeholder="Comma-separated skills" value={data.skills} onChange={(e) => setData({ ...data, skills: e.target.value })} />
            </section>

            {/* Section order */}
            <section className="rounded-xl border border-border p-4 space-y-2">
              <h3 className="text-sm font-semibold">Section order</h3>
              {sectionOrder.map((s, i) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{s}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                    <button onClick={() => moveSection(i, 1)} disabled={i === sectionOrder.length - 1} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Preview */}
          <div className={`${view === "edit" ? "hidden sm:block" : ""}`}>
            <div className="rounded-xl border border-border bg-white p-4 shadow-paper overflow-auto max-h-[80vh]">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>

        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span>Draft saved in your browser. Nothing is uploaded.</span>
        </div>
      </div>
    </ToolPageLayout>
  );
}