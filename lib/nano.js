const COLORS = ["blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange", "grey"];

const SYSTEM_PROMPT = `You categorize browser tabs into logical groups. You receive a JSON array of tabs (id, title, url). Return ONLY a JSON array of groups with this exact format:
[{"label": "Group Name", "tabIds": [1, 2, 3]}]

Rules:
- Each tab must appear in exactly one group
- Use 3-8 groups depending on tab count
- Labels should be short (1-3 words)
- Group by topic/purpose, not just domain
- Separate work from personal content`;

export async function isNanoAvailable() {
  try {
    if (typeof LanguageModel === "undefined") return false;
    const status = await LanguageModel.availability();
    return status === "available" || status === "readily";
  } catch {
    return false;
  }
}

export async function classifyWithNano(tabs) {
  const session = await LanguageModel.create({
    initialPrompts: [
      { role: "system", content: SYSTEM_PROMPT }
    ],
  });

  const batches = batchTabs(tabs, 30);
  let allGroups = [];

  for (const batch of batches) {
    const input = JSON.stringify(
      batch.map((t) => ({
        id: t.id,
        title: t.title,
        url: new URL(t.url).hostname + new URL(t.url).pathname.slice(0, 50),
      }))
    );

    const response = await session.prompt(`Categorize these tabs:\n${input}`);
    const parsed = extractJSON(response);

    if (!parsed || !Array.isArray(parsed)) {
      throw new Error("Nano returned invalid JSON");
    }

    allGroups.push(...parsed);
  }

  session.destroy();

  if (batches.length > 1) {
    allGroups = mergeGroups(allGroups);
  }

  return validateGroups(allGroups, tabs);
}

function batchTabs(tabs, size) {
  const batches = [];
  for (let i = 0; i < tabs.length; i += size) {
    batches.push(tabs.slice(i, i + size));
  }
  return batches;
}

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function mergeGroups(groups) {
  const merged = new Map();
  for (const g of groups) {
    const key = g.label.toLowerCase().trim();
    if (merged.has(key)) {
      merged.get(key).tabIds.push(...g.tabIds);
    } else {
      merged.set(key, { label: g.label, tabIds: [...g.tabIds] });
    }
  }
  return [...merged.values()];
}

function validateGroups(groups, tabs) {
  const validIds = new Set(tabs.map((t) => t.id));
  const assigned = new Set();

  const cleaned = groups
    .map((g) => ({
      label: g.label || "Other",
      tabIds: (g.tabIds || []).filter((id) => validIds.has(id) && !assigned.has(id)),
      color: null,
    }))
    .filter((g) => {
      g.tabIds.forEach((id) => assigned.add(id));
      return g.tabIds.length > 0;
    });

  const unassigned = tabs.filter((t) => !assigned.has(t.id));
  if (unassigned.length > 0) {
    cleaned.push({
      label: "Other",
      tabIds: unassigned.map((t) => t.id),
      color: null,
    });
  }

  cleaned.forEach((g, i) => {
    g.color = COLORS[i % COLORS.length];
  });

  return cleaned;
}
