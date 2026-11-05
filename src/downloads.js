import { escapeHTML } from "./page.js";

const releaseCache = new Map();

async function resolveRelease(tool) {
  if (!tool.release || !tool.release.repo) return [];
  const { repo, tag = "latest", assetName = "" } = tool.release;
  const endpoint = tag === "latest"
    ? `https://api.github.com/repos/${repo}/releases/latest`
    : `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`;
  if (!releaseCache.has(endpoint)) {
    releaseCache.set(endpoint, fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null));
  }
  const release = await releaseCache.get(endpoint);
  if (!release || !Array.isArray(release.assets)) return [];
  return release.assets.filter(asset => !assetName || asset.name.toLowerCase() === assetName.toLowerCase())
    .map(asset => ({ name: asset.name, url: asset.browser_download_url, size: asset.size, release: release.html_url }));
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "File size not listed";
  const units = ["B","KB","MB","GB"];
  let value = bytes, index = 0;
  while (value >= 1024 && index < units.length - 1) { value /= 1024; index++; }
  return `${value.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

export async function initDownloads(tools = []) {
  const modal = document.createElement("dialog");
  modal.className = "download-dialog";
  modal.innerHTML = `
    <form method="dialog" class="download-dialog-card" id="download-form">
      <button class="dialog-close" value="cancel" aria-label="Close">×</button>
      <div class="eyebrow">FREE TOOL DOWNLOAD</div>
      <h2>One quick step.</h2>
      <p class="dialog-description">Enter an email address to continue. This static site checks only the email format in your browser. It does not save or transmit your address.</p>
      <label for="download-email">Email address</label>
      <input id="download-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
      <p class="dialog-error" aria-live="polite"></p>
      <button class="button button-primary" id="confirm-download" type="submit">Continue to download <span>↗</span></button>
      <small>Your address is not stored by DNS ORIGIN LABS.</small>
    </form>`;
  document.body.append(modal);
  const form = modal.querySelector("form");
  const email = modal.querySelector("input");
  const error = modal.querySelector(".dialog-error");
  let selectedTool = null;
  let selectedAsset = null;

  const releaseResults = await Promise.all(tools.map(async tool => [tool.id, await resolveRelease(tool)]));
  const assetsByTool = new Map(releaseResults);

  document.querySelectorAll("[data-download-tool]").forEach(button => {
    const tool = tools.find(item => item.id === button.dataset.downloadTool);
    const assets = tool ? (assetsByTool.get(tool.id) || []) : [];
    if (!tool || !tool.downloadEnabled || !assets.length) {
      button.disabled = true;
      button.textContent = "Release not published";
      button.title = "A public GitHub Release asset is not available yet.";
      return;
    }
    button.disabled = false;
    button.textContent = "Free download ↗";
    button.addEventListener("click", () => {
      selectedTool = tool;
      selectedAsset = assets[0];
      error.textContent = "";
      form.reset();
      modal.showModal();
      email.focus();
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!selectedTool || !selectedAsset) return;
    if (!email.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      error.textContent = "Enter a valid email address to continue.";
      email.focus();
      return;
    }
    // The address is intentionally not persisted, logged or sent anywhere.
    const destination = selectedAsset.url;
    modal.close();
    window.location.assign(destination);
  });
}
