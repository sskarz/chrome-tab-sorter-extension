chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "embed-tabs") {
    sendResponse({ error: "Embeddings not yet configured" });
  }
});
