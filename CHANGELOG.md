# Changelog

## 1.2.0

- Replace content scripts and clipboard polling with right-click context menus
- Add "Clean this link" context menu item (right-click any link)
- Add "Clean current page URL" context menu item (right-click page background)
- Remove `clipboardRead` and broad `<all_urls>` host permissions to eliminate install-time warnings
- Add `contextMenus` and `scripting` permissions
- Convert `cleaner.js`, `background.js`, and `popup.js` to ES modules
- Delete `content.js` (auto link cleaning and clipboard monitoring removed)
- Repurpose popup toggle to enable/disable context menu items; relabel "Auto" to "Enable"

## 1.1.0

- Add redirect URL unwrapping (Postmark, Facebook, Google, Microsoft SafeLinks, SendGrid)
- Add generic redirect parameter extraction in popup (aggressive mode)
- Add enable/disable toggle in popup for automatic cleaning
- Extract shared cleaning module (`cleaner.js`) to eliminate code duplication
- Add "No tracking found" feedback when URL is already clean
- Add `storage` permission for toggle state persistence
- Recursive unwrapping with depth limit of 5 for chained redirects
- Fix clipboard monitoring bug where `lastClipboardContent` was not updated to cleaned text

## 1.0.0

- Initial release
- Strip 50+ tracking parameters (UTM, Facebook, LinkedIn, Amazon, etc.)
- Pre-clean all links on web pages
- Monitor clipboard for custom copy buttons
- Manual popup interface for paste-and-clean
