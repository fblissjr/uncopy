// UnCopy shared cleaning module
// Single source of truth for URL cleaning: redirect unwrapping + parameter stripping

const TRACKING_PARAMS = [
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

const TRACKING_PARAMS_SET = new Set(TRACKING_PARAMS);

// Generic redirect parameter names -- only used in aggressive mode
const GENERIC_REDIRECT_PARAMS = [
  'url', 'redirect', 'redirect_url', 'redirect_uri',
  'goto', 'target', 'destination', 'out', 'next'
];

const MAX_UNWRAP_DEPTH = 5;

// --- Redirect unwrapping rules ---

function unwrapPostmark(url) {
  const hostname = url.hostname;
  if (hostname !== 'track.pstmrk.it' && hostname !== 'click.pstmrk.it') {
    return null;
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2) return null;

  if (!/^\d+s$/.test(pathParts[0])) return null;

  const encoded = pathParts[1];
  try {
    const decoded = decodeURIComponent(encoded);
    if (decoded.match(/^[a-zA-Z0-9][\w.-]+\.[a-zA-Z]{2,}/)) {
      return 'https://' + decoded;
    }
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

function unwrapFacebook(url) {
  const hostname = url.hostname;
  if (hostname !== 'l.facebook.com' && hostname !== 'lm.facebook.com') {
    return null;
  }
  const destination = url.searchParams.get('u');
  return destination || null;
}

function unwrapGoogle(url) {
  if (!url.hostname.endsWith('google.com')) return null;
  if (url.pathname !== '/url') return null;

  return url.searchParams.get('q') || url.searchParams.get('url') || null;
}

function unwrapSafeLinks(url) {
  if (!url.hostname.endsWith('.safelinks.protection.outlook.com')) return null;
  return url.searchParams.get('url') || null;
}

function unwrapSendGrid(url) {
  if (!url.hostname.endsWith('.ct.sendgrid.net')) return null;

  const pathParts = url.pathname.split('/').filter(Boolean);
  for (const part of pathParts) {
    try {
      const decoded = decodeURIComponent(part);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        return decoded;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function unwrapGeneric(url) {
  for (const param of GENERIC_REDIRECT_PARAMS) {
    const value = url.searchParams.get(param);
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      try {
        new URL(value);
        return value;
      } catch {
        continue;
      }
    }
  }
  return null;
}

const SPECIFIC_RULES = [
  unwrapPostmark,
  unwrapFacebook,
  unwrapGoogle,
  unwrapSafeLinks,
  unwrapSendGrid,
];

/**
 * Attempt to unwrap a tracking redirect URL.
 * @param {string} urlStr - The URL string to unwrap
 * @param {boolean} aggressive - If true, also try generic redirect param extraction
 * @returns {string} The unwrapped URL (or original if no redirect detected)
 */
function unwrapRedirects(urlStr, aggressive) {
  let current = urlStr;

  for (let depth = 0; depth < MAX_UNWRAP_DEPTH; depth++) {
    let parsed;
    try {
      parsed = new URL(current);
    } catch {
      break;
    }

    let extracted = null;

    for (const rule of SPECIFIC_RULES) {
      extracted = rule(parsed);
      if (extracted) break;
    }

    if (!extracted && aggressive) {
      extracted = unwrapGeneric(parsed);
    }

    if (!extracted) break;

    current = extracted;
  }

  return current;
}

/**
 * Strip tracking query parameters from a URL.
 * @param {string} urlStr - The URL to strip params from
 * @returns {string} The URL with tracking params removed
 */
function stripTrackingParams(urlStr) {
  try {
    const urlObj = new URL(urlStr);
    const params = new URLSearchParams(urlObj.search);
    let changed = false;

    for (const key of [...params.keys()]) {
      if (TRACKING_PARAMS_SET.has(key)) {
        params.delete(key);
        changed = true;
      }
    }

    if (changed) {
      urlObj.search = params.toString();
    }
    return urlObj.toString();
  } catch {
    return urlStr;
  }
}

/**
 * Full cleaning pipeline: unwrap redirects then strip tracking params.
 * @param {string} url - The URL to clean
 * @param {Object} [options]
 * @param {boolean} [options.aggressive=false] - Enable generic redirect unwrapping
 * @returns {string} The cleaned URL
 */
function cleanUrl(url, options) {
  const aggressive = options && options.aggressive;
  const unwrapped = unwrapRedirects(url, aggressive);
  return stripTrackingParams(unwrapped);
}

export { cleanUrl, TRACKING_PARAMS };
