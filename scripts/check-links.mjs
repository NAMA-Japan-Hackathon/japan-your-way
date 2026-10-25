import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

// Basic HTML parser for attributes without heavy dependencies
function extractTagsWithAttributes(html) {
  const tags = [];
  // Match tags like <a ...>, <img ...>, <script ...>, <link ...>, <video ...>, <source ...>
  const tagRegex = /<([a-zA-Z0-9-]+)\s+([^>]*?)>/gis;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrString = match[2];
    const attrs = {};
    const attrRegex = /([a-zA-Z0-9-_:]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const name = attrMatch[1].toLowerCase();
      const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
      attrs[name] = value;
    }
    tags.push({ tagName, attrs, index: match.index });
  }
  return tags;
}

function extractIds(html) {
  const ids = new Set();
  const idRegex = /\b(?:id|name)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

export function checkLinks({ verbose = false } = {}) {
  if (!fs.existsSync(outDir)) {
    console.error(`Build output directory not found at ${outDir}. Run export first.`);
    return { ok: false, errors: [`out/ directory missing at ${outDir}`] };
  }

  // 1. Discover all HTML pages in out/
  const htmlFiles = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(fullPath);
      }
    }
  }
  scan(outDir);

  // Cache parsed pages and their IDs
  const pageMap = new Map(); // relRoute -> { file, ids, html }
  for (const file of htmlFiles) {
    const rel = path.relative(outDir, file);
    let route = "/" + rel.replace(/\\/g, "/");
    if (route.endsWith("/index.html")) {
      route = route.slice(0, -"/index.html".length) + "/";
    }
    const html = fs.readFileSync(file, "utf8");
    const ids = extractIds(html);
    pageMap.set(route, { file, rel, ids, html });
  }

  const errors = [];
  const warnings = [];
  let totalChecked = 0;
  let internalLinks = 0;
  let assetChecks = 0;
  let externalLinks = 0;

  for (const [sourceRoute, page] of pageMap.entries()) {
    const tags = extractTagsWithAttributes(page.html);

    for (const { tagName, attrs } of tags) {
      const href = attrs.href;
      const src = attrs.src;
      const srcset = attrs.srcset;
      const poster = attrs.poster;

      const checkUrl = (urlStr, type) => {
        if (!urlStr || urlStr.startsWith("data:") || urlStr.startsWith("javascript:") || urlStr.startsWith("mailto:") || urlStr.startsWith("tel:")) {
          return;
        }

        totalChecked++;

        // External URL
        if (/^https?:\/\//i.test(urlStr)) {
          externalLinks++;
          try {
            new URL(urlStr);
          } catch {
            errors.push(`${page.rel}: Invalid external URL "${urlStr}"`);
          }
          return;
        }

        // Internal Asset or Page link
        if (type === "asset" || tagName === "img" || tagName === "script" || (tagName === "link" && attrs.rel !== "canonical") || tagName === "video" || tagName === "source") {
          assetChecks++;
          const cleanUrl = urlStr.split("?")[0].split("#")[0];
          const assetPath = path.join(outDir, cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl);
          if (!fs.existsSync(assetPath)) {
            // Check if it's an optional personal-use image that is legitimately omitted
            if (cleanUrl.startsWith("/images/personal-use/")) {
              warnings.push(`${page.rel}: Optional personal image not present: "${cleanUrl}"`);
            } else {
              errors.push(`${page.rel}: Missing asset "${cleanUrl}" (${tagName})`);
            }
          }
          return;
        }

        // Anchor or Internal Page link
        internalLinks++;
        let [withoutHash, hash] = urlStr.split("#");
        let [targetPath, query] = withoutHash.split("?");

        let resolvedRoute = targetPath;
        if (!targetPath) {
          // Same page hash, e.g. href="#faq"
          resolvedRoute = sourceRoute;
        } else if (targetPath.startsWith("/")) {
          resolvedRoute = targetPath;
        } else {
          // Relative to current route
          resolvedRoute = path.posix.join(sourceRoute, targetPath);
        }

        // Normalize trailing slash for directory routes
        if (!resolvedRoute.endsWith("/") && !path.extname(resolvedRoute)) {
          resolvedRoute += "/";
        }

        const targetPage = pageMap.get(resolvedRoute) || pageMap.get(resolvedRoute.replace(/\/$/, ""));
        if (!targetPage) {
          // Check if direct file exists (like /404.html or a PDF download)
          const directFile = path.join(outDir, resolvedRoute.startsWith("/") ? resolvedRoute.slice(1) : resolvedRoute);
          if (!fs.existsSync(directFile)) {
            errors.push(`${page.rel}: Broken link to "${urlStr}" (target route "${resolvedRoute}" not found)`);
            return;
          }
        }

        if (hash) {
          const targetIds = targetPage ? targetPage.ids : extractIds(fs.readFileSync(path.join(outDir, resolvedRoute.startsWith("/") ? resolvedRoute.slice(1) : resolvedRoute), "utf8"));
          if (!targetIds.has(hash)) {
            errors.push(`${page.rel}: Broken anchor link "${urlStr}" (anchor "#${hash}" not found in "${resolvedRoute}")`);
          }
        }
      };

      if (href) checkUrl(href, "link");
      if (src) checkUrl(src, "asset");
      if (poster) checkUrl(poster, "asset");
      if (srcset) {
        const candidates = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
        for (const candidate of candidates) {
          if (candidate) checkUrl(candidate, "asset");
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    totalPages: htmlFiles.length,
    totalChecked,
    internalLinks,
    assetChecks,
    externalLinks,
    errors,
    warnings,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkLinks({ verbose: process.argv.includes("--verbose") });
  console.log(`\nLink and Asset Check Report:`);
  console.log(`- Crawled: ${result.totalPages} HTML pages in out/`);
  console.log(`- Checked: ${result.totalChecked} items (${result.internalLinks} links, ${result.assetChecks} assets, ${result.externalLinks} external)`);
  
  if (result.warnings.length) {
    console.log(`\nWarnings (${result.warnings.length}):`);
    result.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  if (result.errors.length) {
    console.error(`\nErrors found (${result.errors.length}):`);
    result.errors.forEach((e) => console.error(`  ✖ ${e}`));
    process.exit(1);
  } else {
    console.log(`\n✔ All links, assets, scripts, and anchor targets are valid!`);
  }
}
