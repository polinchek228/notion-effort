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
  { model: "anthropic-haiku-4.5", name: "Haiku 4.5", family: "anthropic", efforts: [], speed: 5, intelligence: 2, cost: 2 },
  { model: "vertex-gemini-3.5-flash", name: "Gemini 3.5 Flash", family: "gemini", efforts: ["low", "medium", "high"], speed: 5, intelligence: 3, cost: 3 },
  { model: "galette-medium-thinking", name: "Gemini 3.1 Pro", family: "gemini", efforts: ["low", "medium"], speed: 3, intelligence: 4, cost: 3 },
  { model: "gingerbread", name: "Gemini 3 Flash", family: "gemini", efforts: [], speed: 5, intelligence: 2, cost: 2 },
  { model: "xigua-mochi-medium", name: "Grok 4.3", family: "xai", efforts: ["low", "medium", "high"], speed: 3, intelligence: 5, cost: 4 },
  { model: "strawberry-whoopiepie", name: "SpaceXAI 4.5", family: "xai", efforts: ["low", "medium", "high"], speed: 3, intelligence: 5, cost: 4 },
  { model: "xinomavro-cake", name: "Grok Build 0.1", family: "xai", efforts: [], speed: 3, intelligence: 5, cost: 4 },
  { model: "fireworks-kimi-k2.6", name: "Kimi K2.6", family: "mystery", efforts: [], speed: 5, intelligence: 4, cost: 2 },
  { model: "fireworks-kimi-k2.7", name: "Kimi K2.7 Code", family: "mystery", efforts: [], speed: 5, intelligence: 4, cost: 2 },
  { model: "baseten-deepseek-v4-pro", name: "DeepSeek V4 Pro", family: "mystery", efforts: [], speed: 3, intelligence: 5, cost: 4 },
  { model: "baseten-glm-5.2", name: "GLM 5.2", family: "mystery", efforts: [], speed: 3, intelligence: 5, cost: 3 },
];

let currentEffort = "medium";

function init() {
  const modelSelect = document.getElementById("model-select");
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

  if (!modelSelect) return;

  MODELS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.model;
    opt.textContent = m.name + (m.restricted ? " *" : "");
    modelSelect.appendChild(opt);
  });

  function renderBars(container, value) {
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div");
      bar.className = "bar" + (i < value ? " on" : "");
      container.appendChild(bar);
    }
  }

  function update() {
    const m = MODELS.find(x => x.model === modelSelect.value);
    if (!m) return;
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

  function notify() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "UPDATE_SETTINGS",
        model: modelSelect.value,
        effort: currentEffort
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

  chrome.storage.local.get(["selectedModel", "selectedEffort", "stats"], data => {
    if (data.selectedModel) modelSelect.value = data.selectedModel;
    if (data.selectedEffort) currentEffort = data.selectedEffort;
    if (data.stats) {
      if (statRequests) statRequests.textContent = data.stats.requests || 0;
      if (statSwaps) statSwaps.textContent = data.stats.swaps || 0;
    }
    update();
    checkStatus();
  });

  modelSelect.addEventListener("change", () => {
    chrome.storage.local.set({ selectedModel: modelSelect.value });
    update();
    notify();
  });

  if (effortGroup) {
    effortGroup.addEventListener("click", e => {
      const btn = e.target.closest(".effort-btn");
      if (!btn || btn.style.pointerEvents === "none") return;
      currentEffort = btn.dataset.effort;
      document.querySelectorAll(".effort-btn").forEach(b => b.classList.toggle("active", b === btn));
      chrome.storage.local.set({ selectedEffort: currentEffort });
      notify();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      chrome.storage.local.remove(["selectedModel", "selectedEffort"], () => {
        modelSelect.value = "almond-croissant-low";
        currentEffort = "medium";
        update();
        notify();
      });
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
