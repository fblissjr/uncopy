# UnCopy Chrome Extension

Chrome extension that removes tracking parameters from URLs via right-click context menus and a manual popup.

## Project Structure
- `manifest.json` - Extension configuration (manifest v3) with popup action
- `cleaner.js` - ES module: URL cleaning logic (redirect unwrapping + param stripping), imported by background and popup
- `background.js` - Service worker: context menu registration, click handling, storage sync
- `popup.html` - Manual URL cleaning interface
- `popup.js` - Popup functionality for manual cleaning

## Key Features
- Removes 50+ tracking parameters (UTM, Facebook, LinkedIn, Amazon, etc.)
- **Two approaches**:
  1. Right-click context menu: "Clean this link" (on links) and "Clean current page URL" (on page)
  2. Manual popup interface for paste-and-clean
- All JS files are ES modules (`import`/`export`); background service worker declared with `"type": "module"` in manifest
- Clipboard writes from background use `chrome.scripting.executeScript` (not `navigator.clipboard` directly)
- Popup toggle enables/disables context menu items via `chrome.storage.onChanged` → `chrome.contextMenus.update`

## Permissions
`clipboardWrite`, `activeTab`, `storage`, `contextMenus`, `scripting` — no host permissions, no content scripts.

## Limitations
Cannot intercept all copy mechanisms due to browser security restrictions. Right-click and manual popup are the two supported paths.
