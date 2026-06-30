// TabFlow — panel.js

// ── Domain color palette ──────────────────────────────────────────
const DOMAIN_COLORS = [
  { name: 'blue',   hex: '#3b82f6', chrome: 'blue'   },
  { name: 'cyan',   hex: '#06b6d4', chrome: 'cyan'   },
  { name: 'green',  hex: '#22c55e', chrome: 'green'  },
  { name: 'yellow', hex: '#eab308', chrome: 'yellow' },
  { name: 'orange', hex: '#f97316', chrome: 'orange' },
  { name: 'pink',   hex: '#ec4899', chrome: 'pink'   },
  { name: 'purple', hex: '#a855f7', chrome: 'purple' },
  { name: 'red',    hex: '#ef4444', chrome: 'red'    },
  { name: 'grey',   hex: '#6b7280', chrome: 'grey'   },
];

let colorIndex = 0;
function nextColor() {
  const c = DOMAIN_COLORS[colorIndex % DOMAIN_COLORS.length];
  colorIndex++;
  return c;
}

// ── Utility: extract root domain ─────────────────────────────────
function getRootDomain(url) {
  try {
    const { hostname } = new URL(url);
    // Strip www. and return full hostname for grouping key
    return hostname.replace(/^www\./, '');
  } catch {
    return 'other';
  }
}

// ── Utility: extract the apex/registrable domain ─────────────────
// e.g. docs.nvidia.com → nvidia.com, mail.google.com → google.com
function getApexDomain(hostname) {
  // Remove www.
  hostname = hostname.replace(/^www\./, '');
  const parts = hostname.split('.');
  // Handle common two-part TLDs like co.uk, com.au, co.jp, etc.
  const twoPartTLDs = new Set([
    'co.uk','co.jp','co.in','co.nz','co.za','co.kr','co.id',
    'com.au','com.br','com.cn','com.mx','com.ar','com.tr',
    'org.uk','net.au','gov.uk','ac.uk','me.uk',
  ]);
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (twoPartTLDs.has(lastTwo)) {
      return parts.slice(-3).join('.');
    }
  }
  // Default: keep last two parts (apex domain)
  return parts.slice(-2).join('.');
}

// ── Known brand name overrides (apex domain → display name) ──────
const BRAND_NAMES = {
  'youtube.com':       'YouTube',
  'google.com':        'Google',
  'gmail.com':         'Gmail',
  'googlemail.com':    'Gmail',
  'github.com':        'GitHub',
  'gitlab.com':        'GitLab',
  'stackoverflow.com': 'Stack Overflow',
  'reddit.com':        'Reddit',
  'twitter.com':       'Twitter',
  'x.com':             'Twitter',
  'facebook.com':      'Facebook',
  'instagram.com':     'Instagram',
  'linkedin.com':      'LinkedIn',
  'netflix.com':       'Netflix',
  'spotify.com':       'Spotify',
  'amazon.com':        'Amazon',
  'wikipedia.org':     'Wikipedia',
  'notion.so':         'Notion',
  'figma.com':         'Figma',
  'vercel.com':        'Vercel',
  'netlify.com':       'Netlify',
  'heroku.com':        'Heroku',
  'aws.amazon.com':    'AWS',
  'console.aws.amazon.com': 'AWS',
  'azure.microsoft.com': 'Azure',
  'microsoft.com':     'Microsoft',
  'apple.com':         'Apple',
  'developer.apple.com': 'Apple',
  'nvidia.com':        'Nvidia',
  'unitree.com':       'Unitree',
  'openai.com':        'OpenAI',
  'anthropic.com':     'Anthropic',
  'claude.ai':         'Claude',
  'chat.openai.com':   'ChatGPT',
  'huggingface.co':    'HuggingFace',
  'discord.com':       'Discord',
  'slack.com':         'Slack',
  'zoom.us':           'Zoom',
  'dropbox.com':       'Dropbox',
  'drive.google.com':  'Google Drive',
  'docs.google.com':   'Google Docs',
  'sheets.google.com': 'Google Sheets',
  'meet.google.com':   'Google Meet',
  'calendar.google.com': 'Google Calendar',
  'maps.google.com':   'Google Maps',
  'news.ycombinator.com': 'Hacker News',
  'medium.com':        'Medium',
  'dev.to':            'Dev.to',
  'hashnode.com':      'Hashnode',
  'substack.com':      'Substack',
  'twitch.tv':         'Twitch',
  'tiktok.com':        'TikTok',
  'pinterest.com':     'Pinterest',
  'tumblr.com':        'Tumblr',
  'wordpress.com':     'WordPress',
  'shopify.com':       'Shopify',
  'ebay.com':          'eBay',
  'paypal.com':        'PayPal',
  'stripe.com':        'Stripe',
  'jira.atlassian.com':'Jira',
  'atlassian.com':     'Atlassian',
  'confluence.atlassian.com': 'Confluence',
  'trello.com':        'Trello',
  'asana.com':         'Asana',
  'linear.app':        'Linear',
  'airtable.com':      'Airtable',
  'canva.com':         'Canva',
  'miro.com':          'Miro',
  'loom.com':          'Loom',
  'calendly.com':      'Calendly',
  'hubspot.com':       'HubSpot',
  'salesforce.com':    'Salesforce',
  'cloudflare.com':    'Cloudflare',
  'digitalocean.com':  'DigitalOcean',
  'linode.com':        'Linode',
  'vultr.com':         'Vultr',
  'npmjs.com':         'npm',
  'pypi.org':          'PyPI',
  'crates.io':         'crates.io',
  'docker.com':        'Docker',
  'kubernetes.io':     'Kubernetes',
  'terraform.io':      'Terraform',
  'mongodb.com':       'MongoDB',
  'postgresql.org':    'PostgreSQL',
  'mysql.com':         'MySQL',
  'redis.io':          'Redis',
  'elastic.co':        'Elastic',
  'grafana.com':       'Grafana',
  'datadog.com':       'Datadog',
  'sentry.io':         'Sentry',
  'localhost':         'Localhost',
};

