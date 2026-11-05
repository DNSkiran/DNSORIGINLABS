import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) errors.push(message);
}
function parseJSON(file) {
  try { return JSON.parse(read(file)); }
  catch (error) { errors.push(`${file}: invalid JSON — ${error.message}`); return null; }
}
function uniqueIds(file, records) {
  const ids = new Set();
  for (const record of records || []) {
    assert(record.id && typeof record.id === "string", `${file}: every item needs a string id`);
    assert(!ids.has(record.id), `${file}: duplicate id "${record.id}"`);
    ids.add(record.id);
  }
}

const tools = parseJSON("data/tools.json");
const projects = parseJSON("data/projects.json");
const tutorials = parseJSON("data/tutorials.json");
const site = parseJSON("data/site.json");
if (tools) {
  uniqueIds("data/tools.json", tools.items);
  for (const item of tools.items || []) {
    assert(item.name && item.category, `tool ${item.id}: name and category are required`);
    if (item.docs) {
      const docPath = path.resolve(root, "pages", item.docs);
      assert(docPath.startsWith(root) && fs.existsSync(docPath), `tool ${item.id}: documentation path does not exist: ${item.docs}`);
    }
  }
}
if (projects) uniqueIds("data/projects.json", projects.items);
if (tutorials) uniqueIds("data/tutorials.json", tutorials.items);
assert(site && site.brand && site.tagline, "data/site.json: brand and tagline are required");

const required = [
  "index.html","styles.css","src/main.js","src/page.js","src/downloads.js",
  "pages/inner.css","pages/interior.js","pages/work.html","pages/tools.html",
  "pages/pipeline.html","pages/learn.html","pages/about.html","pages/contact.html",
  "pages/tool.html","pages/project.html","pages/tutorial.html",
  "docs/index.html","docs/ocio-encoder.html","docs/python-pipeline.html",
  "docs/nuke-workflow.html","admin/index.html","admin/admin.js","admin/admin.css",
  "assets/favicon.svg","assets/brand-mark.svg","assets/og-cover.svg",
  "404.html","robots.txt","sitemap.xml"
];
for (const file of required) assert(exists(file), `required file is missing: ${file}`);

for (const file of ["src/main.js","src/page.js","src/downloads.js","pages/interior.js","admin/admin.js"]) {
  const source = read(file);
  assert(source.length > 100, `${file}: file unexpectedly short`);
}
const home = read("index.html");
assert(home.includes("./src/main.js"), "index.html must load src/main.js");
assert(home.includes("./styles.css"), "index.html must load styles.css");
assert(home.includes("./manifest.webmanifest"), "index.html must load web manifest");

if (errors.length) {
  console.error("DNS ORIGIN LABS validation failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log("DNS ORIGIN LABS checks passed.");
console.log(`Validated ${tools?.items?.length ?? 0} tools, ${projects?.items?.length ?? 0} projects and ${tutorials?.items?.length ?? 0} tutorials.`);
