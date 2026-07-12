# Vercel Deployment Guide: TypeScript + Path Aliases + Express

> A complete reference for deploying a TypeScript Express app to Vercel
> using `@/` path aliases without `.js` extensions.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Why It Fails (Root Causes)](#why-it-fails-root-causes)
3. [The Solution](#the-solution)
4. [Config Files Breakdown](#config-files-breakdown)
5. [How the Build Pipeline Works](#how-the-build-pipeline-works)
6. [Local Development & Testing](#local-development--testing)
7. [Deploying to Vercel](#deploying-to-vercel)
8. [Debugging Failed Deployments](#debugging-failed-deployments)
9. [Quick Reference Checklist](#quick-reference-checklist)

---

## The Problem

You have a TypeScript Express project that uses:

```typescript
// This works locally with tsx/ts-node but FAILS on Vercel
import { catchAsync } from "@/core/utils/catch-async";
import { router } from "@/routes/index";
```

Vercel throws:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/routes'
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/routes/index'
```

---

## Why It Fails (Root Causes)

There are **three separate issues** that compound on Vercel:

### Issue 1: `@/` Path Aliases Are TypeScript-Only

The `paths` mapping in `tsconfig.json` is **only for type resolution**.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**TypeScript's emitted JavaScript does NOT resolve `@/` to relative paths.**
The output JS still contains `require("@/routes/index")` or `import ... from "@/routes/index"`.

Node.js runtime sees `@/routes` and tries to find it as an npm package → fails with `ERR_MODULE_NOT_FOUND`.

### Issue 2: ESM Requires `.js` Extensions

If your `package.json` has `"type": "module"`, Node.js uses ESM. ESM **strictly requires** file extensions on all relative imports:

```typescript
// WRONG in ESM — missing .js extension
import { router } from "./routes/index";
// CORRECT in ESM
import { router } from "./routes/index.js";
```

Without `.js`, Node.js tries to resolve `./routes/index` (exact match, no extension) → fails.

### Issue 3: `moduleResolution: "bundler"` Is Not Runtime-Safe

When tsconfig uses `"moduleResolution": "bundler"`, TypeScript is lenient about missing extensions.
But at runtime on Vercel's Node.js, the extensions ARE required.

### Summary Table

| Feature                | TypeScript (dev)         | Vercel Runtime                         |
| ---------------------- | ------------------------ | -------------------------------------- |
| `@/` aliases           | Resolved via `paths`     | NOT resolved — treated as package name |
| Missing `.js` ext      | Allowed with `"bundler"` | ESM: fails. CJS: works.                |
| `"module": "ESNext"`   | Works (type-checking)    | Needs `.js` extensions at runtime      |
| `"module": "CommonJS"` | Works                    | Works without `.js` extensions         |

---

## The Solution

Use a **two-step build pipeline** that compiles and post-processes:

```
src/*.ts  →  [tsc]  →  dist/*.js (still has @/ paths)  →  [tsc-alias]  →  dist/*.js (paths resolved)
```

Key decisions:

- **CommonJS output** — no `.js` extension needed on imports
- **`tsc-alias`** — resolves `@/` to relative paths in the compiled output
- **Pre-built on Vercel** — Vercel runs the already-compiled JS, no TS compilation at runtime

---

## Config Files Breakdown

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", ".vercel", "dist"]
}
```

**Why each setting matters:**

| Setting                        | Value        | Why                                                                                         |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------- |
| `module`                       | `"CommonJS"` | CJS doesn't require `.js` extensions. ESM does. This avoids the extension problem entirely. |
| `moduleResolution`             | `"node"`     | Standard Node.js resolution. Works with CJS.                                                |
| `noEmit`                       | `false`      | Must be `false` to actually output files. (`true` = type-check only, no output)             |
| `outDir`                       | `"./dist"`   | Compiled JS goes here. Vercel runs from here.                                               |
| `rootDir`                      | `"./src"`    | Keeps the `dist/` folder structure clean (no nested `dist/src/`).                           |
| `esModuleInterop`              | `true`       | Allows `import express from "express"` syntax with CJS modules.                             |
| `allowSyntheticDefaultImports` | `true`       | Companion to `esModuleInterop`. Fixes type errors with default imports.                     |
| `paths`                        | `"@/*"`      | Your source aliases. `tsc-alias` will resolve these in the output.                          |
| `include`                      | `["src"]`    | Only compile files in `src/`.                                                               |

### `package.json`

```json
{
  "name": "express",
  "scripts": {
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cheerio": "^1.2.0",
    "express": "5.1.0"
  },
  "devDependencies": {
    "@types/node": "20.11.17",
    "@types/express": "5.0.0",
    "tsc-alias": "^1.8.10",
    "typescript": "5.8.3"
  }
}
```

**Critical points:**

- **NO `"type": "module"`** — This forces CJS mode. If present, Node.js expects ESM and requires `.js` extensions.
- **`"build": "tsc && tsc-alias"`** — Two-step pipeline. `tsc` first, then `tsc-alias` fixes paths.
- **`tsc-alias`** in devDependencies — Post-processes compiled JS to replace `@/` with relative paths.
- **`"start": "node dist/index.js"`** — Run the compiled output locally to test.

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

**What each field does:**

| Field            | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `buildCommand`   | Vercel runs this during build. Runs `tsc && tsc-alias` to produce `dist/`.          |
| `installCommand` | How to install deps. Explicit to avoid Vercel auto-detecting wrong package manager. |
| `builds[0].src`  | Entry point for the serverless function. Points to compiled output.                 |
| `builds[0].use`  | Runtime. `@vercel/node` = Node.js serverless function.                              |
| `routes[0].src`  | Regex matching ALL incoming requests (`/(.*)`).                                     |
| `routes[0].dest` | Forward all requests to the Express app.                                            |

**Without `routes`**, only the exact entry path would work. With `routes`, all paths
go through your Express router (which handles `/desco`, `/nesco`, `/universal`, etc.).

### `.gitignore`

```
dist
```

The `dist/` folder is a build artifact. Never commit it. Vercel builds it fresh every deploy.

---

## How the Build Pipeline Works

### Step 1: `tsc` (TypeScript Compiler)

```
src/index.ts  →  dist/index.js
src/routes/index.ts  →  dist/routes/index.js
src/core/utils/response.ts  →  dist/core/utils/response.js
```

TypeScript compiles `.ts` → `.js` and converts ES module syntax to `require()`/`module.exports`.
But it does NOT resolve `@/` paths — the output still has `require("@/routes/index")`.

### Step 2: `tsc-alias`

Scans all `.js` files in `dist/` and replaces every `@/` with the correct relative path:

```
BEFORE: require("@/routes/index")
AFTER:  require("./routes/index")

BEFORE: require("@/core/utils/catch-async")
AFTER:  require("./core/utils/catch-async")

BEFORE: require("@/features/desco/desco.service")
AFTER:  require("./features/desco/desco.service")
```

`tsc-alias` reads your `tsconfig.json` `paths` config to know what `@/` maps to.

### Step 3: Vercel Deploy

Vercel runs `npm run build`, then serves `dist/index.js` as a serverless function.
The compiled JS has all paths resolved as relative `require()` calls — Node.js resolves them natively.

---

## Local Development & Testing

### 1. Install dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

Expected: no errors. `dist/` folder created with compiled JS files.

### 3. Verify paths are resolved

```bash
# Check that NO @/ paths remain in the output
grep -r "@/" dist/
```

If this returns results, `tsc-alias` didn't run or didn't find the files. Check that
`dist/` exists and `tsc-alias` is installed.

### 4. Test locally

```bash
npm start
# OR
node dist/index.js
```

Open `http://localhost:3000` (or whatever port Express uses) and test your routes.

### 5. Full local test script

```bash
npm run build && npm start
```

---

## Deploying to Vercel

### First deploy

```bash
vercel --prod
```

### Verify deployment

```bash
# Check a route that returns data
curl https://your-app.vercel.app/universal/desco/37247672/info
```

Expected response:

```json
{
  "success": true,
  "message": "Customer info fetched",
  "data": { ... }
}
```

### Check deployment logs

```bash
# Get the inspect URL from the deploy output, open it in browser
vercel inspect --logs
```

---

## Debugging Failed Deployments

### Error: `Cannot find package '@/routes'`

**Cause:** `@/` paths not resolved in the compiled output.

**Fix:**

1. Run `npm run build` locally
2. Check `grep -r "@/" dist/` — should return nothing
3. If it does return results, `tsc-alias` isn't running. Check `package.json` build script.

### Error: `Cannot find module './routes/index'`

**Cause:** ESM mode requiring `.js` extensions.

**Fix:** Make sure `package.json` does NOT have `"type": "module"`.
If it does, remove it. CJS doesn't need `.js` extensions.

### Error: `Cannot find module '../constants'` or similar

**Cause:** Importing a directory (`../constants`) that has an `index.ts` file.
With CJS + `moduleResolution: "node"`, this should resolve automatically.
With ESM, you'd need `../constants/index.js`.

**Fix:** If using CJS (this setup), this shouldn't happen.
If it does, the file might be at a different path. Check the actual file location.

### Error: `TS1259: Module can only be default-imported using 'esModuleInterop'`

**Cause:** CJS module being imported with `import x from "module"` syntax.

**Fix:** Add `"esModuleInterop": true` and `"allowSyntheticDefaultImports": true` to tsconfig.

### Build succeeds locally but fails on Vercel

**Checklist:**

1. Is `package.json` committed? (Vercel reads it to install deps)
2. Is `vercel.json` committed?
3. Does `npm run build` produce `dist/index.js` locally?
4. Is `dist/` in `.gitignore`? (It should be — Vercel builds its own)
5. Did Vercel use the right package manager? (Check install logs)

### Vercel ignores my buildCommand

**Cause:** The `builds` config in `vercel.json` can override project settings.

**Fix:** The `buildCommand` in `vercel.json` should still work. But if Vercel is
compiling TS directly (not using your build), check that the `builds` config
points to `dist/index.js` (not `src/index.ts`).

---

## Quick Reference Checklist

### Before deploying, verify:

```
[ ] package.json has NO "type": "module"
[ ] package.json has "build": "tsc && tsc-alias"
[ ] package.json has "tsc-alias" in devDependencies
[ ] tsconfig.json has "module": "CommonJS"
[ ] tsconfig.json has "noEmit": false
[ ] tsconfig.json has "outDir": "./dist"
[ ] tsconfig.json has "esModuleInterop": true
[ ] tsconfig.json has "paths": { "@/*": ["./src/*"] }
[ ] vercel.json has "buildCommand": "npm run build"
[ ] vercel.json has builds pointing to "dist/index.js"
[ ] vercel.json has routes forwarding to "dist/index.js"
[ ] .gitignore includes "dist"
[ ] npm run build succeeds locally
[ ] grep -r "@/" dist/ returns NOTHING
[ ] node dist/index.js runs without errors locally
```

### Project structure after setup:

```
project/
  api/                    # (empty, not used)
  src/                    # TypeScript source (with @/ imports)
    index.ts
    routes/
    features/
    core/
    types/
  dist/                   # Compiled output (auto-generated, gitignored)
    index.js              # CJS with resolved relative paths
    routes/
    features/
    core/
    types/
  node_modules/
  package.json            # NO "type": "module", has build script
  tsconfig.json           # CommonJS, noEmit: false, outDir: dist
  vercel.json             # Builds config + routes
  .gitignore              # Includes dist
```

---

## How to Reproduce This Setup in a New Project

```bash
# 1. Init project
mkdir my-express-app && cd my-express-app
npm init -y

# 2. Install dependencies
npm install express
npm install -D typescript @types/express @types/node tsc-alias

# 3. Create tsconfig.json with the settings above
# (Use the tsconfig.json from this project as template)

# 4. Add build script to package.json
# "scripts": { "build": "tsc && tsc-alias", "start": "node dist/index.js" }
# Make sure NO "type": "module" exists

# 5. Create vercel.json
# (Use the vercel.json from this project as template)

# 6. Create src/index.ts with @/ imports
# import express from "express";
# import { router } from "@/routes/index";
# export default express().use(router);

# 7. Build and test locally
npm run build
node dist/index.js

# 8. Deploy
vercel --prod
```