// ── Convert any URL/hostname to a clean group name ────────────────
function getGroupName(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Other';
  }

  // 1. Check full hostname first (e.g. docs.google.com → Google Docs)
  if (BRAND_NAMES[hostname]) return BRAND_NAMES[hostname];

  // 2. Check apex domain (e.g. docs.nvidia.com → nvidia.com → Nvidia)
  const apex = getApexDomain(hostname);
  if (BRAND_NAMES[apex]) return BRAND_NAMES[apex];

  // 3. Fallback: extract the meaningful word from apex domain
  // e.g. "nvidia.com" → "Nvidia", "some-site.io" → "Some-site"
  const name = apex.split('.')[0]; // first label of apex
  // Title-case it, preserve known all-caps patterns (2–4 uppercase chars)
  if (/^[A-Z]{2,4}$/.test(name)) return name; // e.g. IBM, MIT
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// ── Toast ─────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.className = 'toast';
  }, 2800);
}

// ── Tab count ─────────────────────────────────────────────────────
async function refreshTabCount() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  document.getElementById('tabCount').textContent = `${tabs.length} tab${tabs.length !== 1 ? 's' : ''}`;
}

// ── Nav switching ─────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const sec = btn.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${sec}`).classList.remove('hidden');

    if (sec === 'tabs') renderTabList();
    if (sec === 'settings') initSettings();
  });
});

