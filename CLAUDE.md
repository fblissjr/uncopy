# UnCopy Chrome Extension

Chrome extension that tries to remove tracking parameters from URLs with multiple approaches.

## Project Structure
- `manifest.json` - Extension configuration (manifest v3) with popup action
- `content.js` - Main script with link cleaning, mutation observer, and clipboard monitoring
- `background.js` - Service worker for extension lifecycle
- `popup.html` - Manual URL cleaning interface
- `popup.js` - Popup functionality for manual cleaning

## Key Features
- Removes 50+ tracking parameters (UTM, Facebook, LinkedIn, Amazon, etc.)
- **Three approaches**:
  1. Pre-cleans all links on web pages when loaded
  2. Monitors clipboard for custom copy buttons (like LinkedIn's "Copy link")
  3. Manual popup interface for paste-and-clean
- Uses MutationObserver for dynamically added content
- Clipboard monitoring only active when tab is visible (performance optimization)

## Limitations
Cannot intercept all copy mechanisms due to browser security restrictions. Hence the multiple fallback approaches and manual option.