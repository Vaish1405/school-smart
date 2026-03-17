import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..", "..");
export const recordsDir = path.join(repoRoot, "records");

export function recordsPath(filename) {
  return path.join(recordsDir, filename);
}

export async function readJsonArray(filename) {
  const p = recordsPath(filename);
  try {
    const raw = await fs.readFile(p, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e && e.code === "ENOENT") return [];
    throw e;
  }
}

export async function writeJsonArray(filename, arr) {
  const p = recordsPath(filename);
  const tmp = `${p}.tmp`;
  const json = JSON.stringify(arr, null, 2) + "\n";
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, p);
}

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