// ── Button states ─────────────────────────────────────────────────
function setRunning(btn, running) {
  if (running) {
    btn.classList.add('running');
    btn.disabled = true;
    const arrow = btn.querySelector('.btn-arrow');
    if (arrow) {
      arrow._original = arrow.textContent;
      arrow.innerHTML = '<span class="spinner"></span>';
    }
  } else {
    btn.classList.remove('running');
    btn.disabled = false;
    const arrow = btn.querySelector('.btn-arrow');
    if (arrow && arrow._original) {
      arrow.textContent = arrow._original;
      delete arrow._original;
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Group by Domain
// ─────────────────────────────────────────────────────────────────
async function groupByDomain() {
  const btn = document.getElementById('btn-group');
  setRunning(btn, true);

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Build apex-domain -> tabs map (so docs.nvidia.com & nvidia.com share one group)
    const domainMap = new Map();
    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue;
      let hostname;
      try { hostname = new URL(tab.url).hostname.replace(/^www\./, ''); } catch { continue; }
      const apex = getApexDomain(hostname);
      if (!domainMap.has(apex)) domainMap.set(apex, []);
      domainMap.get(apex).push(tab);
    }

    colorIndex = 0;
    let groupedCount = 0;
    for (const [apex, domainTabs] of domainMap.entries()) {
      if (domainTabs.length < 2) continue;
      const tabIds = domainTabs.map(t => t.id);
      const color = nextColor();
      const groupName = getGroupName(domainTabs[0].url);

      try {
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, {
          title: groupName,
          color: color.chrome,
          collapsed: false,
        });
        groupedCount++;
      } catch (e) {
        console.warn(`Could not group ${apex}:`, e);
      }
    }

    await refreshTabCount();
    showToast(`✓ Grouped ${groupedCount} domains`, 'success');
  } catch (e) {
    showToast('Failed to group tabs', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Close Duplicates
// ─────────────────────────────────────────────────────────────────
async function closeDuplicates() {
  const btn = document.getElementById('btn-close-dupes');
  setRunning(btn, true);

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const seen = new Map(); // url → first tab
    const toClose = [];

    for (const tab of tabs) {
      const url = tab.url?.split('#')[0]; // ignore hash
      if (!url) continue;
      if (seen.has(url)) {
        toClose.push(tab.id);
      } else {
        seen.set(url, tab.id);
      }
    }

    if (toClose.length === 0) {
      showToast('No duplicate tabs found', 'success');
      return;
    }

    await chrome.tabs.remove(toClose);
    await refreshTabCount();
    showToast(`✓ Closed ${toClose.length} duplicate${toClose.length !== 1 ? 's' : ''}`, 'success');
  } catch (e) {
    showToast('Failed to close duplicates', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Sort by Domain
// ─────────────────────────────────────────────────────────────────
async function sortByDomain() {
  const btn = document.getElementById('btn-sort-domain');
  setRunning(btn, true);

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const sorted = [...tabs].sort((a, b) => {
      const da = getRootDomain(a.url || '');
      const db = getRootDomain(b.url || '');
      return da.localeCompare(db);
    });

    for (let i = 0; i < sorted.length; i++) {
      await chrome.tabs.move(sorted[i].id, { index: i });
    }

    showToast('✓ Sorted by domain', 'success');
  } catch (e) {
    showToast('Failed to sort', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Sort by Title
// ─────────────────────────────────────────────────────────────────
async function sortByTitle() {
  const btn = document.getElementById('btn-sort-title');
  setRunning(btn, true);

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const sorted = [...tabs].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );

    for (let i = 0; i < sorted.length; i++) {
      await chrome.tabs.move(sorted[i].id, { index: i });
    }

    showToast('✓ Sorted by title', 'success');
  } catch (e) {
    showToast('Failed to sort', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Expand All Groups
// ─────────────────────────────────────────────────────────────────
async function expandAllGroups() {
  const btn = document.getElementById('btn-expand');
  setRunning(btn, true);

  try {
    const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    if (groups.length === 0) {
      showToast('No tab groups found', 'success');
      return;
    }
    for (const group of groups) {
      await chrome.tabGroups.update(group.id, { collapsed: false });
    }
    showToast(`✓ Expanded ${groups.length} group${groups.length !== 1 ? 's' : ''}`, 'success');
  } catch (e) {
    showToast('Failed to expand groups', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Collapse All Groups
// ─────────────────────────────────────────────────────────────────
async function collapseAllGroups() {
  const btn = document.getElementById('btn-collapse');
  setRunning(btn, true);

  try {
    const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    if (groups.length === 0) {
      showToast('No tab groups found', 'success');
      return;
    }
    for (const group of groups) {
      await chrome.tabGroups.update(group.id, { collapsed: true });
    }
    showToast(`✓ Collapsed ${groups.length} group${groups.length !== 1 ? 's' : ''}`, 'success');
  } catch (e) {
    showToast('Failed to collapse groups', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Ungroup All
// ─────────────────────────────────────────────────────────────────
async function ungroupAll() {
  const btn = document.getElementById('btn-ungroup');
  setRunning(btn, true);

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const grouped = tabs.filter(t => t.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE);

    if (grouped.length === 0) {
      showToast('No grouped tabs found', 'success');
      return;
    }

    await chrome.tabs.ungroup(grouped.map(t => t.id));
    showToast(`✓ Ungrouped ${grouped.length} tab${grouped.length !== 1 ? 's' : ''}`, 'success');
  } catch (e) {
    showToast('Failed to ungroup', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// ACTION: Merge All Windows
// ─────────────────────────────────────────────────────────────────
async function mergeAllWindows() {
  const btn = document.getElementById('btn-merge');
  setRunning(btn, true);

  try {
    const windows = await chrome.windows.getAll({ populate: true });

    if (windows.length <= 1) {
      showToast('Only one window open', 'success');
      return;
    }

    // Use current window as target
    const currentWindow = await chrome.windows.getCurrent();
    const targetId = currentWindow.id;
    let movedCount = 0;

    for (const win of windows) {
      if (win.id === targetId) continue;
      const tabIds = win.tabs.map(t => t.id);
      if (tabIds.length === 0) continue;

      await chrome.tabs.move(tabIds, { windowId: targetId, index: -1 });
      movedCount += tabIds.length;
    }

    await refreshTabCount();
    showToast(`✓ Merged ${windows.length - 1} window${windows.length - 1 !== 1 ? 's' : ''}`, 'success');
  } catch (e) {
    showToast('Failed to merge windows', 'error');
    console.error(e);
  } finally {
    setRunning(btn, false);
  }
}

// ─────────────────────────────────────────────────────────────────
// All Tabs View
// ─────────────────────────────────────────────────────────────────
async function renderTabList(filter = '') {
  const list = document.getElementById('tabList');
  list.innerHTML = '<div class="loading-msg">Loading…</div>';

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const lc = filter.toLowerCase();

  const filtered = filter
    ? tabs.filter(t =>
        (t.title || '').toLowerCase().includes(lc) ||
        (t.url || '').toLowerCase().includes(lc)
      )
    : tabs;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="loading-msg">No tabs match</div>';
    return;
  }

  // Group by apex domain for display
  const domainMap = new Map();
  for (const tab of filtered) {
    let hostname;
    try { hostname = new URL(tab.url || '').hostname.replace(/^www\./, ''); } catch { hostname = 'other'; }
    const apex = getApexDomain(hostname);
    if (!domainMap.has(apex)) domainMap.set(apex, []);
    domainMap.get(apex).push(tab);
  }

  list.innerHTML = '';
  const domains = [...domainMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  let ci = 0;

  for (const [apex, domainTabs] of domains) {
    const color = DOMAIN_COLORS[ci % DOMAIN_COLORS.length];
    ci++;
    const displayName = getGroupName(domainTabs[0].url || '');

    const groupEl = document.createElement('div');
    groupEl.className = 'domain-group';

    const header = document.createElement('div');
    header.className = 'domain-header';
    header.innerHTML = `
      <span class="domain-dot" style="background:${color.hex}"></span>
      <span class="domain-name">${displayName}</span>
      <span class="domain-count">${domainTabs.length}</span>
    `;

    const tabsEl = document.createElement('div');
    tabsEl.className = 'domain-tabs';

    header.addEventListener('click', () => {
      tabsEl.style.display = tabsEl.style.display === 'none' ? '' : 'none';
    });

    for (const tab of domainTabs) {
      const item = document.createElement('div');
      item.className = 'tab-item';

      const faviconUrl = tab.favIconUrl
        ? tab.favIconUrl
        : `https://www.google.com/s2/favicons?domain=${getRootDomain(tab.url || '')}&sz=32`;

      item.innerHTML = `
        <img class="tab-favicon" src="${faviconUrl}" onerror="this.style.display='none'" />
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title || 'Untitled')}</div>
          <div class="tab-url">${escapeHtml(shortUrl(tab.url || ''))}</div>
        </div>
        <button class="tab-close" data-id="${tab.id}" title="Close tab">✕</button>
      `;

      // Click to switch to tab
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) return;
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
      });

      // Close button
      item.querySelector('.tab-close').addEventListener('click', async (e) => {
        e.stopPropagation();
        await chrome.tabs.remove(tab.id);
        item.style.opacity = '0';
        item.style.transform = 'translateX(8px)';
        item.style.transition = 'opacity 150ms, transform 150ms';
        setTimeout(() => item.remove(), 150);
        await refreshTabCount();
      });

      tabsEl.appendChild(item);
    }

    groupEl.appendChild(header);
    groupEl.appendChild(tabsEl);
    list.appendChild(groupEl);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== '/' ? u.pathname.slice(0, 30) : '');
  } catch {
    return url.slice(0, 40);
  }
}

// ── Search ────────────────────────────────────────────────────────
let searchDebounce = null;
document.getElementById('tabSearch').addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => renderTabList(e.target.value), 180);
});

// ── Wire up buttons ───────────────────────────────────────────────
document.getElementById('btn-group').addEventListener('click', groupByDomain);
document.getElementById('btn-close-dupes').addEventListener('click', closeDuplicates);
document.getElementById('btn-sort-domain').addEventListener('click', sortByDomain);
document.getElementById('btn-sort-title').addEventListener('click', sortByTitle);
document.getElementById('btn-expand').addEventListener('click', expandAllGroups);
document.getElementById('btn-collapse').addEventListener('click', collapseAllGroups);
document.getElementById('btn-ungroup').addEventListener('click', ungroupAll);
document.getElementById('btn-merge').addEventListener('click', mergeAllWindows);

// ─────────────────────────────────────────────────────────────────
// SETTINGS — persist toggles via chrome.storage.local
// ─────────────────────────────────────────────────────────────────
const DEFAULTS = { autoJoin: false, autoGroup: false };

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(DEFAULTS, resolve);
  });
}

async function saveSetting(key, value) {
  return new Promise(resolve => chrome.storage.local.set({ [key]: value }, resolve));
}

async function initSettings() {
  const settings = await getSettings();

  const chkJoin  = document.getElementById('chk-autojoin');
  const chkGroup = document.getElementById('chk-autogroup');

  chkJoin.checked  = settings.autoJoin;
  chkGroup.checked = settings.autoGroup;

  updateSettingCardStyle('chk-autojoin',  settings.autoJoin);
  updateSettingCardStyle('chk-autogroup', settings.autoGroup);

  chkJoin.addEventListener('change', async () => {
    await saveSetting('autoJoin', chkJoin.checked);
    updateSettingCardStyle('chk-autojoin', chkJoin.checked);
    showToast(chkJoin.checked ? '✓ Auto-join enabled' : 'Auto-join disabled', 'success');
  });

  chkGroup.addEventListener('change', async () => {
    await saveSetting('autoGroup', chkGroup.checked);
    updateSettingCardStyle('chk-autogroup', chkGroup.checked);
    showToast(chkGroup.checked ? '✓ Auto-group enabled' : 'Auto-group disabled', 'success');
  });
}

function updateSettingCardStyle(checkboxId, active) {
  const card = document.getElementById(checkboxId)?.closest('.setting-card');
  if (!card) return;
  card.classList.toggle('active-setting', active);
}

// ─────────────────────────────────────────────────────────────────
// AUTOMATION — handle new tabs
// ─────────────────────────────────────────────────────────────────

// Debounce map to avoid double-firing on rapid tab creation
const pendingAutomate = new Set();

async function handleNewTab(tab) {
  if (!tab.id || pendingAutomate.has(tab.id)) return;
  // Wait for tab URL to be available (onCreated fires before URL is set)
  // We'll handle it in onUpdated when status = 'complete' or URL changes
}

async function automateTab(tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) return; // already in a group

  const settings = await getSettings();
  if (!settings.autoJoin && !settings.autoGroup) return;

  let hostname;
  try { hostname = new URL(tab.url).hostname.replace(/^www\./, ''); } catch { return; }
  const apex = getApexDomain(hostname);

  // Get all tabs in current window
  const allTabs = await chrome.tabs.query({ windowId: tab.windowId });

  // ── Feature 1: Auto-join existing group ──────────────────────
  if (settings.autoJoin) {
    const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
    const groupName = getGroupName(tab.url);

    // Find a group whose title matches this tab's domain name
    const matchingGroup = groups.find(g => g.title === groupName);
    if (matchingGroup) {
      try {
        await chrome.tabs.group({ tabIds: [tab.id], groupId: matchingGroup.id });
        return; // joined, no need for auto-group check
      } catch (e) {
        console.warn('Auto-join failed:', e);
      }
    }
  }

  // ── Feature 2: Auto-group new domain when 2+ tabs match ──────
  if (settings.autoGroup) {
    // Find other ungrouped tabs from the same apex domain
    const siblings = allTabs.filter(t =>
      t.id !== tab.id &&
      t.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE &&
      t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
    ).filter(t => {
      try {
        const h = new URL(t.url).hostname.replace(/^www\./, '');
        return getApexDomain(h) === apex;
      } catch { return false; }
    });

    if (siblings.length >= 1) {
      // 2+ tabs from same domain (this tab + at least 1 sibling)
      const tabIds = [tab.id, ...siblings.map(t => t.id)];
      const groupName = getGroupName(tab.url);
      const color = DOMAIN_COLORS[Math.abs(apex.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % DOMAIN_COLORS.length];

      try {
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, {
          title: groupName,
          color: color.chrome,
          collapsed: false,
        });
      } catch (e) {
        console.warn('Auto-group failed:', e);
      }
    }
  }
}

// ── Init ──────────────────────────────────────────────────────────
refreshTabCount();

// Update count when tabs change
chrome.tabs.onCreated.addListener(refreshTabCount);
chrome.tabs.onRemoved.addListener(refreshTabCount);

// Automation: fire when a tab finishes loading (URL is stable)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when URL is first set (status=loading) to respond quickly,
  // but skip internal/empty pages
  if (changeInfo.url && tab.url && !tab.url.startsWith('chrome')) {
    automateTab(tab);
  }
});
