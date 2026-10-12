// Build-time secret injection — no dependencies, plain node.
// Reads SUPABASE_URL / SUPABASE_ANON_KEY from the environment
// (Cloudflare Pages dashboard vars, or a local gitignored .env file)
// and generates ./config.js from config.template.js.
//
//   Local:      cp .env.example .env   # then fill in real values
//               node inject-env.mjs
//   Cloudflare: build command = "node inject-env.mjs",
//               output directory = "/", plus the two env vars set
//               under Project → Settings → Environment variables.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    // A real environment variable always wins over .env.
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(".env");

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.error("inject-env: missing SUPABASE_URL and/or SUPABASE_ANON_KEY.");
  console.error("inject-env: fill them into .env (local) or Pages env vars (Cloudflare).");
  process.exit(1);
}

const template = readFileSync("config.template.js", "utf8");
writeFileSync(
  "config.js",
  template.replace("__SUPABASE_URL__", url).replace("__SUPABASE_ANON_KEY__", key)
);
console.log("inject-env: config.js written.");
