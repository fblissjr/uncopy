// UnCopy popup script
// Uses window.UnCopy.cleanUrl() from cleaner.js (loaded first via popup.html)

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + (type || 'success');
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}

// Toggle state management
const toggle = document.getElementById('toggleEnabled');

chrome.storage.local.get({ uncopyEnabled: true }, (result) => {
  toggle.checked = result.uncopyEnabled;
});

toggle.addEventListener('change', () => {
  chrome.storage.local.set({ uncopyEnabled: toggle.checked });
});

// Clean button -- always works regardless of toggle (manual action)
document.getElementById('cleanBtn').addEventListener('click', async () => {
  const urlInput = document.getElementById('urlInput');
  const originalUrl = urlInput.value.trim();

  if (!originalUrl) {
    showStatus('Please enter a URL', 'error');
    return;
  }

  const cleanedUrl = window.UnCopy.cleanUrl(originalUrl, { aggressive: true });
  urlInput.value = cleanedUrl;

  if (cleanedUrl === originalUrl) {
    showStatus('No tracking found in this URL', 'info');
    return;
  }

  try {
    await navigator.clipboard.writeText(cleanedUrl);
    showStatus('URL cleaned and copied to clipboard!');
  } catch {
    showStatus('URL cleaned (copy to clipboard failed)');
  }
});

// Paste button
document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
  } catch {
    showStatus('Failed to read from clipboard', 'error');
  }
});
