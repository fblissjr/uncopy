// UnCopy content script
// Uses window.UnCopy.cleanUrl() from cleaner.js (loaded first via manifest)

let enabled = true;
let observer = null;
let clipboardInterval = null;
let lastClipboardContent = '';

function cleanLink(link) {
  const href = link.getAttribute('href');
  if (!href || (!href.startsWith('http') && !href.startsWith('//'))) return;

  const cleaned = window.UnCopy.cleanUrl(href);
  if (cleaned !== href) {
    link.setAttribute('data-original-href', href);
    link.setAttribute('href', cleaned);
  }
}

function cleanAllLinks() {
  document.querySelectorAll('a[href]').forEach(cleanLink);
}

function startObserver() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.tagName === 'A' && node.getAttribute('href')) {
          cleanLink(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('a[href]').forEach(cleanLink);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

async function checkClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText === lastClipboardContent) return;

    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = clipboardText.match(urlRegex);
    if (!urls || urls.length === 0) {
      lastClipboardContent = clipboardText;
      return;
    }

    let cleanedText = clipboardText;
    let hasChanges = false;

    for (const url of urls) {
      const cleaned = window.UnCopy.cleanUrl(url);
      if (cleaned !== url) {
        cleanedText = cleanedText.replace(url, cleaned);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await navigator.clipboard.writeText(cleanedText);
      lastClipboardContent = cleanedText;
      console.log('UnCopy: Cleaned URL in clipboard');
    } else {
      lastClipboardContent = clipboardText;
    }
  } catch {
    // Clipboard access denied -- ignore
  }
}

function startClipboardMonitoring() {
  if (!clipboardInterval) {
    clipboardInterval = setInterval(checkClipboard, 500);
  }
}

function stopClipboardMonitoring() {
  if (clipboardInterval) {
    clearInterval(clipboardInterval);
    clipboardInterval = null;
  }
}

function enable() {
  enabled = true;
  cleanAllLinks();
  startObserver();
  if (document.visibilityState === 'visible') {
    startClipboardMonitoring();
  }
}

function disable() {
  enabled = false;
  stopObserver();
  stopClipboardMonitoring();
}

// Load toggle state and start
chrome.storage.local.get({ uncopyEnabled: true }, (result) => {
  if (result.uncopyEnabled) {
    enable();
  } else {
    disable();
  }
});

// React to toggle changes from popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.uncopyEnabled) {
    if (changes.uncopyEnabled.newValue) {
      enable();
    } else {
      disable();
    }
  }
});

// Visibility-based clipboard monitoring
document.addEventListener('visibilitychange', () => {
  if (!enabled) return;

  if (document.visibilityState === 'visible') {
    startClipboardMonitoring();
  } else {
    stopClipboardMonitoring();
  }
});
