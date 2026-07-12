import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";

const DIST_DIR = "dist";

function resolveImportPath(importPath, fromFile) {
  const dir = dirname(fromFile);

  const swapped = importPath.replace(/\.(ts|tsx|mts|cts)$/i, ".js");
  if (swapped !== importPath) {
    const full = join(dir, swapped);
    if (existsSync(full)) return swapped;
  }

  if (/\.(js|json|mjs|cjs)$/i.test(importPath)) return null;

  const asFile = join(dir, importPath + ".js");
  if (existsSync(asFile)) return importPath + ".js";

  const asDir = join(dir, importPath, "index.js");
  if (existsSync(asDir)) return importPath + "/index.js";

  return importPath + ".js";
}

function processFile(filePath) {
  const content = readFileSync(filePath, "utf8");

  const fixed = content.replace(
    /((?:from\s+|import\s*\(\s*|import\s+|export\s+\*\s+from\s+)(["']))(\.\.?\/[^"']+?)\2/g,
    (match, prefix, quote, path) => {
      const resolved = resolveImportPath(path, filePath);
      if (resolved === null) return match;
      return prefix.slice(0, -1) + quote + resolved + quote;
    },
  );

  if (fixed !== content) {
    writeFileSync(filePath, fixed);
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (extname(full) === ".js") {
      processFile(full);
    }
  }
}

walk(DIST_DIR);
console.log("Fixed ESM extensions in", DIST_DIR);
