const MODELS = [
  { model: "orange-mousse", name: "GPT-5.6 Sol", family: "openai", efforts: ["medium", "high"], speed: 3, intelligence: 5, cost: 5 },
  { model: "orchid-muffin", name: "GPT-5.6 Terra", family: "openai", efforts: ["medium", "high"], speed: 4, intelligence: 4, cost: 4 },
  { model: "olive-jellyroll", name: "GPT-5.6 Luna", family: "openai", efforts: ["medium", "high"], speed: 5, intelligence: 3, cost: 2 },
  { model: "oatmeal-cookie", name: "GPT-5.2", family: "openai", efforts: ["medium", "high"], speed: 4, intelligence: 4, cost: 3 },
  { model: "oval-kumquat-medium", name: "GPT-5.4", family: "openai", efforts: ["medium", "high"], speed: 4, intelligence: 5, cost: 4 },
  { model: "opal-quince-medium", name: "GPT-5.5", family: "openai", efforts: ["medium", "high"], speed: 4, intelligence: 5, cost: 5 },
  { model: "oregon-grape-medium", name: "GPT-5.4 Mini", family: "openai", efforts: ["medium"], speed: 5, intelligence: 2, cost: 2 },
  { model: "otaheite-apple-medium", name: "GPT-5.4 Nano", family: "openai", efforts: ["medium"], speed: 5, intelligence: 1, cost: 1 },
  { model: "almond-croissant-low", name: "Sonnet 4.6", family: "anthropic", efforts: ["low", "medium", "high", "max"], speed: 3, intelligence: 5, cost: 4 },
  { model: "angel-cake-high", name: "Sonnet 5", family: "anthropic", efforts: ["high"], speed: 3, intelligence: 5, cost: 3 },
  { model: "avocado-froyo-medium", name: "Opus 4.6", family: "anthropic", efforts: ["medium"], speed: 2, intelligence: 5, cost: 5 },
  { model: "apricot-sorbet-high", name: "Opus 4.7", family: "anthropic", efforts: ["high"], speed: 2, intelligence: 5, cost: 5 },
  { model: "ambrosia-tart-high", name: "Opus 4.8", family: "anthropic", efforts: ["low", "medium", "high", "max"], speed: 2, intelligence: 5, cost: 5 },
  { model: "acai-budino-high", name: "Fable 5", family: "anthropic", efforts: ["high"], speed: 2, intelligence: 5, cost: 5, restricted: true },
  { model: "agave-flan", name: "Opus 5", family: "anthropic", efforts: ["low", "medium", "high", "max"], speed: 2, intelligence: 5, cost: 5 },
  { model: "anthropic-haiku-4.5", name: "Haiku 4.5", family: "anthropic", efforts: [], speed: 5, intelligence: 2, cost: 2 },
  { model: "vertex-gemini-3.5-flash", name: "Gemini 3.5 Flash", family: "gemini", efforts: ["low", "medium", "high"], speed: 5, intelligence: 3, cost: 3 },
  { model: "galette-medium-thinking", name: "Gemini 3.1 Pro", family: "gemini", efforts: ["low", "medium"], speed: 3, intelligence: 4, cost: 3 },
  { model: "gingerbread", name: "Gemini 3 Flash", family: "gemini", efforts: [], speed: 5, intelligence: 2, cost: 2 },
  { model: "xigua-mochi-medium", name: "Grok 4.3", family: "xai", efforts: ["low", "medium", "high"], speed: 3, intelligence: 5, cost: 4 },
  { model: "strawberry-whoopiepie", name: "Grok 4.5", family: "xai", efforts: ["low", "medium", "high"], speed: 3, intelligence: 5, cost: 4 },
  { model: "xinomavro-cake", name: "Grok Build 0.1", family: "xai", efforts: [], speed: 3, intelligence: 5, cost: 4 },
  { model: "fireworks-kimi-k2.6", name: "Kimi K2.6", family: "mystery", efforts: [], speed: 5, intelligence: 4, cost: 2 },
  { model: "fireworks-kimi-k2.7", name: "Kimi K2.7 Code", family: "mystery", efforts: [], speed: 5, intelligence: 4, cost: 2 },
  { model: "fireworks-kimi-k3", name: "Kimi K3", family: "mystery", efforts: ["low", "high", "max"], speed: 3, intelligence: 5, cost: 5 },
  { model: "baseten-deepseek-v4-pro", name: "DeepSeek V4 Pro", family: "mystery", efforts: ["low", "medium", "high", "max"], speed: 3, intelligence: 5, cost: 4 },
  { model: "baseten-glm-5.2", name: "GLM 5.2", family: "mystery", efforts: ["high", "max"], speed: 3, intelligence: 5, cost: 3 },
];

