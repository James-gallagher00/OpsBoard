# IT Ops Board

A lightweight, browser-based IT operations task board built as a single HTML file. Designed to look and feel like a real ops tool — not a toy — with a clean professional dark UI.

No backend. No dependencies to install. Just open the file.

## Features

- **Kanban-style task management** with priority tiers: Critical, High, Medium, Low
- **Category tagging** — Security, Network, Sysadmin, Incident, Patch, Audit, Other
- **Auto-generated ticket IDs** in `TKT-XXXX` format
- **Live stats strip** — total, critical, pending, and resolved counts update in real time
- **Filter views** — All / Active / Critical / Resolved
- **Persistent storage** — tasks survive page refreshes via `localStorage`
- **Live UTC clock** in the top bar
- **Fully self-contained** — single `.html` file, no build step, no Node, no server

## Usage

```bash
# Just open it
open it-todo.html
```

Or serve it locally if you want it accessible across a network:

```bash
python3 -m http.server 8080
# Then navigate to http://localhost:8080/it-todo.html
```

## Stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JS (ES6+) |
| Persistence | `localStorage` |
| Font | Inter (Google Fonts CDN) |

## File Structure

```
it-todo.html    # Entire app — markup, styles, and logic in one file
```

## Customisation

All design tokens are CSS custom properties at the top of the `<style>` block — swap colours, spacing, or font without touching the layout logic.

Priority colours, category labels, and default seed tasks are all defined in clearly commented JS sections near the bottom of the file.

## Browser Support

Any modern browser (Chrome, Edge, Firefox, Safari). No polyfills needed.

## Notes

- Data is stored in the browser's `localStorage` under the key `it_ops_tasks`. Clearing site data will wipe tasks.
- This is a personal/team ops aid — it has no auth, no multi-user sync, and no server-side persistence by design. Don't put it on a public-facing host without adding your own access controls.

## License

MIT
