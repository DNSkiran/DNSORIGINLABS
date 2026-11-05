const releaseCache = new Map();
const assetsByTool = new Map();
let dialog;
let activeAsset = null;
let activeEmail = null;
let observerReady = false;

async function resolveAssets(tool) {
  if (!tool.release?.repo) return [];
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
    .map(asset => ({ name: asset.name, url: asset.browser_download_url, size: asset.size, releaseUrl: release.html_url }));
}

function ensureDialog() {
  if (dialog) return;
  dialog = document.createElement("dialog");
  dialog.className = "download-dialog";
  dialog.innerHTML = `
    <form method="dialog" class="download-dialog-card" id="download-form">
      <button class="dialog-close" value="cancel" aria-label="Close">×</button>
      <div class="eyebrow">FREE TOOL DOWNLOAD</div>
      <h2>One quick step.</h2>
      <p class="dialog-description">Enter an email address to continue. It is checked only in this browser. DNS ORIGIN LABS does not save or transmit the address.</p>
      <label for="download-email">Email address</label>
      <input id="download-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
      <p class="dialog-error" aria-live="polite"></p>
      <button class="button button-primary" id="confirm-download" type="submit">Continue to download <span>↗</span></button>
      <small>Your address is not stored by DNS ORIGIN LABS.</small>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector("form");
  const email = dialog.querySelector("input");
  const error = dialog.querySelector(".dialog-error");
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!activeAsset) return;
    if (!email.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      error.textContent = "Enter a valid email address to continue.";
      email.focus();
      return;
    }
    // The email address is intentionally not persisted, logged or sent anywhere.
    const destination = activeAsset.url;
    dialog.close();
    window.location.assign(destination);
  });
}

function updateDownloadButtons() {
  document.querySelectorAll("[data-download-tool]").forEach(button => {
    const items = assetsByTool.get(button.dataset.downloadTool) || [];
    if (items.length) {
      button.disabled = false;
      button.textContent = "Free download ↗";
      button.title = items.map(item => item.name).join(", ");
    } else {
      button.disabled = true;
      button.textContent = "Release not published";
      button.title = "A matching public GitHub Release asset is not available yet.";
    }
  });
}

export async function initDownloads(tools = []) {
  ensureDialog();
  await Promise.all(tools.map(async tool => {
    if (!assetsByTool.has(tool.id)) assetsByTool.set(tool.id, await resolveAssets(tool));
  }));
  updateDownloadButtons();

  if (!observerReady) {
    const observer = new MutationObserver(updateDownloadButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", event => {
      const button = event.target.closest?.("[data-download-tool]");
      if (!button || button.disabled) return;
      const assets = assetsByTool.get(button.dataset.downloadTool) || [];
      if (!assets.length) return;
      activeAsset = assets[0];
      activeEmail = dialog.querySelector("input");
      dialog.querySelector(".dialog-error").textContent = "";
      dialog.querySelector("form").reset();
      dialog.showModal();
      activeEmail.focus();
    });
    observerReady = true;
  }
}
