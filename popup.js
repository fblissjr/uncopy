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

function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}

document.getElementById('cleanBtn').addEventListener('click', async () => {
  const urlInput = document.getElementById('urlInput');
  const originalUrl = urlInput.value.trim();

  if (!originalUrl) {
    showStatus('Please enter a URL', true);
    return;
  }

  const cleanedUrl = cleanUrl(originalUrl);
  urlInput.value = cleanedUrl;

  try {
    await navigator.clipboard.writeText(cleanedUrl);
    showStatus('URL cleaned and copied to clipboard!');
  } catch (error) {
    showStatus('URL cleaned (copy to clipboard failed)');
  }
});

document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
  } catch (error) {
    showStatus('Failed to read from clipboard', true);
  }
});