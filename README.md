# AI Tab Sorter Extension

Automatically sort and group browser tabs using on-device AI (Gemini Nano) with domain-based fallback.

## Features

- **On-Device AI Sorting:** Uses Gemini Nano (via the experimental Prompt API in Google Chrome) to intelligently categorize and group open tabs.
- **Domain-based Fallback:** If Gemini Nano is not available, or if "Use domain-only sorting" is checked, the extension groups tabs by their domain name.
- **Tab Preservation:** Does not modify pinned tabs.
- **Internal Page Exclusions:** Automatically filters out internal pages (`chrome://`, `chrome-untrusted://`, `dia://`) from being grouped or modified.
- **Ungrouping:** Easily ungroup all tabs and restore them to a flat list with a single click.

## Installation / Development Setup

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the directory containing this extension (the `tab-sorter` folder).

## Enabling Gemini Nano in Chrome

To use the AI sorting feature, you need a version of Chrome with on-device AI enabled:

1. Go to `chrome://flags/#optimization-guide-on-device-model` and set it to **Enabled BypassPrefRequirement**.
2. Go to `chrome://flags/#prompt-api-for-gemini-nano` and set it to **Enabled**.
3. Relaunch Chrome.
4. Go to `chrome://components/` and check for the **Optimization Guide On Device Model** component to ensure it is downloaded.

## Permissions Used

- `tabs`: To read open tab details (titles, URLs) for grouping.
- `tabGroups`: To programmatically create, rename, and organize tab groups.
- `storage`: To persist settings (such as forcing the fallback method).
- `offscreen`: Used for running background scripts/APIs when necessary.
