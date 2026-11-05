const TOOL_ITEMS = [
  {
    code: "OC", category: "COLOR", filter: "color", name: "DNS OCIO Encoder",
    description: "A color-managed workflow concept for converting OpenEXR image sequences into ProRes QuickTime movies.",
    status: "PROJECT SPOTLIGHT", href: "https://github.com/DNSkiran?tab=repositories"
  },
  {
    code: "NK", category: "COMPOSITING", filter: "compositing", name: "Nuke Workflow Utilities",
    description: "A growing collection of practical helpers for organizing and automating compositing tasks.",
    status: "IN DEVELOPMENT", href: "https://github.com/DNSkiran?tab=repositories"
  },
  {
    code: "PY", category: "PIPELINE AUTOMATION", filter: "pipeline", name: "Production Python Tools",
    description: "Focused scripts for file handling, sequence checks and repeatable production tasks.",
    status: "IN DEVELOPMENT", href: "https://github.com/DNSkiran?tab=repositories"
  },
  {
    code: "CG", category: "PIPELINE AUTOMATION", filter: "pipeline", name: "Render Folder Toolkit",
    description: "Utilities for discovering render outputs and handling common folder and naming variations.",
    status: "PLANNED", href: "https://github.com/DNSkiran?tab=repositories"
  },
  {
    code: "EX", category: "COLOR", filter: "color", name: "Image Sequence Helpers",
    description: "A planned set of helpers to inspect, prepare and move image sequences between production stages.",
    status: "PLANNED", href: "https://github.com/DNSkiran?tab=repositories"
  },
  {
    code: "FX", category: "COMPOSITING", filter: "compositing", name: "Artist Workflow Kit",
    description: "Artist-first utilities shaped around practical production friction points.",
    status: "CONCEPT", href: "https://github.com/DNSkiran?tab=repositories"
  }
];

const toolGrid = document.querySelector("#tool-grid");

function makeToolCard(tool) {
  const article = document.createElement("article");
  article.className = "tool-card reveal";
  article.innerHTML = `
    <div class="tool-top">
      <span class="tool-icon">${tool.code}</span>
      <span class="tool-category">${tool.category}</span>
    </div>
    <h3></h3><p></p>
    <div class="tool-footer"><span></span><a target="_blank" rel="noopener noreferrer">GITHUB ↗</a></div>
  `;
  article.querySelector("h3").textContent = tool.name;
  article.querySelector("p").textContent = tool.description;
  article.querySelector(".tool-footer span").textContent = tool.status;
  article.querySelector(".tool-footer a").href = tool.href;
  return article;
}

function renderTools(filter = "all") {
  if (!toolGrid) return;
  const matching = TOOL_ITEMS.filter(item => filter === "all" || item.filter === filter);
  toolGrid.replaceChildren(...matching.map(makeToolCard));
  observeReveals(toolGrid.querySelectorAll(".reveal"));
}

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderTools(button.dataset.filter || "all");
  });
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(expanded));
    navigation.classList.toggle("is-open", expanded);
  });
  navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    });
  });
}

let revealObserver;
function observeReveals(elements) {
  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  elements.forEach(element => revealObserver.observe(element));
}

renderTools();
observeReveals(document.querySelectorAll(".reveal"));
const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();