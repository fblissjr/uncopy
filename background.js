// UnCopy background service worker

import { cleanUrl } from './cleaner.js';

function syncMenuState(enabled) {
  chrome.contextMenus.update('clean_link', { enabled });
  chrome.contextMenus.update('clean_page', { enabled });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ uncopyEnabled: true }, (result) => {
    chrome.storage.local.set({ uncopyEnabled: result.uncopyEnabled });

    chrome.contextMenus.create({
      id: 'clean_link',
      title: 'Clean this link',
      contexts: ['link'],
      enabled: result.uncopyEnabled,
    });

    chrome.contextMenus.create({
      id: 'clean_page',
      title: 'Clean current page URL',
      contexts: ['page'],
      enabled: result.uncopyEnabled,
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && 'uncopyEnabled' in changes) {
    syncMenuState(changes.uncopyEnabled.newValue);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let rawUrl;
  if (info.menuItemId === 'clean_link') {
    rawUrl = info.linkUrl;
  } else if (info.menuItemId === 'clean_page') {
    rawUrl = tab.url;
  } else {
    return;
  }

  const cleaned = cleanUrl(rawUrl, { aggressive: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (text) => navigator.clipboard.writeText(text),
    args: [cleaned],
  });
});

// Message handler for redirect resolution (placeholder for future HTTP redirect following)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'resolveRedirect') {
    sendResponse({ url: message.url });
  }
  return false;
});
