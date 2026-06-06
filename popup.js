const sortBtn = document.getElementById("sort-btn");
const unsortBtn = document.getElementById("unsort-btn");
const statusEl = document.getElementById("status");
const forceFallback = document.getElementById("force-fallback");
const aiBadge = document.getElementById("ai-badge");

chrome.runtime.sendMessage({ type: "get-status" }, (res) => {
  if (res?.nanoAvailable) {
    aiBadge.textContent = "Gemini Nano available";
    aiBadge.className = "badge nano";
  } else {
    aiBadge.textContent = "Using domain-based sorting";
    aiBadge.className = "badge fallback";
  }
});

chrome.storage.local.get("forceFallback", (data) => {
  forceFallback.checked = !!data.forceFallback;
});

forceFallback.addEventListener("change", () => {
  chrome.storage.local.set({ forceFallback: forceFallback.checked });
});

sortBtn.addEventListener("click", async () => {
  setStatus("Sorting tabs...", "loading");
  setButtons(false);
  chrome.runtime.sendMessage(
    { type: "sort-tabs", options: { forceFallback: forceFallback.checked } },
    (res) => {
      if (res?.success) {
        const method = res.method === "nano" ? "AI" : "domain";
        setStatus(`Sorted into ${res.groupCount} groups (${method})`, "success");
      } else {
        setStatus(res?.message || "Sort failed", "error");
      }
      setButtons(true);
    }
  );
});

unsortBtn.addEventListener("click", async () => {
  setStatus("Ungrouping...", "loading");
  setButtons(false);
  chrome.runtime.sendMessage({ type: "unsort-tabs" }, (res) => {
    if (res?.success) {
      setStatus("All tabs ungrouped", "success");
    } else {
      setStatus("Failed to ungroup", "error");
    }
    setButtons(true);
  });
});

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type || ""}`;
}

function setButtons(enabled) {
  sortBtn.disabled = !enabled;
  unsortBtn.disabled = !enabled;
}