function iconPath(file) { return chrome.runtime.getURL("icons/" + file); }

const FAMILY_ICONS = {
  openai:    (id) => `<img src="${iconPath("family-openai.png")}" width="16" height="16" style="border-radius:2px">`,
  anthropic: (id) => `<img src="${iconPath("family-anthropic.png")}" width="16" height="16" style="border-radius:2px">`,
  gemini:    (id) => `<img src="${iconPath("family-gemini.png")}" width="16" height="16" style="border-radius:2px">`,
  xai:       (id) => `<img src="${iconPath("family-grok.png")}" width="16" height="16" style="border-radius:2px">`,
  mystery:   (id) => `<img src="${iconPath("family-deepseek.png")}" width="16" height="16" style="border-radius:2px">`
};

let selectedModel = "almond-croissant-low";
let currentEffort = "medium";
let activePreset = null;
let menuOpen = false;
let pipelineEnabled = false;
let pipelineModel1 = "gingerbread";
let pipelineModel2 = "almond-croissant-low";
let pipelineMenuOpen1 = false;
let pipelineMenuOpen2 = false;

function init() {
  const dropdown = document.getElementById("dropdown");
  const trigger = document.getElementById("dropdown-trigger");
  const triggerIcon = document.getElementById("trigger-icon");
  const triggerName = document.getElementById("trigger-name");
  const menu = document.getElementById("dropdown-menu");
  const familyDot = document.getElementById("family-dot");
  const familyName = document.getElementById("family-name");
  const effortGroup = document.getElementById("effort-group");
  const barsSpeed = document.getElementById("bars-speed");
  const barsIntel = document.getElementById("bars-intel");
  const barsCost = document.getElementById("bars-cost");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const statRequests = document.getElementById("stat-requests");
  const statSwaps = document.getElementById("stat-swaps");
  const resetBtn = document.getElementById("reset-btn");
  const pipelineToggle = document.getElementById("pipeline-toggle");
  const pipelineModels = document.getElementById("pipeline-models");
  const pipelineTrigger1 = document.getElementById("pipeline-trigger-1");
  const pipelineTrigger2 = document.getElementById("pipeline-trigger-2");
  const pipelineMenu1 = document.getElementById("pipeline-menu-1");
  const pipelineMenu2 = document.getElementById("pipeline-menu-2");
  const pipelineName1 = document.getElementById("pipeline-trigger-name-1");
  const pipelineName2 = document.getElementById("pipeline-trigger-name-2");
  const pipelineIcon1 = document.getElementById("pipeline-trigger-icon-1");
  const pipelineIcon2 = document.getElementById("pipeline-trigger-icon-2");

  MODELS.forEach(m => {
    const item = document.createElement("div");
    item.className = "dropdown-item" + (m.model === selectedModel ? " selected" : "");
    item.dataset.model = m.model;
    item.innerHTML = `
      <span class="family-icon">${(FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || ""}</span>
      <span class="model-name">${m.name}</span>
      ${m.restricted ? '<span class="restricted">*</span>' : ""}
    `;
    item.addEventListener("click", () => selectModel(m.model));
    menu.appendChild(item);
  });

  MODELS.forEach(m => {
    const item1 = document.createElement("div");
    item1.className = "dropdown-item" + (m.model === pipelineModel1 ? " selected" : "");
    item1.dataset.model = m.model;
    item1.innerHTML = `
      <span class="family-icon">${(FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || ""}</span>
      <span class="model-name">${m.name}</span>
    `;
    item1.addEventListener("click", () => selectPipelineModel(1, m.model));
    pipelineMenu1.appendChild(item1);

    const item2 = document.createElement("div");
    item2.className = "dropdown-item" + (m.model === pipelineModel2 ? " selected" : "");
    item2.dataset.model = m.model;
    item2.innerHTML = `
      <span class="family-icon">${(FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || ""}</span>
      <span class="model-name">${m.name}</span>
    `;
    item2.addEventListener("click", () => selectPipelineModel(2, m.model));
    pipelineMenu2.appendChild(item2);
  });

  if (pipelineToggle) {
    pipelineToggle.checked = pipelineEnabled;
    if (pipelineModels) pipelineModels.style.display = pipelineEnabled ? "block" : "none";
    pipelineToggle.addEventListener("change", () => {
      pipelineEnabled = pipelineToggle.checked;
      if (pipelineModels) pipelineModels.style.display = pipelineEnabled ? "block" : "none";
      notify();
    });
  }

  if (pipelineTrigger1) {
    pipelineTrigger1.addEventListener("click", (e) => {
      e.stopPropagation();
      pipelineMenuOpen1 = !pipelineMenuOpen1;
      pipelineMenu1.classList.toggle("open", pipelineMenuOpen1);
      pipelineTrigger1.classList.toggle("open", pipelineMenuOpen1);
      if (pipelineMenu2) pipelineMenu2.classList.remove("open");
      pipelineMenuOpen2 = false;
      if (pipelineTrigger2) pipelineTrigger2.classList.remove("open");
    });
  }

  if (pipelineTrigger2) {
    pipelineTrigger2.addEventListener("click", (e) => {
      e.stopPropagation();
      pipelineMenuOpen2 = !pipelineMenuOpen2;
      pipelineMenu2.classList.toggle("open", pipelineMenuOpen2);
      pipelineTrigger2.classList.toggle("open", pipelineMenuOpen2);
      if (pipelineMenu1) pipelineMenu1.classList.remove("open");
      pipelineMenuOpen1 = false;
      if (pipelineTrigger1) pipelineTrigger1.classList.remove("open");
    });
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    menuOpen = !menuOpen;
    menu.classList.toggle("open", menuOpen);
    trigger.classList.toggle("open", menuOpen);
  });

  document.addEventListener("click", () => {
    menuOpen = false;
    menu.classList.remove("open");
    trigger.classList.remove("open");
    pipelineMenuOpen1 = false;
    pipelineMenu1.classList.remove("open");
    if (pipelineTrigger1) pipelineTrigger1.classList.remove("open");
    pipelineMenuOpen2 = false;
    pipelineMenu2.classList.remove("open");
    if (pipelineTrigger2) pipelineTrigger2.classList.remove("open");
  });

  menu.addEventListener("click", (e) => e.stopPropagation());

  function selectModel(model) {
    selectedModel = model;
    menu.querySelectorAll(".dropdown-item").forEach(item => {
      item.classList.toggle("selected", item.dataset.model === model);
    });
    const m = MODELS.find(x => x.model === model);
    if (m) {
      triggerIcon.innerHTML = (FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || "";
      triggerName.textContent = m.name;
      if (familyDot) familyDot.className = "dot " + m.family;
      if (familyName) familyName.textContent = m.family;
      renderBars(barsSpeed, m.speed);
      renderBars(barsIntel, m.intelligence);
      renderBars(barsCost, m.cost);
      document.querySelectorAll(".effort-btn").forEach(btn => {
        const e = btn.dataset.effort;
        const ok = m.efforts.length === 0 || m.efforts.includes(e);
        btn.style.opacity = ok ? "1" : "0.3";
        btn.style.pointerEvents = ok ? "auto" : "none";
        btn.classList.toggle("active", e === currentEffort);
      });
    }
    menuOpen = false;
    menu.classList.remove("open");
    trigger.classList.remove("open");
    chrome.storage.local.set({ selectedModel: model });
    notify();
  }

  function selectPipelineModel(slot, model) {
    if (slot === 1) {
      pipelineModel1 = model;
      pipelineMenu1.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.toggle("selected", item.dataset.model === model);
      });
      const m = MODELS.find(x => x.model === model);
      if (m && pipelineName1) {
        pipelineName1.textContent = m.name;
        if (pipelineIcon1) pipelineIcon1.innerHTML = (FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || "";
      }
      pipelineMenuOpen1 = false;
      pipelineMenu1.classList.remove("open");
      if (pipelineTrigger1) pipelineTrigger1.classList.remove("open");
    } else {
      pipelineModel2 = model;
      pipelineMenu2.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.toggle("selected", item.dataset.model === model);
      });
      const m = MODELS.find(x => x.model === model);
      if (m && pipelineName2) {
        pipelineName2.textContent = m.name;
        if (pipelineIcon2) pipelineIcon2.innerHTML = (FAMILY_ICONS[m.family] && FAMILY_ICONS[m.family]()) || "";
      }
      pipelineMenuOpen2 = false;
      pipelineMenu2.classList.remove("open");
      if (pipelineTrigger2) pipelineTrigger2.classList.remove("open");
    }
    notify();
  }

  function renderBars(container, value) {
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div");
      bar.className = "bar" + (i < value ? " on" : "");
      container.appendChild(bar);
    }
  }

  function getMaxEffort(modelId) {
  const m = MODELS.find((x) => x.model === modelId);
  if (!m || m.efforts.length === 0) return null;
  return m.efforts[m.efforts.length - 1];
}

