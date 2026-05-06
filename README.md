# TabFlow — Tab Manager

A lightweight Chrome extension that brings order to your browser. Opens as a **side panel** so it stays visible while you work.

## Features

- **Group by Domain** — Automatically groups tabs by website into labeled, color-coded Chrome tab groups. Subdomains are merged intelligently (e.g. `docs.nvidia.com` and `nvidia.com` go into the same *Nvidia* group).
- **Close Duplicates** — Finds and removes duplicate tabs, keeping the first instance of each URL.
- **Sort Tabs** — Sort all tabs alphabetically by domain or by title.
- **Expand / Collapse Groups** — Bulk expand or collapse all tab groups in one click.
- **Ungroup All** — Strip all groupings and return tabs to a flat list.
- **Merge Windows** — Pull all open Chrome windows into one.
- **All Tabs View** — Browse and search every open tab, grouped by site. Click any tab to switch to it, or close it with ✕.

## Installation

This extension is not on the Chrome Web Store. Install it manually in a few steps:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the repository folder
5. Click the TabFlow icon in your toolbar — the side panel opens on the right

## Usage

Click the **TabFlow icon** in the Chrome toolbar to open the side panel. The panel stays open as you browse.

| Action | What it does |
|---|---|
| Group by Domain | Groups all tabs; `docs.nvidia.com` → *Nvidia*, `youtube.com` → *YouTube* |
| Close Duplicates | Removes tabs sharing the same URL |
| Sort by Domain | Reorders tabs A–Z by domain name |
| Sort by Title | Reorders tabs A–Z by page title |
| Expand All Groups | Expands every collapsed tab group |
| Collapse All Groups | Collapses every tab group |
| Ungroup All | Removes all tab group assignments |
| Merge All Windows | Moves tabs from all windows into the current one |

## Privacy

- No data is collected, transmitted, or stored externally.
- No analytics, no telemetry, no network requests beyond what your tabs already make.
- All logic runs entirely in your browser.

## Permissions

| Permission | Why it's needed |
|---|---|
| `tabs` | Read tab URLs and titles, move and close tabs |
| `tabGroups` | Create, update, and remove tab groups |
| `windows` | Query and merge browser windows |
| `sidePanel` | Render the UI as a side panel instead of a popup |
| `storage` | Reserved for future settings persistence |

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.