const COLORS = ["blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange", "grey"];

const CATEGORY_RULES = [
  { pattern: /github\.com|gitlab\.com|bitbucket\.org/, label: "Code" },
  { pattern: /stackoverflow\.com|stackexchange\.com/, label: "Code" },
  { pattern: /docs\.google\.com\/document/, label: "Docs" },
  { pattern: /docs\.google\.com\/spreadsheets/, label: "Sheets" },
  { pattern: /docs\.google\.com\/presentation/, label: "Slides" },
  { pattern: /notion\.so|coda\.io|confluence/, label: "Docs" },
  { pattern: /mail\.google\.com|outlook\.live\.com/, label: "Email" },
  { pattern: /slack\.com|discord\.com|teams\.microsoft/, label: "Chat" },
  { pattern: /youtube\.com|netflix\.com|twitch\.tv|vimeo\.com/, label: "Video" },
  { pattern: /twitter\.com|x\.com|reddit\.com|facebook\.com|instagram\.com|linkedin\.com/, label: "Social" },
  { pattern: /amazon\.|ebay\.|etsy\.com|shopify/, label: "Shopping" },
  { pattern: /figma\.com|canva\.com|dribbble\.com/, label: "Design" },
  { pattern: /jira|linear\.app|asana\.com|trello\.com|monday\.com/, label: "Projects" },
  { pattern: /calendar\.google|outlook\.office/, label: "Calendar" },
  { pattern: /drive\.google\.com|dropbox\.com|box\.com/, label: "Files" },
  { pattern: /localhost|127\.0\.0\.1/, label: "Dev" },
  { pattern: /news\.ycombinator|techcrunch|theverge/, label: "News" },
  { pattern: /wikipedia\.org/, label: "Reference" },
];

export function groupByDomain(tabs) {
  const groups = new Map();
  for (const tab of tabs) {
    let label = categorize(tab.url);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(tab.id);
  }

  const result = [];
  let colorIdx = 0;
  for (const [label, tabIds] of groups) {
    result.push({ label, tabIds, color: COLORS[colorIdx % COLORS.length] });
    colorIdx++;
  }
  return result;
}

function categorize(url) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(url)) return rule.label;
  }
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const parts = hostname.split(".");
    const name = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Other";
  }
}
