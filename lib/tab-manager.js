export async function applyGroups(groups) {
  for (const group of groups) {
    if (group.tabIds.length === 0) continue;
    const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
    await chrome.tabGroups.update(groupId, {
      title: group.label,
      color: group.color || "grey",
      collapsed: false,
    });
  }
}

export async function ungroupAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groupedTabs = tabs.filter((t) => t.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE);
  if (groupedTabs.length === 0) {
    return { success: true, message: "No grouped tabs" };
  }
  await chrome.tabs.ungroup(groupedTabs.map((t) => t.id));
  return { success: true, ungrouped: groupedTabs.length };
}
