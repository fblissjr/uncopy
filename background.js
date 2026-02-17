// UnCopy background service worker

chrome.runtime.onInstalled.addListener(() => {
  // Set default toggle state (enabled) on first install
  chrome.storage.local.get({ uncopyEnabled: true }, (result) => {
    chrome.storage.local.set({ uncopyEnabled: result.uncopyEnabled });
  });
});

// Message handler for future extensibility (e.g., HTTP redirect following
// for Mandrill/Mailchimp domains that require actual network requests)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'resolveRedirect') {
    // Placeholder: currently returns the URL unchanged.
    // Future implementation could follow HTTP redirects via fetch().
    sendResponse({ url: message.url });
  }
  return false;
});
