export async function loadJSON(path, fallback = null) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[character]);
}

export function setYear() {
  const node = document.querySelector("[data-year]");
  if (node) node.textContent = String(new Date().getFullYear());
}

export function initNavigation() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("is-open", expanded);
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    button.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }));
}

export function initReveals(root = document) {
  const nodes = root.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(node => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  nodes.forEach(node => observer.observe(node));
}
