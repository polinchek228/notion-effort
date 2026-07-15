(function() {
  'use strict';

  let interceptedCount = 0;
  let swappedCount = 0;
  let settings = { model: null, effort: null };

  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data && e.data.type === 'NOTION_EFFORT_SETTINGS') {
      settings.model = e.data.model || null;
      settings.effort = e.data.effort || null;
    }
    if (e.data && e.data.type === 'NOTION_EFFORT_PING') {
      window.postMessage({
        type: 'NOTION_EFFORT_PONG',
        interceptCount: interceptedCount,
        swappedCount: swappedCount
      }, '*');
    }
  });

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, options] = args;

    const isTarget = (
      (typeof url === 'string' && url.includes('/api/v3/runInferenceTranscript')) ||
      (url instanceof Request && url.url.includes('/api/v3/runInferenceTranscript'))
    );

    if (!isTarget || !options || !options.body) {
      return originalFetch.apply(this, args);
    }

    interceptedCount++;

    try {
      let body = typeof options.body === 'string' ? JSON.parse(options.body) : null;
      if (!body || !body.transcript) {
        return originalFetch.apply(this, args);
      }

      let modified = false;
      const configStep = body.transcript.find(s => s.type === 'config');

      if (configStep && configStep.value) {
        if (settings.model && configStep.value.model !== settings.model) {
          configStep.value.model = settings.model;
          modified = true;
        }
        if (settings.effort && configStep.value.reasoningEffort !== undefined) {
          if (configStep.value.reasoningEffort !== settings.effort) {
            configStep.value.reasoningEffort = settings.effort;
            modified = true;
          }
        }
      }

      if (modified) {
        swappedCount++;
        options.body = JSON.stringify(body);
        if (url instanceof Request) {
          return originalFetch(new Request(url, { ...options, body: options.body }));
        }
      }

      return originalFetch.apply(this, args);
    } catch (e) {
      return originalFetch.apply(this, args);
    }
  };
})();
