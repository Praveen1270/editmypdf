#!/usr/bin/env node
// scripts/seo-audit.mjs
// Lightweight SEO audit: fetches sitemap + internal links, checks metadata, canonicals, H1, word count, JSON-LD.
// Usage: node scripts/seo-audit.mjs [baseUrl]
// Default baseUrl: http://localhost:3000

const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(html, name) {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function getMeta(html, name) {
  const re = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  let m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i");
  m = html.match(re2);
  return m ? m[1] : null;
}

function getCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  if (m) return m[1];
  const m2 = html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  return m2 ? m2[1] : null;
}

function getJsonLdTypes(html) {
  const types = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      const t = obj["@type"] || (Array.isArray(obj) ? obj.map((x) => x["@type"]).join(",") : null);
      if (t) types.push(t);
    } catch {
      types.push("(invalid JSON)");
    }
  }
  return types;
}

async function fetchRaw(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const location = res.headers.get("location");
    let body = "";
    if (status >= 200 && status < 400 && !location) {
      body = await res.text();
    }
    return { status, location, body };
  } catch (e) {
    return { status: 0, location: null, body: "", error: e.message };
  }
}

async function getSitemapUrls() {
  const { status, body } = await fetchRaw(`${baseUrl}/sitemap.xml`);
  if (status !== 200) {
    console.error(`sitemap.xml returned ${status}`);
    return [];
  }
  const urls = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(body)) !== null) urls.push(m[1].trim());
  return urls;
}

async function getInternalLinks() {
  const { body } = await fetchRaw(baseUrl + "/");
  const links = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    let href = m[1];
    if (href.startsWith("/")) links.add(baseUrl + href.split("?")[0].split("#")[0]);
    else if (href.startsWith(baseUrl)) links.add(href.split("?")[0].split("#")[0]);
  }
  // also from footer/header by re-fetching (already in homepage body)
  return [...links];
}

function resolveUrl(u) {
  if (u.startsWith("http")) return u;
  return baseUrl + (u.startsWith("/") ? u : "/" + u);
}

async function auditUrl(url) {
  const { status, location, body } = await fetchRaw(url);
  const flags = [];
  let title = null, desc = null, canonical = null, robots = null, h1s = [], wordCount = 0, jsonLd = [];
  if (status === 200 && body) {
    title = getTag(body, "title");
    desc = getMeta(body, "description");
    canonical = getCanonical(body);
    robots = getMeta(body, "robots");
    const h1re = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    let hm;
    while ((hm = h1re.exec(body)) !== null) h1s.push(stripTags(hm[1]));
    const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const content = mainMatch ? mainMatch[1] : body;
    wordCount = stripTags(content).split(/\s+/).filter(Boolean).length;
    jsonLd = getJsonLdTypes(body);
  }

  const ownPath = url.replace(baseUrl, "") || "/";
  const ownCanonical = baseUrl + ownPath;

  // Flags
  if (status !== 200) flags.push({ level: "error", msg: `status ${status}${location ? " -> " + location : ""}` });
  if (location) flags.push({ level: "error", msg: `redirects to ${location}` });
  if (status === 200) {
    if (!title) flags.push({ level: "error", msg: "missing title" });
    else {
      if (title.length > 60) flags.push({ level: "warn", msg: `title too long (${title.length})` });
      if (title.length < 25) flags.push({ level: "warn", msg: `title too short (${title.length})` });
    }
    if (!desc) flags.push({ level: "warn", msg: "missing meta description" });
    else {
      if (desc.length > 155) flags.push({ level: "warn", msg: `description too long (${desc.length})` });
      if (desc.length < 70) flags.push({ level: "warn", msg: `description too short (${desc.length})` });
    }
    if (!canonical) flags.push({ level: "error", msg: "missing canonical" });
    else {
      const norm = (u) => (u || "").replace(/\/+$/, "");
    if (norm(canonical) !== norm(ownCanonical) && norm(canonical) !== norm(url)) flags.push({ level: "error", msg: `canonical != self (${canonical})` });
      if (canonical === baseUrl || canonical === baseUrl + "/") {
        if (ownPath !== "/" && ownPath !== "") flags.push({ level: "error", msg: "canonical points to homepage" });
      }
    }
    if (h1s.length === 0) flags.push({ level: "error", msg: "no H1" });
    if (h1s.length > 1) flags.push({ level: "warn", msg: `${h1s.length} H1s` });
    if (wordCount < 300) flags.push({ level: "warn", msg: `thin content (${wordCount} words)` });
    if (jsonLd.length === 0) flags.push({ level: "info", msg: "no JSON-LD" });
  }

  return { url, status, location, title, desc, canonical, robots, h1s, wordCount, jsonLd, flags };
}

async function main() {
  console.log(`Auditing ${baseUrl}\n`);
  const sitemapUrls = await getSitemapUrls();
  const internalLinks = await getInternalLinks();
  const allUrls = new Set([...sitemapUrls, ...internalLinks]);
  console.log(`Sitemap URLs: ${sitemapUrls.length}, internal links: ${internalLinks.length}, unique: ${allUrls.size}\n`);

  const results = [];
  for (const url of allUrls) {
    const r = await auditUrl(url);
    results.push(r);
  }

  // Duplicate checks
  const titleMap = {};
  const descMap = {};
  for (const r of results) {
    if (r.title) { (titleMap[r.title] = titleMap[r.title] || []).push(r.url); }
    if (r.desc) { (descMap[r.desc] = descMap[r.desc] || []).push(r.url); }
  }

  // Print table
  console.log("URL".padEnd(60) + "STATUS  WORDS  H1  FLAGS");
  console.log("-".repeat(120));
  let errors = 0, warns = 0;
  for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
    const flagStr = r.flags.map((f) => `[${f.level}] ${f.msg}`).join("; ");
    if (r.flags.some((f) => f.level === "error")) errors++;
    if (r.flags.some((f) => f.level === "warn")) warns++;
    console.log(
      r.url.padEnd(60) +
        String(r.status).padEnd(8) +
        String(r.wordCount).padEnd(7) +
        String(r.h1s.length).padEnd(4) +
        (flagStr || "ok")
    );
  }

  // Duplicates
  console.log("\n=== DUPLICATE TITLES ===");
  for (const [t, urls] of Object.entries(titleMap)) {
    if (urls.length > 1) { console.log(`"${t}" -> ${urls.join(", ")}`); errors++; }
  }
  console.log("\n=== DUPLICATE META DESCRIPTIONS ===");
  for (const [d, urls] of Object.entries(descMap)) {
    if (urls.length > 1) { console.log(`"${d}" -> ${urls.join(", ")}`); errors++; }
  }

  // Sitemap self-canonical check
  console.log("\n=== SITEMAP SELF-CANONICAL CHECK ===");
  for (const u of sitemapUrls) {
    const r = results.find((x) => x.url === u);
    if (r && r.canonical && r.canonical !== u) console.log(`NOT self-canonical: ${u} -> ${r.canonical}`);
  }

  console.log(`\nSummary: ${results.length} URLs, ${errors} errors, ${warns} warnings.`);
  if (errors > 0) {
    console.error("FAIL: error-level flags present.");
    process.exit(1);
  } else {
    console.log("PASS: no error-level flags.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
