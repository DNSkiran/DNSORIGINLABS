import { loadJSON, initNavigation, initReveals, setYear, escapeHTML } from "../src/page.js";
import { initDownloads } from "../src/downloads.js";

const page = document.body.dataset.page;
const [toolData, projectData, tutorialData] = await Promise.all([
  loadJSON("../data/tools.json", { items: [] }),
  loadJSON("../data/projects.json", { items: [] }),
  loadJSON("../data/tutorials.json", { items: [] })
]);
const tools = toolData.items || [];
const projects = projectData.items || [];
const tutorials = tutorialData.items || [];

function renderProjects() {
  const target = document.querySelector("#project-grid");
  if (!target) return;
  const visible = projects.filter(item => item.status === "published");
  const empty = document.querySelector("#project-empty");
  const count = document.querySelector("#work-count");
  if (count) count.textContent = `${visible.length} PUBLISHED PROJECTS`;
  if (!visible.length) { empty.hidden = false; return; }
  target.innerHTML = visible.map((item,index) => `
    <article class="project-card reveal">
      <a href="./project.html?id=${encodeURIComponent(item.id)}">
        <div class="project-picture">${item.image ? `<img src="${escapeHTML(item.image)}" alt="">` : ""}<span>PROJECT / ${String(index+1).padStart(2,"0")}</span></div>
        <div class="project-copy"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary || "")}</p><div class="project-meta">${escapeHTML(item.discipline || "CREATIVE WORK")} / ${escapeHTML(item.year || "PROJECT")}</div></div>
      </a>
    </article>`).join("");
  initReveals(target);
}

function renderCatalog() {
  const target = document.querySelector("#catalog-grid");
  if (!target) return;
  const categories = ["All", ...new Set(tools.map(item => item.category).filter(Boolean))];
  const pills = document.querySelector("#tool-categories");
  const search = document.querySelector("#tool-search");
  let active = "All";
  let query = "";
  function draw() {
    const visible = tools.filter(tool => (active === "All" || tool.category === active) &&
      [tool.name,tool.category,tool.description,(tool.tags||[]).join(" ")].join(" ").toLowerCase().includes(query));
    target.replaceChildren(...visible.map(tool => {
      const article = document.createElement("article");
      article.className = "catalog-card reveal";
      const tags = (tool.tags || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
      article.innerHTML = `
        <div class="catalog-header"><span class="catalog-code"></span><span class="catalog-category"></span></div>
        <h3></h3><p></p><div class="catalog-tags">${tags}</div>
        <div class="catalog-status"></div>
        <div class="catalog-actions"><a class="detail-link">Details ↗</a><button type="button" data-download-tool="">Release not published</button></div>`;
      article.querySelector(".catalog-code").textContent = (tool.name || "DO").slice(0,2).toUpperCase();
      article.querySelector(".catalog-category").textContent = (tool.category || "").toUpperCase();
      article.querySelector("h3").textContent = tool.name;
      article.querySelector("p").textContent = tool.description;
      article.querySelector(".catalog-status").textContent = (tool.status || "In development").toUpperCase();
      article.querySelector(".detail-link").href = `./tool.html?id=${encodeURIComponent(tool.id)}`;
      article.querySelector("[data-download-tool]").dataset.downloadTool = tool.id;
      return article;
    }));
    initReveals(target);
  }
  pills.innerHTML = categories.map(category => `<button type="button" class="${category===active?"active":""}" data-category="${category}">${category}</button>`).join("");
  pills.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    active = button.dataset.category;
    pills.querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));
    draw();
  }));
  search?.addEventListener("input",()=>{query=search.value.trim().toLowerCase();draw();});
  draw();
  initDownloads(tools);
}

function renderTutorials() {
  const target = document.querySelector("#learn-list");
  if (!target) return;
  const visible = tutorials;
  const count = document.querySelector("#tutorial-count");
  if (count) count.textContent = `${visible.length} LEARNING TRACKS IN PREPARATION`;
  target.innerHTML = visible.map((item,index)=>`
    <article class="learn-row reveal"><div class="learn-badge">${["OCIO","PY","NK"][index%3]}</div>
      <div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary || "")}</p><small>${escapeHTML(item.level || "ALL LEVELS")} / ${escapeHTML((item.status || "draft").toUpperCase())}</small></div>
      <a href="./tutorial.html?id=${encodeURIComponent(item.id)}">Explore ↗</a>
    </article>`).join("");
  initReveals(target);
}

async function renderDetail(kind) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const collection = kind === "tool" ? tools : kind === "project" ? projects : tutorials;
  const item = collection.find(entry=>entry.id===id);
  const target = document.querySelector("#detail");
  if (!target) return;
  if (!item) { target.innerHTML = '<h1>Entry not found</h1><p>It may have been moved or not published yet.</p>'; return; }
  target.innerHTML = `
    <a class="detail-back" href="${kind==="tool"?"./tools.html":kind==="project"?"./work.html":"./learn.html"}">← BACK TO ${kind==="tool"?"TOOLS":kind==="project"?"WORK":"LEARN"}</a>
    <div class="eyebrow">${kind.toUpperCase()} / ${(item.category || item.discipline || "DNS ORIGIN LABS").toUpperCase()}</div>
    <h1></h1><p class="detail-lede"></p>
    <div class="detail-meta"><span>${(item.status || "draft").toUpperCase()}</span><span>${item.version || item.year || item.level || ""}</span></div>
    <div class="detail-section"><h2>Overview</h2><p class="detail-description"></p></div>
    <div class="detail-section"><h2>Features / notes</h2><ul class="detail-features"></ul></div>
    <div class="detail-section"><h2>Documentation</h2><p class="detail-docs"></p></div>
    `;
  target.querySelector("h1").textContent=item.name||item.title;
  target.querySelector(".detail-lede").textContent=item.description||item.summary||"";
  target.querySelector(".detail-description").textContent=item.longDescription||item.body||item.summary||"";
  const features = item.features || (item.credits ? [item.credits] : []);
  target.querySelector(".detail-features").innerHTML=features.map(f=>`<li>${escapeHTML(f)}</li>`).join("") || "<li>Details will be added.</li>";
  const docsNode=target.querySelector(".detail-docs");
  if(item.docs && /^(\.\.\/docs\/|\.\/docs\/)/.test(item.docs)){const link=document.createElement("a");link.className="inline-link";link.href=item.docs;link.textContent="Open documentation ↗";docsNode.replaceChildren(link);}else{docsNode.textContent="Documentation will be added.";}
  if (kind === "tool") {
    const button=document.createElement("button");
    button.className="button button-primary";
    button.type="button";button.dataset.downloadTool=item.id;button.textContent="Checking release…";
    target.append(button);
    await initDownloads([item]);
  }
}

initNavigation();setYear();
if (page==="work") renderProjects();
if (page==="tools") renderCatalog();
if (page==="learn") renderTutorials();
if (page==="tool") await renderDetail("tool");
if (page==="project") await renderDetail("project");
if (page==="tutorial") await renderDetail("tutorial");
initReveals();
