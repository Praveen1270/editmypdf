"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Printer,
  FileText,
  Upload,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Eye,
  Pencil,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Columns,
  Maximize2,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { downloadBytes } from "@/lib/files/download";
import { generateResumePdf } from "@/lib/pdf/generate-resume-pdf";

type Experience = {
  title: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
};

type Education = {
  degree: string;
  school: string;
  year: string;
};

type Project = {
  name: string;
  desc: string;
  tech: string;
};

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
  links: "github.com/alexmorgan  |  linkedin.com/in/alexmorgan",
  summary:
    "Software engineer with 6 years building web platforms. Led migration of a monolith to services, cutting p99 latency 62%. Comfortable across the stack; care about measurable outcomes, team velocity, and clean interfaces.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Northwind Systems",
      start: "2021",
      end: "Present",
      bullets: [
        "Led migration of the billing monolith to 12 services; p99 checkout latency 840ms -> 310ms.",
        "Mentored 4 engineers and introduced RFC process adopted across 3 teams.",
        "Cut CI build times from 22m to 7m by parallelising test shards.",
      ],
    },
    {
      title: "Software Engineer",
      company: "Acme Corp",
      start: "2018",
      end: "2021",
      bullets: [
        "Built the self-serve onboarding flow, increasing customer activation by 18%.",
        "Owned the Stripe payments integration processing over 40k monthly transactions.",
      ],
    },
  ],
  education: [
    { degree: "B.Sc. Computer Science", school: "State University", year: "2018" },
  ],
  projects: [
    { name: "fastdiff", desc: "Open-source high performance line diff library with 1.2k GitHub stars.", tech: "TypeScript, Rust" },
  ],
  skills: "TypeScript, React, Next.js, Node.js, Go, PostgreSQL, Redis, AWS, Docker, Git",
};

const TEMPLATES = ["Classic", "Modern", "Sidebar", "Academic CV"] as const;
type Template = (typeof TEMPLATES)[number];

const STORAGE_KEY = "latex-resume-data-v2";

