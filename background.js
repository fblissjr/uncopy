// Background script for handling extension lifecycle
chrome.runtime.onInstalled.addListener(() => {
  console.log('UnCopy extension installed');
});