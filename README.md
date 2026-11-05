# DNS ORIGIN LABS

**CREATE. AUTOMATE. INNOVATE.**  
Creative technology for visual production.

A responsive, static website for creative work, artist-first tools, pipeline solutions and learning resources.

## Current website
- Cinematic responsive homepage with animated Origin Core artwork.
- Creative work showcase with original CSS-generated visual placeholders.
- Filterable tools catalogue.
- Pipeline solutions and learning sections.
- Responsive navigation, accessible controls and reduced-motion support.
- GitHub Pages deployment workflow.

## Technology
- HTML, CSS and vanilla JavaScript.
- No runtime framework, database, paid API or build step.
- GitHub Pages hosting.
- GitHub Actions deployment.

## Publish with GitHub Pages
1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Save the setting.
4. Open the **Actions** tab and watch the workflow named **Deploy DNS ORIGIN LABS**.
5. After the deployment succeeds, open the Pages URL shown under **Settings → Pages**.

The workflow deploys the repository root whenever a commit is pushed to `main`, or when manually triggered from Actions.

## Edit the website
| File | Purpose |
|---|---|
| `index.html` | Page structure, copy and navigation |
| `styles.css` | Visual design, animation and responsive layout |
| `src/main.js` | Tool cards, filters and interactive behavior |
| `assets/` | Logo, favicon and social preview image |
| `.github/workflows/pages.yml` | Automatic GitHub Pages deployment |

Tool cards are maintained in the `TOOL_ITEMS` array inside `src/main.js`. Update each card's name, description, category, status and destination link there.

## Important architecture and security notes
This is a static GitHub Pages website. It does not have a server, database, private admin login or secure server-side processing.
- Never place a GitHub personal access token, password, private key or other secret in frontend JavaScript.
- Content changes are committed through GitHub's authenticated repository interface.
- A future private admin CMS, visitor email storage, payment processing or paid licensing system would require a trusted backend and secure authentication. Those features are not enabled in this build.
- Large application binaries should be published as GitHub Release assets rather than committed to this website repository. Keep each release asset within GitHub's current per-file limits.

## Content accuracy
The work gallery currently uses original CSS-generated artwork as placeholders. Replace it with approved production stills, showreel links and accurate project credits before presenting specific client or production work. Tool entries marked planned or in development are not advertised as released downloads.

## License
All rights reserved. Public visibility of this repository does not automatically make the brand assets or website content open-source.
