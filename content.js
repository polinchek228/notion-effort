(function() {
  'use strict';

  let interceptCount = 0;
  let swapCount = 0;

  function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  injectScript();

  function loadAndSendSettings() {
    chrome.storage.local.get(["selectedModel", "selectedEffort", "modelEfforts"], (data) => {
      window.postMessage({
        type: 'NOTION_EFFORT_SETTINGS',
        model: data.selectedModel || null,
        effort: data.selectedEffort || null,
        modelEfforts: data.modelEfforts || {}
      }, '*');
    });
  }

  loadAndSendSettings();

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'PING') {
      sendResponse({ interceptCount, swapCount });
      return true;
    }
    if (msg.type === 'UPDATE_SETTINGS') {
      window.postMessage({
        type: 'NOTION_EFFORT_SETTINGS',
        model: msg.model || null,
        effort: msg.effort || null,
        modelEfforts: msg.modelEfforts || {}
      }, '*');
      sendResponse({ ok: true });
      return true;
    }
  });

  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data && e.data.type === 'NOTION_EFFORT_PONG') {
      interceptCount = e.data.interceptCount;
      swapCount = e.data.swappedCount;
      chrome.runtime.sendMessage({
        type: 'STATS_UPDATE',
        requests: interceptCount,
        swaps: swapCount
      });
    }
  });

  setInterval(() => {
    window.postMessage({ type: 'NOTION_EFFORT_PING' }, '*');
  }, 2000);
})();