function esc(s: string) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resumeHtml(
  data: ResumeData,
  template: Template,
  order: string[] = ["summary", "experience", "education", "projects", "skills"]
): string {
  const contactItems = [data.email, data.phone, data.location, data.links].filter(Boolean);
  const contact = contactItems.map((c) => esc(c)).join(" &nbsp;|&nbsp; ");

  const expHtml = (data.experience || [])
    .filter((e) => e.title || e.company)
    .map(
      (e) => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
          <strong style="font-size: 10.5pt; color: #111;">${esc(e.title || "Position")}</strong>
          <span style="font-size: 9.5pt; color: #555; white-space: nowrap;">${esc(e.start || "")}${e.start && e.end ? " – " : ""}${esc(e.end || "")}</span>
        </div>
        ${e.company ? `<div style="font-size: 9.5pt; font-style: italic; color: #444; margin-bottom: 4px;">${esc(e.company)}</div>` : ""}
        ${
          e.bullets && e.bullets.filter(Boolean).length > 0
            ? `<ul style="margin: 3px 0 0 16px; padding: 0; list-style-type: disc;">
                ${e.bullets
                  .filter(Boolean)
                  .map((b) => `<li style="margin: 2.5px 0; font-size: 9.5pt; line-height: 1.4; color: #222;">${esc(b)}</li>`)
                  .join("")}
              </ul>`
            : ""
        }
      </div>`
    )
    .join("");

  const eduHtml = (data.education || [])
    .filter((e) => e.degree || e.school)
    .map(
      (e) => `
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
        <div>
          <strong style="font-size: 10pt; color: #111;">${esc(e.degree || "")}</strong>
          ${e.degree && e.school ? ` — <span style="font-size: 9.5pt; color: #333;">${esc(e.school)}</span>` : `<span style="font-size: 9.5pt; color: #333;">${esc(e.school)}</span>`}
        </div>
        ${e.year ? `<span style="font-size: 9pt; color: #666; white-space: nowrap;">${esc(e.year)}</span>` : ""}
      </div>`
    )
    .join("");

  const projHtml = (data.projects || [])
    .filter((p) => p.name)
    .map(
      (p) => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <strong style="font-size: 10pt; color: #111;">${esc(p.name)}</strong>
          ${p.tech ? `<span style="font-size: 9pt; color: #666; font-style: italic;">(${esc(p.tech)})</span>` : ""}
        </div>
        ${p.desc ? `<div style="font-size: 9.5pt; line-height: 1.4; color: #333; margin-top: 2px;">${esc(p.desc)}</div>` : ""}
      </div>`
    )
    .join("");

  const skillsHtml = data.skills?.trim()
    ? `<div style="font-size: 9.5pt; line-height: 1.45; color: #222;">${esc(data.skills)}</div>`
    : "";

  const summaryHtml = data.summary?.trim()
    ? `<p style="margin: 0; font-size: 9.5pt; line-height: 1.45; color: #222;">${esc(data.summary)}</p>`
    : "";

  const accentColor =
    template === "Modern"
      ? "#2563eb"
      : template === "Academic CV"
      ? "#1e293b"
      : "#111827";

  const fontFamily =
    template === "Academic CV"
      ? '"Times New Roman", Times, Georgia, serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  // Sidebar Layout
  if (template === "Sidebar") {
    return `
      <div style="font-family: ${fontFamily}; color: #1f2937; line-height: 1.4; display: flex; min-height: 980px;">
        <!-- Left Sidebar -->
        <div style="width: 32%; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 24px 18px; box-sizing: border-box;">
          <h2 style="margin: 0 0 4px; font-size: 15pt; font-weight: 700; color: #0f172a;">${esc(data.name || "Alex Morgan")}</h2>
          <div style="font-size: 9.5pt; color: #64748b; font-weight: 500; margin-bottom: 16px;">${esc(data.title)}</div>
          
          <div style="margin-bottom: 20px;">
            <div style="font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px;">Contact</div>
            <div style="font-size: 8.5pt; line-height: 1.6; color: #334155; word-break: break-word;">
              ${data.email ? `<div>${esc(data.email)}</div>` : ""}
              ${data.phone ? `<div>${esc(data.phone)}</div>` : ""}
              ${data.location ? `<div>${esc(data.location)}</div>` : ""}
              ${data.links ? `<div style="margin-top: 4px;">${esc(data.links).replace(/ \| /g, "<br/>")}</div>` : ""}
            </div>
          </div>

          ${data.skills ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px;">Skills</div>
              <div style="font-size: 8.5pt; line-height: 1.5; color: #334155;">${esc(data.skills)}</div>
            </div>
          ` : ""}

          ${eduHtml ? `
            <div>
              <div style="font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px;">Education</div>
              ${eduHtml}
            </div>
          ` : ""}
        </div>

        <!-- Main Column -->
        <div style="width: 68%; padding: 24px 20px; box-sizing: border-box;">
          ${order.map((s) => {
            if (s === "summary" && summaryHtml) {
              return `
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px;">Profile</div>
                  ${summaryHtml}
                </div>`;
            }
            if (s === "experience" && expHtml) {
              return `
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px;">Experience</div>
                  ${expHtml}
                </div>`;
            }
            if (s === "projects" && projHtml) {
              return `
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px;">Projects</div>
                  ${projHtml}
                </div>`;
            }
            return "";
          }).join("")}
        </div>
      </div>
    `;
  }

  // Classic, Modern, Academic CV
  const renderSection = (title: string, body: string) => {
    if (!body.trim()) return "";
    return `
      <div style="margin-top: 14px; margin-bottom: 10px;">
        <div style="font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: ${accentColor}; border-bottom: 1.5px solid ${template === "Modern" ? "#93c5fd" : "#333"}; padding-bottom: 2px; margin-bottom: 8px;">
          ${title}
        </div>
        ${body}
      </div>
    `;
  };

  const isCentered = template === "Classic" || template === "Academic CV";

  return `
    <div style="font-family: ${fontFamily}; color: #111827; line-height: 1.4; padding: 10px 0;">
      <!-- Header -->
      <div style="text-align: ${isCentered ? "center" : "left"}; margin-bottom: 12px; padding-bottom: 4px;">
        <h2 style="margin: 0 0 3px; font-size: ${template === "Academic CV" ? "20pt" : "18pt"}; font-weight: 700; color: ${accentColor}; letter-spacing: ${template === "Classic" ? "0.8px" : "normal"};">
          ${esc(data.name || "Alex Morgan")}
        </h2>
        ${data.title ? `<div style="font-size: 10.5pt; font-style: italic; color: #4b5563; margin-bottom: 4px;">${esc(data.title)}</div>` : ""}
        ${contact ? `<div style="font-size: 9pt; color: #4b5563; margin-top: 2px; line-height: 1.4;">${contact}</div>` : ""}
      </div>

      <!-- Sections -->
      ${order
        .map((s) => {
          if (s === "summary") return renderSection("Professional Summary", summaryHtml);
          if (s === "experience") return renderSection("Experience", expHtml);
          if (s === "education") return renderSection("Education", eduHtml);
          if (s === "projects") return renderSection("Projects", projHtml);
          if (s === "skills") return renderSection("Skills", skillsHtml);
          return "";
        })
        .join("")}
    </div>
  `;
}

function warningsFor(data: ResumeData, template: Template): string[] {
  const w: string[] = [];
  if (!data.name.trim()) w.push("Name is required.");
  if (!data.email.trim() && !data.phone.trim()) w.push("Add an email or phone for recruiter contact.");
  for (const e of data.experience) {
    if (!e.start || !e.end) w.push(`Missing dates for ${e.title || "role"}.`);
  }
  for (const e of data.education) {
    if (!e.year) w.push(`Missing graduation year for ${e.degree || "education"}.`);
  }
  const bullets = (data.experience || []).flatMap((e) => e.bullets || []).filter(Boolean);
  const withNum = bullets.filter((b) => /\d/.test(b)).length;
  if (bullets.length > 0 && withNum / bullets.length < 0.5) {
    w.push(`Only ${withNum} of ${bullets.length} bullets include numbers/metrics. Quantify results where possible.`);
  }
  if (template === "Sidebar") {
    w.push("Sidebar layout is visually striking; some legacy ATS prefer single-column Classic format.");
  }
  return w;
}

function toTex(data: ResumeData, template: Template): string {
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(" $\\cdot$ ");
  const exp = (data.experience || [])
    .map(
      (e) =>
        `\\resumeSubheading\n  {${texEsc(e.title)}}{${texEsc(e.start)} -- ${texEsc(e.end)}}\n  {${texEsc(e.company)}}{}\n\\resumeItemListStart\n${(e.bullets || [])
          .filter(Boolean)
          .map((b) => `  \\resumeItem{${texEsc(b)}}`)
          .join("\n")}\n\\resumeItemListEnd`
    )
    .join("\n\n");

  const edu = (data.education || [])
    .map((e) => `\\resumeSubheading\n  {${texEsc(e.degree)}}{${texEsc(e.year)}}\n  {${texEsc(e.school)}}{}`)
    .join("\n\n");

  const proj = (data.projects || [])
    .map((p) => `\\resumeProjectHeading\n  {\\textbf{${texEsc(p.name)}} ${p.tech ? `$|$ \\emph{${texEsc(p.tech)}}` : ""}}{}\n  \\resumeItemListStart\n    \\resumeItem{${texEsc(p.desc)}}\n  \\resumeItemListEnd`)
    .join("\n\n");

  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge \\scshape ${texEsc(data.name)}} \\\\ \\vspace{1pt}
  ${data.title ? `\\small \\textit{${texEsc(data.title)}} \\\\ \\vspace{1pt}` : ""}
  \\small ${texEsc(contact)} \\\\ \\vspace{1pt}
  ${data.links ? `\\small ${texEsc(data.links)}` : ""}
\\end{center}

${data.summary ? `\\section{Summary}\n\\small{${texEsc(data.summary)}}\n` : ""}

\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
${exp}
\\end{itemize}

\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
${edu}
\\end{itemize}

${proj ? `\\section{Projects}\n\\begin{itemize}[leftmargin=0.15in, label={}]\n${proj}\n\\end{itemize}\n` : ""}

${data.skills ? `\\section{Technical Skills}\n\\begin{itemize}[leftmargin=0.15in, label={}]\n  \\small{\\item{\\textbf{Skills}{: ${texEsc(data.skills)}}}}\n\\end{itemize}` : ""}

\\end{document}
`;
}