function notify() {
  chrome.storage.local.get(["modelEfforts"], (data) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "UPDATE_SETTINGS",
        model: selectedModel,
        effort: currentEffort,
        modelEfforts: data.modelEfforts || {},
        pipelineEnabled: pipelineEnabled,
        pipelineModel1: pipelineModel1,
        pipelineModel2: pipelineModel2,
        pipelineModel1Effort: getMaxEffort(pipelineModel1),
        pipelineModel2Effort: getMaxEffort(pipelineModel2),
      });
    });
  });
}

  function checkStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0] || !statusDot || !statusText) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "PING" }, resp => {
        if (chrome.runtime.lastError || !resp) {
          statusDot.classList.add("off");
          statusText.textContent = "Reload Notion page";
        } else {
          statusDot.classList.remove("off");
          statusText.textContent = "Active — " + (resp.interceptCount || 0) + " intercepted";
        }
      });
    });
  }

  chrome.storage.local.get(
    ["selectedModel", "selectedEffort", "activePreset", "stats", "pipelineEnabled", "pipelineModel1", "pipelineModel2"],
    data => {
      if (data.selectedModel) selectedModel = data.selectedModel;
      if (data.selectedEffort) currentEffort = data.selectedEffort;
      if (data.activePreset) {
        activePreset = data.activePreset;
        document.querySelectorAll(".preset-btn").forEach(b => b.classList.toggle("active", b.dataset.preset === activePreset));
      }
      if (data.pipelineEnabled !== undefined) pipelineEnabled = data.pipelineEnabled;
      if (data.pipelineModel1) pipelineModel1 = data.pipelineModel1;
      if (data.pipelineModel2) pipelineModel2 = data.pipelineModel2;
      if (data.stats) {
        if (statRequests) statRequests.textContent = data.stats.requests || 0;
        if (statSwaps) statSwaps.textContent = data.stats.swaps || 0;
      }
      selectModel(selectedModel);
      if (pipelineToggle) pipelineToggle.checked = pipelineEnabled;
      if (pipelineModels) pipelineModels.style.display = pipelineEnabled ? "block" : "none";
      if (pipelineName1) {
        const m1 = MODELS.find(x => x.model === pipelineModel1);
        if (m1) {
          pipelineName1.textContent = m1.name;
          if (pipelineIcon1) pipelineIcon1.innerHTML = (FAMILY_ICONS[m1.family] && FAMILY_ICONS[m1.family]()) || "";
        }
      }
      if (pipelineName2) {
        const m2 = MODELS.find(x => x.model === pipelineModel2);
        if (m2) {
          pipelineName2.textContent = m2.name;
          if (pipelineIcon2) pipelineIcon2.innerHTML = (FAMILY_ICONS[m2.family] && FAMILY_ICONS[m2.family]()) || "";
        }
      }
      checkStatus();
    }
  );

  if (effortGroup) {
    effortGroup.addEventListener("click", e => {
      const btn = e.target.closest(".effort-btn");
      if (!btn || btn.style.pointerEvents === "none") return;
      currentEffort = btn.dataset.effort;
      activePreset = null;
      document.querySelectorAll(".effort-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      chrome.storage.local.set({ selectedEffort: currentEffort, activePreset: null, modelEfforts: {} });
      notify();
    });
  }

  const presetGroup = document.getElementById("preset-group");
  if (presetGroup) {
    presetGroup.addEventListener("click", e => {
      const btn = e.target.closest(".preset-btn");
      if (!btn) return;
      const preset = btn.dataset.preset;
      activePreset = preset;
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.toggle("active", b === btn));

      const modelEfforts = {};
      MODELS.forEach(m => {
        if (m.efforts.length === 0) { modelEfforts[m.model] = null; return; }
        switch (preset) {
          case "max":
            modelEfforts[m.model] = m.efforts.includes("max") ? "max" : m.efforts[m.efforts.length - 1];
            break;
          case "high":
            modelEfforts[m.model] = m.efforts.includes("high") ? "high" : m.efforts[m.efforts.length - 1];
            break;
          case "balanced":
            modelEfforts[m.model] = m.efforts.includes("medium") ? "medium" : m.efforts[0];
            break;
          case "low":
            modelEfforts[m.model] = m.efforts.includes("low") ? "low" : m.efforts[0];
            break;
        }
      });

      const currentModelEffort = modelEfforts[selectedModel];
      if (currentModelEffort) {
        currentEffort = currentModelEffort;
        document.querySelectorAll(".effort-btn").forEach(b => b.classList.toggle("active", b.dataset.effort === currentEffort));
      }

      chrome.storage.local.set({ activePreset: preset, modelEfforts, selectedEffort: currentEffort });
      notify();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      chrome.storage.local.remove(
        ["selectedModel", "selectedEffort", "modelEfforts", "activePreset", "pipelineEnabled", "pipelineModel1", "pipelineModel2"],
        () => {
          currentEffort = "medium";
          activePreset = null;
          pipelineEnabled = false;
          pipelineModel1 = "gingerbread";
          pipelineModel2 = "almond-croissant-low";
          document.querySelectorAll(".effort-btn").forEach(b => b.classList.toggle("active", b.dataset.effort === "medium"));
          document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
          if (pipelineToggle) pipelineToggle.checked = false;
          if (pipelineModels) pipelineModels.style.display = "none";
          selectModel("almond-croissant-low");
          if (pipelineName1) {
            const m1 = MODELS.find(x => x.model === pipelineModel1);
            if (m1) pipelineName1.textContent = m1.name;
          }
          if (pipelineName2) {
            const m2 = MODELS.find(x => x.model === pipelineModel2);
            if (m2) pipelineName2.textContent = m2.name;
          }
        }
      );
    });
  }

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "STATS_UPDATE") {
      if (statRequests) statRequests.textContent = msg.requests || 0;
      if (statSwaps) statSwaps.textContent = msg.swaps || 0;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
if (document.readyState !== "loading") init();
