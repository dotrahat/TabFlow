// TabFlow — background.js

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// ── Shared domain utilities ───────────────────────────────────────

const BRAND_NAMES = {
  'youtube.com':'YouTube','google.com':'Google','gmail.com':'Gmail',
  'github.com':'GitHub','gitlab.com':'GitLab','reddit.com':'Reddit',
  'twitter.com':'Twitter','x.com':'Twitter','facebook.com':'Facebook',
  'instagram.com':'Instagram','linkedin.com':'LinkedIn','netflix.com':'Netflix',
  'spotify.com':'Spotify','amazon.com':'Amazon','wikipedia.org':'Wikipedia',
  'notion.so':'Notion','figma.com':'Figma','vercel.com':'Vercel',
  'netlify.com':'Netlify','microsoft.com':'Microsoft','apple.com':'Apple',
  'nvidia.com':'Nvidia','unitree.com':'Unitree','openai.com':'OpenAI',
  'anthropic.com':'Anthropic','claude.ai':'Claude','chat.openai.com':'ChatGPT',
  'huggingface.co':'HuggingFace','discord.com':'Discord','slack.com':'Slack',
  'zoom.us':'Zoom','dropbox.com':'Dropbox','drive.google.com':'Google Drive',
  'docs.google.com':'Google Docs','sheets.google.com':'Google Sheets',
  'meet.google.com':'Google Meet','calendar.google.com':'Google Calendar',
  'maps.google.com':'Google Maps','news.ycombinator.com':'Hacker News',
  'medium.com':'Medium','dev.to':'Dev.to','twitch.tv':'Twitch',
  'tiktok.com':'TikTok','shopify.com':'Shopify','stripe.com':'Stripe',
  'atlassian.com':'Atlassian','trello.com':'Trello','asana.com':'Asana',
  'linear.app':'Linear','canva.com':'Canva','miro.com':'Miro',
  'hubspot.com':'HubSpot','salesforce.com':'Salesforce',
  'cloudflare.com':'Cloudflare','digitalocean.com':'DigitalOcean',
  'docker.com':'Docker','mongodb.com':'MongoDB','datadog.com':'Datadog',
  'sentry.io':'Sentry','localhost':'Localhost',
};

const TWO_PART_TLDS = new Set([
  'co.uk','co.jp','co.in','co.nz','co.za','co.kr','co.id',
  'com.au','com.br','com.cn','com.mx','com.ar','com.tr',
  'org.uk','net.au','gov.uk','ac.uk','me.uk',
]);

const DOMAIN_COLORS = [
  'blue','cyan','green','yellow','orange','pink','purple','red','grey'
];

function getApexDomain(hostname) {
  hostname = hostname.replace(/^www\./, '');
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (TWO_PART_TLDS.has(lastTwo)) return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

function getGroupName(url) {
  let hostname;
  try { hostname = new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Other'; }
  if (BRAND_NAMES[hostname]) return BRAND_NAMES[hostname];
  const apex = getApexDomain(hostname);
  if (BRAND_NAMES[apex]) return BRAND_NAMES[apex];
  const name = apex.split('.')[0];
  if (/^[A-Z]{2,4}$/.test(name)) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getSettings() {
  return new Promise(resolve =>
    chrome.storage.local.get({ autoJoin: false, autoGroup: false }, resolve)
  );
}

// ── Automation listener ───────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) return;

  const settings = await getSettings();
  if (!settings.autoJoin && !settings.autoGroup) return;

  let hostname;
  try { hostname = new URL(tab.url).hostname.replace(/^www\./, ''); } catch { return; }
  const apex = getApexDomain(hostname);
  const groupName = getGroupName(tab.url);

  // Auto-join: find existing group by title
  if (settings.autoJoin) {
    try {
      const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
      const match = groups.find(g => g.title === groupName);
      if (match) {
        await chrome.tabs.group({ tabIds: [tabId], groupId: match.id });
        return;
      }
    } catch (e) { console.warn('BG auto-join failed:', e); }
  }

  // Auto-group: create group if 2+ same-domain ungrouped tabs exist
  if (settings.autoGroup) {
    try {
      const allTabs = await chrome.tabs.query({ windowId: tab.windowId });
      const siblings = allTabs.filter(t =>
        t.id !== tabId &&
        t.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE &&
        t.url && !t.url.startsWith('chrome')
      ).filter(t => {
        try {
          return getApexDomain(new URL(t.url).hostname.replace(/^www\./, '')) === apex;
        } catch { return false; }
      });

      if (siblings.length >= 1) {
        const tabIds = [tabId, ...siblings.map(t => t.id)];
        const colorIdx = Math.abs(apex.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % DOMAIN_COLORS.length;
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, {
          title: groupName,
          color: DOMAIN_COLORS[colorIdx],
          collapsed: false,
        });
      }
    } catch (e) { console.warn('BG auto-group failed:', e); }
  }
});