function texEsc(s: string) {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (m) => "\\" + m)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function parseTex(text: string): ResumeData | null {
  const get = (re: RegExp) => {
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };
  const name = get(/\\Huge\s*\\scshape\s*([^}]+)\}/) || get(/\\textbf\{([^}]*)\}/);
  const data: ResumeData = { ...DEFAULT_DATA };
  if (name) data.name = name;
  const summaryMatch = text.match(/\\section\{Summary\}\s*\n\\small\{([^}]+)\}/);
  if (summaryMatch) data.summary = summaryMatch[1].trim();
  const skillsMatch = text.match(/\\textbf\{Skills\}\{:\s*([^}]+)\}/);
  if (skillsMatch) data.skills = skillsMatch[1].trim();
  return data;
}

export default function LatexResumePage() {
  const [data, setData] = useState<ResumeData>(DEFAULT_DATA);
  const [template, setTemplate] = useState<Template>("Classic");
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "preview" | "edit">("split");
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "projects" | "skills">("personal");
  const [zoom, setZoom] = useState(100);
  const [copiedTex, setCopiedTex] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const printIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) setData(parsed.data);
        if (parsed?.template) setTemplate(parsed.template);
        if (parsed?.order) setSectionOrder(parsed.order);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, template, order: sectionOrder }));
    } catch {}
  }, [data, template, sectionOrder, loaded]);

  const warnings = warningsFor(data, template);

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sectionOrder];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
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

  // Direct High Quality PDF Generation
  const handleExportPdf = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await generateResumePdf(data, template, sectionOrder);
      const filename = `${(data.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      downloadBytes(bytes, filename, "application/pdf");
    } catch (err: any) {
      setErrorMessage(`Export failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Browser Print / Save as PDF (Vector-accurate print preview)
  const handleBrowserPrint = () => {
    const html = resumeHtml(data, template, sectionOrder);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.name || "Resume"} - Resume</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  const handleExportTex = () => {
    const tex = toTex(data, template);
    const blob = new Blob([tex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.name || "Resume").replace(/\s+/g, "_")}_Resume.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTex = async () => {
    const tex = toTex(data, template);
    try {
      await navigator.clipboard.writeText(tex);
      setCopiedTex(true);
      setTimeout(() => setCopiedTex(false), 2000);
    } catch {}
  };

  const handleExportJson = () => {
    const json = JSON.stringify({ data, template, order: sectionOrder }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.name || "Resume").replace(/\s+/g, "_")}_resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        if (parsed?.data) setData(parsed.data);
        if (parsed?.template) setTemplate(parsed.template);
        if (parsed?.order) setSectionOrder(parsed.order);
      } catch {
        setErrorMessage("Invalid JSON resume file.");
      }
    };
    reader.readAsText(file);
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

  const handleLoadSample = () => {
    setData(DEFAULT_DATA);
    setTemplate("Classic");
    setSectionOrder(["summary", "experience", "education", "projects", "skills"]);
  };

  const handleClearAll = () => {
    if (confirm("Clear all resume fields?")) {
      setData({
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        links: "",
        summary: "",
        experience: [],
        education: [],
        projects: [],
        skills: "",
      });
    }
  };

  const previewHtml = resumeHtml(data, template, sectionOrder);

  return (
    <ToolPageLayout
      toolId="latex-resume"
      toolName="LaTeX Resume"
      description="Build an ATS-friendly resume with four typeset templates. Export PDF, Overleaf .tex, or print directly."
    >
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-paper">
          {/* Left: Template & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Template:</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as Template)}
              className="rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-action-focus"
            >
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-surface-subtle p-0.5 ml-2">
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "split"
                    ? "bg-surface-base text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Split editor and preview"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "preview"
                    ? "bg-surface-base text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Large full-width preview"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Full Preview</span>
              </button>
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "edit"
                    ? "bg-surface-base text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Editor only"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Editor</span>
              </button>
            </div>
          </div>

          {/* Right: Export & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Download PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-action-primary px-3.5 py-1.5 text-xs font-semibold text-action-primary-text shadow-sm hover:opacity-95 disabled:opacity-50 transition"
              title="Download high-quality ATS-friendly PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isProcessing ? "Exporting PDF…" : "Download PDF"}</span>
            </button>

            {/* Print / Save PDF via Browser */}
            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition"
              title="Print or Save via Browser (vector-accurate)"
            >
              <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Print / Save</span>
            </button>

            {/* LaTeX Overleaf Export */}
            <button
              onClick={handleExportTex}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition"
              title="Export .tex source for Overleaf"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>.tex</span>
            </button>

            {/* Copy LaTeX button */}
            <button
              onClick={handleCopyTex}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition"
              title="Copy LaTeX code to clipboard"
            >
              {copiedTex ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copy TeX</span>
                </>
              )}
            </button>

            {/* JSON / Sample menu */}
            <div className="flex items-center gap-1 border-l border-border pl-2">
              <button
                onClick={handleExportJson}
                className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                title="Backup resume data as JSON"
              >
                JSON
              </button>

              <label
                className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle cursor-pointer"
                title="Import JSON or .tex"
              >
                <Upload className="inline h-3 w-3 mr-0.5" /> Load
                <input
                  type="file"
                  accept=".json,.tex"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.name.endsWith(".json")) handleImportJson(f);
                      else handleImportTex(f);
                    }
                    e.target.value = "";
                  }}
                />
              </label>

              <button
                onClick={handleLoadSample}
                className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                title="Reset to sample data"
              >
                Sample
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border ${
              viewMode === "edit"
                ? "bg-action-primary text-action-primary-text border-action-primary"
                : "border-border text-foreground"
            }`}
          >
            Edit Form
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border ${
              viewMode === "preview"
                ? "bg-action-primary text-action-primary-text border-action-primary"
                : "border-border text-foreground"
            }`}
          >
            Preview Document
          </button>
        </div>

        {/* Warnings / Error banner */}
        {errorMessage && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-xs font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-950 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" /> ATS Optimization Tips ({warnings.length}):
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 pl-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Workspace Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === "split"
              ? "grid-cols-1 lg:grid-cols-12"
              : "grid-cols-1"
          }`}
        >
          {/* Editor Column */}
          {(viewMode === "split" || viewMode === "edit") && (
            <div className={`space-y-4 ${viewMode === "split" ? "lg:col-span-5" : "max-w-3xl mx-auto w-full"}`}>
              {/* Category Tabs for easier editing */}
              <div className="flex border-b border-border bg-surface rounded-t-xl overflow-x-auto text-xs font-semibold">
                {[
                  { id: "personal", label: "Contact & Bio" },
                  { id: "experience", label: `Experience (${data.experience.length})` },
                  { id: "education", label: `Education (${data.education.length})` },
                  { id: "projects", label: `Projects (${data.projects.length})` },
                  { id: "skills", label: "Skills & Order" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2.5 whitespace-nowrap transition border-b-2 ${
                      activeTab === tab.id
                        ? "border-accent text-accent font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Personal Info */}
              {activeTab === "personal" && (
                <section className="rounded-b-xl border border-t-0 border-border bg-surface p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="Alex Morgan"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Job Title</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="Software Engineer"
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="alex.morgan@email.com"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="+1 (555) 010-2030"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Location</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="San Francisco, CA"
                        value={data.location}
                        onChange={(e) => setData({ ...data, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Portfolio / Links</label>
                      <input
                        className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                        placeholder="github.com/alex | linkedin.com/in/alex"
                        value={data.links}
                        onChange={(e) => setData({ ...data, links: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Professional Summary</label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-2 text-xs text-foreground leading-relaxed focus:ring-1 focus:ring-action-focus"
                      rows={4}
                      placeholder="Brief overview of your experience, key skills, and impact..."
                      value={data.summary}
                      onChange={(e) => setData({ ...data, summary: e.target.value })}
                    />
                  </div>
                </section>
              )}

              {/* Tab 2: Experience */}
              {activeTab === "experience" && (
                <section className="rounded-b-xl border border-t-0 border-border bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Add work experience in reverse chronological order.</span>
                    <button
                      onClick={() =>
                        setData({
                          ...data,
                          experience: [
                            ...data.experience,
                            { title: "", company: "", start: "", end: "", bullets: [""] },
                          ],
                        })
                      }
                      className="flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-accent hover:bg-surface-raised transition border border-border"
                    >
                      <Plus className="h-3 w-3" /> Add Position
                    </button>
                  </div>

                  {data.experience.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                      No experience added yet. Click &quot;Add Position&quot; to begin.
                    </div>
                  )}

                  {data.experience.map((e, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface-base p-3.5 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {e.title || e.company ? `${e.title || "Role"} at ${e.company || "Company"}` : `Position #${i + 1}`}
                        </span>
                        <button
                          onClick={() =>
                            setData({
                              ...data,
                              experience: data.experience.filter((_, idx) => idx !== i),
                            })
                          }
                          className="flex items-center gap-1 text-[11px] text-destructive hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Job Title (e.g. Senior Software Engineer)"
                          value={e.title}
                          onChange={(ev) => updateExp(i, { title: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Company Name (e.g. Acme Inc)"
                          value={e.company}
                          onChange={(ev) => updateExp(i, { company: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Start Date (e.g. 2021)"
                          value={e.start}
                          onChange={(ev) => updateExp(i, { start: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="End Date (e.g. Present)"
                          value={e.end}
                          onChange={(ev) => updateExp(i, { end: ev.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Key Achievements / Bullets (one per line)
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground leading-relaxed focus:ring-1 focus:ring-action-focus"
                          rows={3}
                          placeholder="• Led project X resulting in Y% growth&#10;• Built and scaled feature Z..."
                          value={e.bullets.join("\n")}
                          onChange={(ev) => updateExp(i, { bullets: ev.target.value.split("\n") })}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Tab 3: Education */}
              {activeTab === "education" && (
                <section className="rounded-b-xl border border-t-0 border-border bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Degrees, colleges, and certifications.</span>
                    <button
                      onClick={() =>
                        setData({
                          ...data,
                          education: [...data.education, { degree: "", school: "", year: "" }],
                        })
                      }
                      className="flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-accent hover:bg-surface-raised transition border border-border"
                    >
                      <Plus className="h-3 w-3" /> Add Degree
                    </button>
                  </div>

                  {data.education.map((e, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface-base p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          {e.degree || e.school ? `${e.degree} - ${e.school}` : `Degree #${i + 1}`}
                        </span>
                        <button
                          onClick={() =>
                            setData({
                              ...data,
                              education: data.education.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-[11px] text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Degree (e.g. B.Sc. Computer Science)"
                          value={e.degree}
                          onChange={(ev) => updateEdu(i, { degree: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="School (e.g. Stanford University)"
                          value={e.school}
                          onChange={(ev) => updateEdu(i, { school: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Graduation Year (e.g. 2020)"
                          value={e.year}
                          onChange={(ev) => updateEdu(i, { year: ev.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Tab 4: Projects */}
              {activeTab === "projects" && (
                <section className="rounded-b-xl border border-t-0 border-border bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Open-source or notable project work.</span>
                    <button
                      onClick={() =>
                        setData({
                          ...data,
                          projects: [...data.projects, { name: "", desc: "", tech: "" }],
                        })
                      }
                      className="flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-accent hover:bg-surface-raised transition border border-border"
                    >
                      <Plus className="h-3 w-3" /> Add Project
                    </button>
                  </div>

                  {data.projects.map((p, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface-base p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          {p.name || `Project #${i + 1}`}
                        </span>
                        <button
                          onClick={() =>
                            setData({
                              ...data,
                              projects: data.projects.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-[11px] text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Project Name (e.g. fastdiff)"
                          value={p.name}
                          onChange={(ev) => updateProj(i, { name: ev.target.value })}
                        />
                        <input
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-action-focus"
                          placeholder="Tech Used (e.g. TypeScript, React)"
                          value={p.tech}
                          onChange={(ev) => updateProj(i, { tech: ev.target.value })}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground leading-relaxed focus:ring-1 focus:ring-action-focus"
                        rows={2}
                        placeholder="Description of the project impact and features..."
                        value={p.desc}
                        onChange={(ev) => updateProj(i, { desc: ev.target.value })}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* Tab 5: Skills & Section Order */}
              {activeTab === "skills" && (
                <section className="rounded-b-xl border border-t-0 border-border bg-surface p-4 space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Technical Skills (comma-separated or categorized)
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-surface-base px-2.5 py-2 text-xs text-foreground leading-relaxed focus:ring-1 focus:ring-action-focus"
                      rows={3}
                      placeholder="Languages: Python, Go; Frontend: React, Tailwind; Backend: Node.js, PostgreSQL..."
                      value={data.skills}
                      onChange={(e) => setData({ ...data, skills: e.target.value })}
                    />
                  </div>

                  <div className="border-t border-border pt-3">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Reorder Sections (move up / down)
                    </label>
                    <div className="space-y-1.5">
                      {sectionOrder.map((sec, i) => (
                        <div
                          key={sec}
                          className="flex items-center justify-between rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs"
                        >
                          <span className="font-medium capitalize text-foreground">{sec}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveSection(i, -1)}
                              disabled={i === 0}
                              className="rounded border border-border p-1 hover:bg-surface-subtle disabled:opacity-30"
                              title="Move section up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveSection(i, 1)}
                              disabled={i === sectionOrder.length - 1}
                              className="rounded border border-border p-1 hover:bg-surface-subtle disabled:opacity-30"
                              title="Move section down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-destructive hover:underline"
                    >
                      Clear All Form Data
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Preview Column (Large, Readable, Zoomable Canvas) */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`space-y-3 ${viewMode === "split" ? "lg:col-span-7" : "w-full"}`}>
              {/* Preview Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">A4 Document Preview</span>
                  <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium border border-border">
                    {template}
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoom((z) => Math.max(50, z - 10))}
                    className="rounded border border-border p-1 hover:bg-surface-subtle text-foreground"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-12 text-center font-mono text-[11px] font-bold text-foreground">
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(160, z + 10))}
                    className="rounded border border-border p-1 hover:bg-surface-subtle text-foreground"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    className="rounded border border-border px-2 py-0.5 text-[10px] hover:bg-surface-subtle text-foreground"
                    title="Reset to 100%"
                  >
                    100%
                  </button>
                  <button
                    onClick={() => setZoom(viewMode === "split" ? 85 : 110)}
                    className="rounded border border-border px-2 py-0.5 text-[10px] hover:bg-surface-subtle text-foreground"
                    title="Fit to comfortable reading width"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Realistic Paper Workbench Area */}
              <div className="rounded-2xl border border-border bg-neutral-200/60 dark:bg-neutral-900/80 p-3 sm:p-6 overflow-x-auto min-h-[750px] flex justify-center items-start shadow-inner">
                {/* Scaled Sheet Wrapper */}
                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                    transition: "transform 0.12s ease-out",
                  }}
                  className="w-full flex justify-center"
                >
                  {/* The A4 Resume Sheet */}
                  <div
                    id="resume-paper"
                    className="w-full max-w-[800px] min-h-[1050px] bg-white text-neutral-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-neutral-300 print:shadow-none print:border-none print:p-0 print:m-0"
                  >
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>100% Private in Browser RAM. Your resume data is never sent to any server.</span>
          </div>
          <span className="hidden sm:inline text-[11px]">LaTeX ATS Standard Compliant</span>
        </div>
      </div>
    </ToolPageLayout>
  );
}
