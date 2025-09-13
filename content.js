// List of tracking parameters to remove
const trackingParams = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ga_source', 'ga_medium', 'ga_campaign', 'ga_term', 'ga_content',
  'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
  'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_ref', 'fb_source',
  'rcm', 'refId', 'trackingId',
  'ref_src', 'ref_url', 's',
  'tag', 'ref', 'ref_', 'pf_rd_p', 'pf_rd_r', 'pd_rd_r', 'pd_rd_w',
  'pd_rd_wg', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i', 'pd_rd_i',
  'ascsubtag', 'creative', 'creativeASIN', 'linkCode', 'linkId',
  'feature', 'kw', 'si',
  'source', 'medium', 'campaign', 'content', 'term',
  'mc_cid', 'mc_eid', '_hsenc', '_hsmi', 'hsCtaTracking',
  'vero_conv', 'vero_id', 'wickedid', 'yclid', 'msclkid', 'igshid',
  'tt_medium', 'tt_content', 'twclid', 'mkt_tok', '_openstat',
  'pk_campaign', 'pk_kwd', 'pk_medium', 'pk_source',
  'sc_campaign', 'sc_channel', 'sc_content', 'sc_medium', 'sc_outcome',
  'oft_id', 'oft_k', 'oft_lk', 'oft_d', 'oft_c', 'oft_ck', 'oft_ids', 'oft_sk'
];

function cleanUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    trackingParams.forEach(param => {
      params.delete(param);
    });

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

// Modify all links on the page to clean URLs
function cleanAllLinks() {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const originalHref = link.getAttribute('href');
    if (originalHref && (originalHref.startsWith('http') || originalHref.startsWith('//'))) {
      const cleanedUrl = cleanUrl(originalHref);
      if (cleanedUrl !== originalHref) {
        link.setAttribute('data-original-href', originalHref);
        link.setAttribute('href', cleanedUrl);
      }
    }
  });
}

// Clean links when page loads
cleanAllLinks();

// Monitor for new links added dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'A' && node.getAttribute('href')) {
          const originalHref = node.getAttribute('href');
          if (originalHref && (originalHref.startsWith('http') || originalHref.startsWith('//'))) {
            const cleanedUrl = cleanUrl(originalHref);
            if (cleanedUrl !== originalHref) {
              node.setAttribute('data-original-href', originalHref);
              node.setAttribute('href', cleanedUrl);
            }
          }
        }
        // Check for links within added elements
        const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
        links.forEach(link => {
          const originalHref = link.getAttribute('href');
          if (originalHref && (originalHref.startsWith('http') || originalHref.startsWith('//'))) {
            const cleanedUrl = cleanUrl(originalHref);
            if (cleanedUrl !== originalHref) {
              link.setAttribute('data-original-href', originalHref);
              link.setAttribute('href', cleanedUrl);
            }
          }
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Monitor for custom copy actions (like LinkedIn's copy button)
let lastClipboardContent = '';

async function checkClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText !== lastClipboardContent) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = clipboardText.match(urlRegex);

      if (urls && urls.length > 0) {
        let cleanedText = clipboardText;
        let hasChanges = false;

        urls.forEach(url => {
          const cleanedUrl = cleanUrl(url);
          if (cleanedUrl !== url) {
            cleanedText = cleanedText.replace(url, cleanedUrl);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          await navigator.clipboard.writeText(cleanedText);
          console.log('UnCopy: Cleaned URL in clipboard');
        }
      }
      lastClipboardContent = clipboardText;
    }
  } catch (error) {
    // Clipboard access might be denied, ignore silently
  }
}

// Check clipboard every 500ms when tab is active
let clipboardInterval;
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

// Start monitoring when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    startClipboardMonitoring();
  } else {
    stopClipboardMonitoring();
  }
});

// Start monitoring if page is already visible
if (document.visibilityState === 'visible') {
  startClipboardMonitoring();
}

// Export cleanUrl for popup use
window.cleanUrl = cleanUrl;