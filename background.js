chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    selectedModel: "almond-croissant-low",
    selectedEffort: "medium",
    stats: { requests: 0, swaps: 0 }
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATS_UPDATE") {
    chrome.runtime.sendMessage(msg).catch(() => {});
    chrome.storage.local.set({ stats: { requests: msg.requests, swaps: msg.swaps } });
  }
});
