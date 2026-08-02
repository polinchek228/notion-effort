(function() {
  'use strict';

  let interceptedCount = 0;
  let swappedCount = 0;
let settings = {
  model: null,
  effort: null,
  modelEfforts: {},
  maxIntelligence: true,
  pipelineEnabled: false,
  pipelineModel1: null,
  pipelineModel2: null,
  pipelineModel1Effort: null,
  pipelineModel2Effort: null,
};

  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data && e.data.type === 'NOTION_EFFORT_SETTINGS') {
      settings.model = e.data.model || null;
      settings.effort = e.data.effort || null;
      settings.modelEfforts = e.data.modelEfforts || {};
      settings.maxIntelligence = e.data.maxIntelligence !== false;
      settings.pipelineEnabled = e.data.pipelineEnabled || false;
      settings.pipelineModel1 = e.data.pipelineModel1 || null;
      settings.pipelineModel2 = e.data.pipelineModel2 || null;
      settings.pipelineModel1Effort = e.data.pipelineModel1Effort || null;
      settings.pipelineModel2Effort = e.data.pipelineModel2Effort || null;
    }
    if (e.data && e.data.type === 'NOTION_EFFORT_PING') {
      window.postMessage({
        type: 'NOTION_EFFORT_PONG',
        interceptCount: interceptedCount,
        swappedCount: swappedCount,
      }, '*');
    }
  });

  function extractAssistantText(ndjsonText) {
    let text = '';
    const lines = ndjsonText.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'patch' && Array.isArray(obj.v)) {
          for (const patch of obj.v) {
            if (
              patch.o === 'p' &&
              typeof patch.p === 'string' &&
              patch.p.endsWith('/content') &&
              typeof patch.v === 'string'
            ) {
              text += patch.v;
            }
          }
        }
      } catch (e) {
        // ignore malformed lines
      }
    }
    return text;
  }

  function hasUserStep(body) {
    return body && body.transcript && body.transcript.some((s) => s.type === 'user');
  }

  function buildPipelineBody(originalBody, model1Text, model2Model) {
    const body = JSON.parse(JSON.stringify(originalBody));
    const configStep = body.transcript.find((s) => s.type === 'config');
    const userStep = body.transcript.find((s) => s.type === 'user');

    if (configStep && configStep.value) {
      configStep.value.model = model2Model;
    }

    if (userStep && userStep.value && model1Text) {
      const originalText =
        userStep.value[0] && userStep.value[0][0] ? userStep.value[0][0] : '';
      userStep.value[0][0] =
        '[First pass analysis:\n' + model1Text + ']\n\n---\n\n' + originalText;
    }

    return body;
  }

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const [url, options] = args;

    const isTarget =
      (typeof url === 'string' && url.includes('/api/v3/runInferenceTranscript')) ||
      (url instanceof Request && url.url.includes('/api/v3/runInferenceTranscript'));

    if (!isTarget || !options || !options.body) {
      return originalFetch.apply(this, args);
    }

    interceptedCount++;

    try {
      let body = typeof options.body === 'string' ? JSON.parse(options.body) : null;
      if (!body || !body.transcript) {
        return originalFetch.apply(this, args);
      }

      if (
        settings.pipelineEnabled &&
        settings.pipelineModel1 &&
        settings.pipelineModel2 &&
        hasUserStep(body)
      ) {
        const pipelineBody1 = JSON.parse(JSON.stringify(body));
        const config1 = pipelineBody1.transcript.find((s) => s.type === 'config');
        if (config1 && config1.value) {
          config1.value.model = settings.pipelineModel1;
          if (settings.pipelineModel1Effort) {
            config1.value.reasoningEffort = settings.pipelineModel1Effort;
          }
          if (settings.maxIntelligence) {
            config1.value.useContextualCoreDocsAutoLoad = true;
            config1.value.useDocPreviewsForCoreAutoLoad = true;
          }
        }

        const options1 = {
          ...options,
          body: JSON.stringify(pipelineBody1),
        };

        try {
          const response1 = await originalFetch(
            url instanceof Request ? new Request(url, options1) : url,
            options1
          );

          if (!response1.ok) {
            return originalFetch.apply(this, args);
          }

          const ndjsonText = await response1.text();
          const model1Text = extractAssistantText(ndjsonText);

          if (!model1Text) {
            return originalFetch.apply(this, args);
          }

          const pipelineBody2 = buildPipelineBody(body, model1Text, settings.pipelineModel2);
          const config2 = pipelineBody2.transcript.find((s) => s.type === 'config');
          if (config2 && config2.value && settings.pipelineModel2Effort) {
            config2.value.reasoningEffort = settings.pipelineModel2Effort;
          }

          swappedCount++;
          const options2 = {
            ...options,
            body: JSON.stringify(pipelineBody2),
          };

          if (url instanceof Request) {
            return originalFetch(new Request(url, options2));
          }
          return originalFetch(url, options2);
        } catch (pipelineError) {
          return originalFetch.apply(this, args);
        }
      }

      let modified = false;
      const configStep = body.transcript.find((s) => s.type === 'config');

      if (configStep && configStep.value) {
        if (settings.model && configStep.value.model !== settings.model) {
          configStep.value.model = settings.model;
          modified = true;
        }

        const activeModel = settings.model || configStep.value.model;
        const perModelEffort = settings.modelEfforts[activeModel];
        const targetEffort = perModelEffort || settings.effort;

        if (targetEffort) {
          if (configStep.value.reasoningEffort !== targetEffort) {
            configStep.value.reasoningEffort = targetEffort;
            modified = true;
          }
        }

        if (settings.maxIntelligence) {
          if (configStep.value.useContextualCoreDocsAutoLoad !== true) {
            configStep.value.useContextualCoreDocsAutoLoad = true;
            modified = true;
          }
          if (configStep.value.useDocPreviewsForCoreAutoLoad !== true) {
            configStep.value.useDocPreviewsForCoreAutoLoad = true;
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
