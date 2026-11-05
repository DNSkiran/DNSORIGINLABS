# DNS ORIGIN LABS

**CREATE. AUTOMATE. INNOVATE.**  
Creative technology for visual production.

A GitHub-only website for creative work, VFX utilities, pipeline solutions, tutorials and technical documentation.

## Website features
- Responsive homepage and dedicated Work, Tools, Pipeline, Learn, About and Contact pages.
- Editable JSON catalogues for tools, portfolio projects, tutorials and site configuration.
- Tool detail pages and documentation.
- GitHub Releases integration for downloadable builds.
- Browser-side email syntax validation before free downloads. Email addresses are not stored or transmitted.
- Local admin workspace with visual record editing, JSON validation/export, code editor, SEO metadata manager, release/asset guidance and GitHub links.
- GitHub Actions workflow that publishes the website to the `gh-pages` branch.
- Sitemap, robots file, 404 page, favicon and web manifest.

## Architecture
- Static HTML, CSS and vanilla JavaScript. No runtime build step.
- GitHub repository is the source of truth for site code and JSON content.
- GitHub Pages serves the public site.
- GitHub Actions updates the `gh-pages` deployment branch on pushes to `main`.
- GitHub Releases stores downloadable application builds.

## One-time GitHub Pages setup
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select branch **gh-pages** and folder **/(root)**.
4. Save. The workflow will publish every future update from `main` to this branch.
5. Visit the URL shown in Pages settings. The expected project-site URL is `https://dnskiran.github.io/DNSORIGINLABS/`.

The workflow uses the repository-scoped `GITHUB_TOKEN` with contents write access to update only the deployment branch. It does not need a personal access token.

## Admin workspace
Open `/admin/` on the deployed website or `admin/index.html` in the repository.

The workspace supports:
- Visual add/edit/delete of tool, project and tutorial records.
- Advanced JSON editing, validation and export.
- Local browser drafts.
- Source-file editor with export and links to GitHub's authenticated editor.
- SEO metadata draft editor.
- GitHub Releases and repository management links.

**Important:** GitHub Pages is static. The admin workspace is not a private server-side CMS and does not authenticate users. Drafts remain in the current browser only. Publishing takes place through GitHub's own authenticated editor and repository permissions. Never put secrets or GitHub tokens in site JavaScript.

## Editing content
| File | Purpose |
|---|---|
| `data/tools.json` | Tools, categories, compatibility and release mapping |
| `data/projects.json` | Portfolio projects and credits |
| `data/tutorials.json` | Tutorials and learning resources |
| `data/site.json` | Brand and SEO configuration |
| `index.html`, `pages/*.html` | Page structure and content |
| `styles.css`, `pages/inner.css` | Site design and responsive styles |
| `src/*.js`, `pages/interior.js` | Interactions, catalogues and downloads |
| `docs/*.html` | Technical documentation |
| `admin/*` | Local admin workspace |
| `.github/workflows/pages.yml` | Static site publishing workflow |

## Publishing a tool download
1. Create a GitHub Release with a version tag.
2. Attach the Windows installer or archive as a release asset.
3. In `data/tools.json`, configure the tool's `release.repo`, `release.tag` and exact `release.assetName`.
4. Set `downloadEnabled` to true.
5. Commit the JSON update to `main`.
6. Test the public download. The button stays disabled until a matching public release asset is found.

Large binaries should be uploaded to GitHub Releases rather than committed to the Pages source. Check the current GitHub release asset limits before uploading.

## Security and future paid products
This release intentionally has no visitor accounts, private admin API, email database, payment processor or license server. A browser-only application cannot securely hold privileged GitHub credentials. Future paid licensing, payments, customer verification and private administrator authentication require trusted server-side infrastructure and are not enabled here.

## Content and credits
Project entries supplied as reference names are initially stored as drafts. Add authorized production stills, accurate personal contributions and verified credits before changing their status to `published`. Tool items marked Planned, Concept or In development are not represented as released downloads.

## License
All rights reserved unless a separate license is explicitly added.
