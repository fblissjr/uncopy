# Changelog

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
