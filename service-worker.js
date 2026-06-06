import { classifyWithNano, isNanoAvailable } from "./lib/nano.js";
import { groupByDomain } from "./lib/fallback.js";
import { applyGroups, ungroupAllTabs } from "./lib/tab-manager.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "sort-tabs") {
    sortTabs(message.options).then(sendResponse);
    return true;
  }
  if (message.type === "unsort-tabs") {
    ungroupAllTabs().then(sendResponse);
    return true;
  }
  if (message.type === "get-status") {
    getStatus().then(sendResponse);
    return true;
  }
});

async function getStatus() {
  const nano = await isNanoAvailable();
  return { nanoAvailable: nano };
}

async function sortTabs(options = {}) {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });

    const sortable = tabs.filter((t) => 
      t.url && 
      !t.url.startsWith("chrome://") && 
      !t.url.startsWith("chrome-untrusted://") &&
      !t.url.startsWith("dia://")
    );

    if (sortable.length < 2) {
      return { success: false, message: "Not enough tabs to sort" };
    }

    const tabData = sortable.map((t) => ({
      id: t.id,
      title: t.title || "",
      url: t.url,
    }));

    let groups;
    const nano = await isNanoAvailable();

    if (nano && !options.forceFallback) {
      try {
        groups = await classifyWithNano(tabData);
      } catch (e) {
        console.warn("Nano classification failed, using fallback:", e);
        groups = groupByDomain(tabData);
      }
    } else {
      groups = groupByDomain(tabData);
    }

    await applyGroups(groups);

    return {
      success: true,
      groupCount: groups.length,
      method: nano && !options.forceFallback ? "nano" : "fallback",
    };
  } catch (e) {
    console.error("Sort failed:", e);
    return { success: false, message: e.message };
  }
}
