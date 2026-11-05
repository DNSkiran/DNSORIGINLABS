import { loadJSON, initNavigation, initReveals } from "./page.js";
import { initDownloads } from "./downloads.js";

const toolGrid = document.querySelector("#tool-grid");
const [toolsData, siteData] = await Promise.all([
  loadJSON("./data/tools.json", { items: [] }),
  loadJSON("./data/site.json", {})
]);
const tools = toolsData.items || [];
if (siteData.seo) {
  document.title = siteData.seo.title || document.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && siteData.seo.description) description.content = siteData.seo.description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = siteData.seo.title || document.title;
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.content = siteData.seo.description || "";
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && siteData.seo.image) ogImage.content = new URL(siteData.seo.image, location.href).href;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical); }
  if (siteData.seo.url) canonical.href = siteData.seo.url;
}

function cardFor(tool) {
  const card = document.createElement("article");
  card.className = "tool-card reveal";
  card.innerHTML = `
    <div class="tool-top"><span class="tool-icon"></span><span class="tool-tag"></span></div>
    <h3></h3><p></p>
    <div class="tool-bottom"><span></span><a class="tool-details">DETAILS ↗</a><button type="button" class="tool-download" data-download-tool="">Checking release</button></div>`;
  card.querySelector(".tool-icon").textContent = (tool.name || "DO").slice(0,2).toUpperCase();
  card.querySelector(".tool-tag").textContent = (tool.category || "TOOL").toUpperCase();
  card.querySelector("h3").textContent = tool.name;
  card.querySelector("p").textContent = tool.description;
  card.querySelector(".tool-bottom span").textContent = (tool.status || "In development").toUpperCase();
  card.querySelector(".tool-details").href = `./pages/tool.html?id=${encodeURIComponent(tool.id)}`;
  card.querySelector(".tool-download").dataset.downloadTool = tool.id;
  return card;
}

function renderTools(filter = "all") {
  if (!toolGrid) return;
  const groups = {
    all: () => true,
    color: tool => /color|ocio/i.test(tool.category || ""),
    pipeline: tool => /pipeline|automation|file management/i.test(tool.category || ""),
    compositing: tool => /nuke|compositing/i.test(tool.category || "")
  };
  const predicate = groups[filter] || groups.all;
  toolGrid.replaceChildren(...tools.filter(predicate).slice(0,6).map(cardFor));
  initReveals(toolGrid);
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    renderTools(button.dataset.filter || "all");
  });
});

initNavigation();
renderTools();
await initDownloads(tools);
initReveals();
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
